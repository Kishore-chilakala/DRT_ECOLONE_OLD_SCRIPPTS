import { Page } from '@playwright/test';

/**
 * PerformanceMark captures browser-side rendering timings for each user interaction.
 * It uses the browser's Navigation Timing API and PerformanceObserver to measure
 * React component render times after each user click.
 */

export interface RenderTiming {
  action: string;
  startTime: number;
  duration: number;
  longTaskCount: number;
  paintEntries: PaintEntry[];
  layoutShiftScore: number;
}

export interface PaintEntry {
  name: string;
  startTime: number;
}

export interface PerformanceReport {
  url: string;
  timings: RenderTiming[];
  navigationTiming: NavigationTimingSnapshot;
  summary: PerformanceSummary;
}

export interface NavigationTimingSnapshot {
  domContentLoaded: number;
  loadEvent: number;
  firstByte: number;
  dnsLookup: number;
  tcpConnect: number;
  request: number;
  response: number;
  domInteractive: number;
}

export interface PerformanceSummary {
  totalActions: number;
  averageRenderTime: number;
  maxRenderTime: number;
  minRenderTime: number;
  slowActions: string[];
}

/**
 * Injects a PerformanceObserver into the page that listens for:
 *  - longtasks       (JS blocking > 50ms)
 *  - layout-shift    (CLS shifts)
 *  - paint           (FP / FCP)
 *  - measure         (custom marks via performance.measure)
 *
 * Call this ONCE after page.goto() and before interactions start.
 */
export async function injectPerformanceObserver(page: Page): Promise<void> {
  await page.addInitScript(() => {
    // Attach a collector object on window so Playwright can read it later
    (window as any).__perfCollector = {
      longTasks: [] as PerformanceEntry[],
      layoutShifts: [] as PerformanceEntry[],
      paints: [] as PerformanceEntry[],
      measures: [] as PerformanceEntry[],
    };

    const collector = (window as any).__perfCollector;

    // Observe long tasks
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        collector.longTasks.push(...list.getEntries());
      });
      longTaskObserver.observe({ type: 'longtask', buffered: true });
    } catch (_) { /* not supported in all environments */ }

    // Observe layout shifts (CLS)
    try {
      const clsObserver = new PerformanceObserver((list) => {
        collector.layoutShifts.push(...list.getEntries());
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (_) { /* not supported */ }

    // Observe paint events (FP, FCP)
    try {
      const paintObserver = new PerformanceObserver((list) => {
        collector.paints.push(...list.getEntries());
      });
      paintObserver.observe({ type: 'paint', buffered: true });
    } catch (_) { /* not supported */ }

    // Observe custom performance.measure() calls
    try {
      const measureObserver = new PerformanceObserver((list) => {
        collector.measures.push(...list.getEntries());
      });
      measureObserver.observe({ type: 'measure', buffered: true });
    } catch (_) { /* not supported */ }
  });
}

/**
 * Marks the START of a user action in the browser's performance timeline.
 * Call this BEFORE the click/interaction.
 *
 * @param page      - Playwright Page instance
 * @param markName  - A unique label for this action (e.g. "click-login-button")
 */
export async function markActionStart(page: Page, markName: string): Promise<void> {
  await page.evaluate((name: string) => {
    performance.mark(`${name}-start`);
  }, markName);
}

/**
 * Marks the END of a user action and creates a performance.measure().
 * Call this AFTER the page has settled (e.g. after waitForLoadState or networkidle).
 *
 * @param page      - Playwright Page instance
 * @param markName  - Same label used in markActionStart
 * @returns         - Duration in milliseconds
 */
export async function markActionEnd(page: Page, markName: string): Promise<number> {
  try {
    const duration = await page.evaluate((name: string) => {
      performance.mark(`${name}-end`);
      try {
        performance.measure(name, `${name}-start`, `${name}-end`);
        const entries = performance.getEntriesByName(name, 'measure');
        return entries.length > 0 ? entries[entries.length - 1].duration : 0;
      } catch {
        return 0;
      }
    }, markName);
    return duration;
  } catch (err: any) {
    // Page navigated away or context was closed during/after the action.
    // This is expected for navigation-triggering steps in a SPA — return 0
    // so the timing is recorded as a no-op rather than crashing the test.
    const msg: string = err?.message ?? '';
    if (
      msg.includes('Target page, context or browser has been closed') ||
      msg.includes('Execution context was destroyed') ||
      msg.includes('Target closed') ||
      msg.includes('Session closed')
    ) {
      console.warn(`[PERF] markActionEnd skipped for "${markName}" — page navigated during action (context closed).`);
      return 0;
    }
    throw err; // re-throw unexpected errors
  }
}

/**
 * Collects all render timing data accumulated so far from the browser.
 */
export async function collectPerfData(page: Page): Promise<{
  longTaskCount: number;
  layoutShiftScore: number;
  paints: PaintEntry[];
  measures: Array<{ name: string; duration: number; startTime: number }>;
}> {
  return await page.evaluate(() => {
    const collector = (window as any).__perfCollector || {};

    const longTaskCount = (collector.longTasks || []).length;

    const layoutShiftScore = (collector.layoutShifts || []).reduce(
      (sum: number, entry: any) => sum + (entry.value || 0),
      0
    );

    const paints = (collector.paints || []).map((e: PerformanceEntry) => ({
      name: e.name,
      startTime: e.startTime,
    }));

    const measures = (collector.measures || []).map((e: PerformanceEntry) => ({
      name: e.name,
      duration: e.duration,
      startTime: e.startTime,
    }));

    return { longTaskCount, layoutShiftScore, paints, measures };
  });
}

/**
 * Convenience wrapper: marks start, executes the action callback, waits for
 * network/DOM to settle, then marks end and returns the render timing.
 *
 * @param page        - Playwright Page
 * @param actionName  - Human-readable action label
 * @param action      - Async callback that performs the click / interaction
 * @param waitFor     - What to wait for after the action ('networkidle' | 'load' | 'domcontentloaded' | 'commit')
 * @returns           - RenderTiming with duration and perf metrics
 */
export async function measureRender(
  page: Page,
  actionName: string,
  action: () => Promise<void>,
  waitFor: 'networkidle' | 'load' | 'domcontentloaded' = 'networkidle'
): Promise<RenderTiming> {
  await markActionStart(page, actionName);

  // Node-side wall-clock start — survives full-page navigations that destroy
  // browser performance marks (sign-in, page loads, menu navigations, etc.)
  const wallStart = performance.now();

  await action();

  // Wait for the page to settle after the interaction
  try {
    await page.waitForLoadState(waitFor, { timeout: 30_000 });
  } catch {
    // If networkidle times out (e.g. long-polling apps), continue anyway
  }

  const wallDuration = performance.now() - wallStart;

  // Browser-side measure — returns 0 when the page navigated away (context destroyed)
  const browserDuration = await markActionEnd(page, actionName);

  // Use wall-clock when browser returns 0 (navigation wiped the performance timeline)
  const duration = browserDuration > 0 ? browserDuration : wallDuration;

  const perfData = await collectPerfData(page);

  const timing: RenderTiming = {
    action: actionName,
    startTime: Date.now(),
    duration,
    longTaskCount: perfData.longTaskCount,
    paintEntries: perfData.paints,
    layoutShiftScore: perfData.layoutShiftScore,
  };

  console.log(
    `[PERF] ${actionName}: ${duration.toFixed(2)}ms | ` +
    `Long Tasks: ${perfData.longTaskCount} | ` +
    `CLS: ${perfData.layoutShiftScore.toFixed(4)}`
  );

  return timing;
}

/**
 * Gets the Navigation Timing snapshot for the current page load.
 * Call this right after page.goto() resolves.
 */
export async function getNavigationTiming(page: Page): Promise<NavigationTimingSnapshot> {
  return await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!nav) {
      return {
        domContentLoaded: 0,
        loadEvent: 0,
        firstByte: 0,
        dnsLookup: 0,
        tcpConnect: 0,
        request: 0,
        response: 0,
        domInteractive: 0,
      };
    }
    return {
      domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
      loadEvent: nav.loadEventEnd - nav.startTime,
      firstByte: nav.responseStart - nav.requestStart,
      dnsLookup: nav.domainLookupEnd - nav.domainLookupStart,
      tcpConnect: nav.connectEnd - nav.connectStart,
      request: nav.responseStart - nav.requestStart,
      response: nav.responseEnd - nav.responseStart,
      domInteractive: nav.domInteractive - nav.startTime,
    };
  });
}

/**
 * Builds a final human-readable performance report from all collected timings.
 */
export function buildReport(
  url: string,
  timings: RenderTiming[],
  navTiming: NavigationTimingSnapshot
): PerformanceReport {
  const durations = timings.map((t) => t.duration);
  const avg = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
  const max = durations.length > 0 ? Math.max(...durations) : 0;
  const min = durations.length > 0 ? Math.min(...durations) : 0;

  // Actions slower than 300ms are flagged as slow
  const slowActions = timings.filter((t) => t.duration > 300).map((t) => t.action);

  const summary: PerformanceSummary = {
    totalActions: timings.length,
    averageRenderTime: parseFloat(avg.toFixed(2)),
    maxRenderTime: parseFloat(max.toFixed(2)),
    minRenderTime: parseFloat(min.toFixed(2)),
    slowActions,
  };

  return { url, timings, navigationTiming: navTiming, summary };
}

/**
 * Prints a formatted performance report to the console.
 */
export function printReport(report: PerformanceReport): void {
  console.log('\n========================================');
  console.log('  FRONTEND RENDERING PERFORMANCE REPORT ');
  console.log('========================================');
  console.log(`URL: ${report.url}`);
  console.log('\n--- Navigation Timing ---');
  console.log(`  DOM Content Loaded : ${report.navigationTiming.domContentLoaded.toFixed(2)} ms`);
  console.log(`  Load Event         : ${report.navigationTiming.loadEvent.toFixed(2)} ms`);
  console.log(`  DOM Interactive    : ${report.navigationTiming.domInteractive.toFixed(2)} ms`);
  console.log(`  First Byte (TTFB)  : ${report.navigationTiming.firstByte.toFixed(2)} ms`);
  console.log('\n--- Per-Action Render Times ---');
  for (const t of report.timings) {
    const flag = t.duration > 300 ? ' ⚠️  SLOW' : '';
    console.log(
      `  [${t.action}]${flag}\n` +
      `    Duration      : ${t.duration.toFixed(2)} ms\n` +
      `    Long Tasks    : ${t.longTaskCount}\n` +
      `    CLS Score     : ${t.layoutShiftScore.toFixed(4)}\n`
    );
  }
  console.log('--- Summary ---');
  console.log(`  Total Actions    : ${report.summary.totalActions}`);
  console.log(`  Avg Render Time  : ${report.summary.averageRenderTime} ms`);
  console.log(`  Max Render Time  : ${report.summary.maxRenderTime} ms`);
  console.log(`  Min Render Time  : ${report.summary.minRenderTime} ms`);
  if (report.summary.slowActions.length > 0) {
    console.log(`  ⚠️  Slow Actions  : ${report.summary.slowActions.join(', ')}`);
  }
  console.log('========================================\n');
}
