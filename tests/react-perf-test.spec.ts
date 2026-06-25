import { test, expect } from '@playwright/test';
import {
  injectPerformanceObserver,
  measureRender,
  getNavigationTiming,
  buildReport,
  printReport,
  RenderTiming,
} from './helpers/perfHelper';

const BASE_URL = 'https://qa-react.ecolane.com';

/**
 * Future date label matching the React calendar widget accessible button name.
 * Example output: "Friday, June 20,"
 */
const futureDateLabel = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
  const month   = d.toLocaleDateString('en-US', { month: 'long' });
  return `${weekday}, ${month} ${d.getDate()},`;
};

test.describe('Ecolane React â€“ Trip Booking Flow (eco_eraju1)', { tag: ['@oldscripts'] }, () => {
  test('Login â†’ Clients â†’ Search â†’ New Trip â†’ Book â†’ Logout', async ({ page }) => {
    // Allow up to 3 minutes for the full end-to-end flow on a remote QA environment
    test.setTimeout(180_000);

    const timings: RenderTiming[] = [];

    // â”€â”€ Step 1: Inject PerformanceObserver before any navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    await injectPerformanceObserver(page);

    // â”€â”€ Step 2: Navigate to React DRT root (redirects to SSO login) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    await page.goto('https://qa-react.ecolane.com/drt/');
    await page.waitForLoadState('domcontentloaded');

    // Capture initial page Navigation Timing
    const navTiming = await getNavigationTiming(page);

    // â”€â”€ Step 3: Verify login form is visible â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t1 = await measureRender(page, 'login-form-visible', async () => {
      await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
    }, 'domcontentloaded');
    timings.push(t1);

    // â”€â”€ Step 4: Fill username â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t2 = await measureRender(page, 'fill-username', async () => {
      await page.getByRole('textbox', { name: 'Username' }).click();
      await page.getByRole('textbox', { name: 'Username' }).fill('eco_eraju1');
    }, 'domcontentloaded');
    timings.push(t2);

    // â”€â”€ Step 5: Fill password â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t3 = await measureRender(page, 'fill-password', async () => {
      await page.getByRole('textbox', { name: 'Password' }).click();
      await page.getByRole('textbox', { name: 'Password' }).fill('Ecolane#drt123');
    }, 'domcontentloaded');
    timings.push(t3);

    // â”€â”€ Step 6: Log in and verify main navigation is accessible â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t4 = await measureRender(page, 'log-in', async () => {
      await page.getByRole('button', { name: 'Log in' }).click();
      await expect(page.getByRole('link', { name: 'Clients' })).toBeVisible();
    }, 'domcontentloaded');
    timings.push(t4);

    await page.waitForTimeout(3000);

    // â”€â”€ Step 7: Navigate to Clients list â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t5 = await measureRender(page, 'navigate-to-clients', async () => {
      await page.getByRole('link', { name: 'Clients' }).click();
      await expect(page.getByRole('textbox', { name: 'Free text search' })).toBeVisible();
    }, 'domcontentloaded');
    timings.push(t5);

    await page.waitForTimeout(2000);

    // â”€â”€ Step 8: Search for client 28325 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t6 = await measureRender(page, 'search-client-28325', async () => {
      await page.getByRole('textbox', { name: 'Free text search' }).click();
      await page.getByRole('textbox', { name: 'Free text search' }).fill('28325');
      await page.getByRole('button', { name: 'Search', exact: true }).click();
      await expect(page.getByRole('button', { name: 'New trip' })).toBeVisible();
    }, 'domcontentloaded');
    timings.push(t6);

    await page.waitForTimeout(2000);

    // â”€â”€ Step 9: Open New Trip form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t7 = await measureRender(page, 'open-new-trip', async () => {
      await page.getByRole('button', { name: 'New trip' }).click();
      await expect(page.getByRole('button', { name: 'No date selected' })).toBeVisible();
    }, 'domcontentloaded');
    timings.push(t7);

    // â”€â”€ Step 10: Open calendar and select a future date â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const futureDateBtnLabel = futureDateLabel(3);
    const t8 = await measureRender(page, 'select-trip-date', async () => {
      await page.getByRole('button', { name: 'No date selected' }).click();
      const futureDateBtn = page.getByRole('button', { name: futureDateBtnLabel });
      if (await futureDateBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await futureDateBtn.click();
      } else {
        // Navigate to next month if the date falls outside the current view
        const nextMonthBtn = page.getByRole('button', { name: /next month/i });
        if (await nextMonthBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
          await nextMonthBtn.click();
        }
        await page.getByRole('button', { name: futureDateBtnLabel }).click();
      }
    }, 'domcontentloaded');
    timings.push(t8);

    // â”€â”€ Step 11: Fill trip time â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t9 = await measureRender(page, 'fill-trip-time', async () => {
      await page.getByRole('textbox', { name: 'Time *' }).click();
      await page.getByRole('textbox', { name: 'Time *' }).fill('1445');
    }, 'domcontentloaded');
    timings.push(t9);

    // â”€â”€ Step 12: Open pick-up address popup â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t10 = await measureRender(page, 'open-pickup-popup', async () => {
      await page.getByLabel('Pick-up').getByRole('button', { name: 'Toggle popup' }).click();
      await expect(page.getByText('Home address 10 Pine Hollow, Athens')).toBeVisible();
    }, 'domcontentloaded');
    timings.push(t10);

    // â”€â”€ Step 13: Select pick-up address â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t11 = await measureRender(page, 'select-pickup-address', async () => {
      await page.getByText('Home address 10 Pine Hollow, Athens').click();
    }, 'domcontentloaded');
    timings.push(t11);

    await page.waitForTimeout(1000);

    // â”€â”€ Step 14: Open drop-off address popup â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t12 = await measureRender(page, 'open-dropoff-popup', async () => {
      await page.getByLabel('Drop-off').getByRole('button', { name: 'Toggle popup' }).click();
      await expect(page.getByLabel('Drop-off').getByText('100 Hillside Street 100')).toBeVisible();
    }, 'domcontentloaded');
    timings.push(t12);

    // â”€â”€ Step 15: Select drop-off address â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t13 = await measureRender(page, 'select-dropoff-address', async () => {
      await page.getByLabel('Drop-off').getByText('100 Hillside Street 100').click();
    }, 'domcontentloaded');
    timings.push(t13);

    await page.waitForTimeout(1000);

    // â”€â”€ Step 16: Create trip â€“ triggers API call â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t14 = await measureRender(page, 'create-trip', async () => {
      await page.getByRole('button', { name: 'Create trip' }).click();
    }, 'domcontentloaded');
    timings.push(t14);

    await page.waitForTimeout(2000);

    // â”€â”€ Step 17: Navigate back to Administration â†’ Clients â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t15 = await measureRender(page, 'back-to-clients', async () => {
      await page.getByRole('button', { name: 'Administration' }).click();
      await page.getByRole('menuitem', { name: 'Clients' }).click();
      await expect(page.getByRole('textbox', { name: 'Free text search' })).toBeVisible();
    }, 'domcontentloaded');
    timings.push(t15);

    await page.waitForTimeout(2000);

    // â”€â”€ Step 18: Open user menu and log out â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t16 = await measureRender(page, 'log-out', async () => {
      // Try common logout patterns for the React app
      const logoutBtn = page.getByRole('button', { name: /log\s*out|sign\s*out/i }).first();
      const userMenuBtn = page.locator('[aria-label*="user" i], [data-testid*="user-menu" i]').first();
      if (await logoutBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await logoutBtn.click();
      } else if (await userMenuBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await userMenuBtn.click();
        await page.getByRole('menuitem', { name: /log\s*out|sign\s*out/i }).first().click();
      }
    }, 'domcontentloaded');
    timings.push(t16);

    await page.waitForTimeout(3000);

    // â”€â”€ Step 19: Build and print full performance report â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const report = buildReport(BASE_URL, timings, navTiming);
    printReport(report);

    // â”€â”€ Step 20: Attach report JSON to Playwright HTML report â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    await test.info().attach('performance-report.json', {
      body: JSON.stringify(report, null, 2),
      contentType: 'application/json',
    });

    // â”€â”€ Step 21: Performance assertion â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (report.summary.totalActions > 0) {
      expect(
        report.summary.averageRenderTime,
        `Average render time should be < 1000ms but was ${report.summary.averageRenderTime}ms`
      ).toBeLessThan(1000);
    }
  });
});

