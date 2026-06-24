#!/usr/bin/env node
/**
 * run-duration.mjs
 *
 * Runs a Playwright spec file repeatedly for a configurable duration
 * and accumulates per-iteration performance results into a single
 * JSON file for aggregate reporting.
 *
 * Usage (PowerShell):
 *   node scripts/run-duration.mjs --spec tests/ecolane-trip-booking.spec.ts --duration 10
 *   node scripts/run-duration.mjs --spec tests/ecolane-trip-booking.spec.ts --duration 5 --output perf-results/run.json
 *   node scripts/run-duration.mjs --headed            (run with visible browser)
 *
 * Environment variables (alternative to flags):
 *   SPEC_FILE=tests/ecolane-trip-booking.spec.ts
 *   DURATION_MINUTES=10
 *   OUTPUT_FILE=perf-results/run.json
 *   HEADLESS=false   (same as --headed)
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

// ─── Parse CLI Arguments ──────────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    spec: process.env.SPEC_FILE || 'tests/ecolane-booking-new.spec.ts',
    duration: parseInt(process.env.DURATION_MINUTES || '5', 10),
    output: process.env.OUTPUT_FILE || 'perf-results/aggregate-results.json',
    headed: process.env.HEADLESS === 'false',
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--spec' && args[i + 1]) result.spec = args[++i];
    else if (args[i] === '--duration' && args[i + 1]) result.duration = parseInt(args[++i], 10);
    else if (args[i] === '--output' && args[i + 1]) result.output = args[++i];
    else if (args[i] === '--headed') result.headed = true;
    else if (args[i] === '--help') {
      console.log(`
Usage: node scripts/run-duration.mjs [options]

Options:
  --spec <path>       Path to the Playwright spec file (default: tests/ecolane-booking-new.spec.ts)
  --duration <mins>   How many minutes to run (default: 5)
  --output <path>     Output JSON file for aggregate results (default: perf-results/aggregate-results.json)
  --headed            Run with a visible browser window (default: headless)
  --help              Show this help message

Examples:
  node scripts/run-duration.mjs --spec tests/ecolane-booking-new.spec.ts --duration 10
  node scripts/run-duration.mjs --duration 2 --output perf-results/quick-run.json
  node scripts/run-duration.mjs --headed --duration 5
`);
      process.exit(0);
    }
  }
  return result;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ensureDir(filePath) {
  const dir = dirname(resolve(projectRoot, filePath));
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function readResultsJson(resultsJsonPath) {
  try {
    const raw = readFileSync(resultsJsonPath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function extractTimingsFromPlaywrightJson(pwJson) {
  /**
   * Playwright's JSON reporter produces:
   * {
   *   suites: [{ specs: [{ tests: [{ results: [{ attachments: [...] }] }] }] }]
   * }
   * We look for attachments named "performance-report.json"
   */
  const timings = [];
  const navTimings = [];
  const suites = pwJson?.suites ?? [];

  function walkSuites(suiteList) {
    for (const suite of suiteList) {
      for (const spec of suite.specs ?? []) {
        for (const test of spec.tests ?? []) {
          for (const result of test.results ?? []) {
            for (const attachment of result.attachments ?? []) {
              if (attachment.name === 'performance-report.json' && attachment.body) {
                try {
                  // Playwright JSON reporter base64-encodes attachment bodies
                  const decoded = Buffer.from(attachment.body, 'base64').toString('utf-8');
                  const report = JSON.parse(decoded);
                  if (report.timings) timings.push(...report.timings);
                  if (report.navigationTiming) navTimings.push(report.navigationTiming);
                } catch {
                  // ignore parse errors
                }
              }
            }
          }
        }
      }
      // Recurse into nested suites
      if (suite.suites) walkSuites(suite.suites);
    }
  }

  walkSuites(suites);
  return { timings, navTimings };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const { spec, duration, output, headed } = parseArgs();

  const durationMs = duration * 60 * 1000;
  const startTime = Date.now();
  const endTime = startTime + durationMs;
  const resultsJsonPath = resolve(projectRoot, 'test-results/results.json');
  const outputPath = resolve(projectRoot, output);

  ensureDir(output);

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║   Playwright Duration-Based Performance Runner   ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`  Spec     : ${spec}`);
  console.log(`  Duration : ${duration} minute(s)`);
  console.log(`  Output   : ${output}`);
  console.log(`  Mode     : ${headed ? '🖥  headed (visible browser)' : '🤖  headless'}`);
  console.log(`  Start    : ${new Date(startTime).toLocaleTimeString()}`);
  console.log(`  End      : ${new Date(endTime).toLocaleTimeString()}`);
  console.log('──────────────────────────────────────────────────\n');

  /** Accumulated data across all iterations */
  const aggregateData = {
    spec,
    durationMinutes: duration,
    startedAt: new Date(startTime).toISOString(),
    finishedAt: null,
    iterations: [],        // { iteration, passed, failed, timings, navTimings, startedAt, finishedAt }
    allTimings: [],        // flat array of every RenderTiming across all iterations
    allNavTimings: [],     // flat array of NavigationTimingSnapshots
  };

  let iteration = 0;

  while (Date.now() < endTime) {
    iteration++;
    const iterStart = Date.now();
    const iterStartIso = new Date(iterStart).toISOString();
    const remaining = Math.ceil((endTime - Date.now()) / 1000);

    console.log(`\n▶  Iteration ${iteration} | ~${remaining}s remaining`);
    console.log(`   Started at ${new Date(iterStart).toLocaleTimeString()}`);

    let passed = false;
    let errorMessage = '';

    try {
      // Run playwright test with dual reporters:
      //   line  → prints live progress to console
      //   json  → writes structured results to PLAYWRIGHT_JSON_OUTPUT_NAME
      const headedFlag = headed ? ' --headed' : '';
      execSync(
        `npx playwright test "${spec}" --reporter=line,json${headedFlag}`,
        {
          cwd: projectRoot,
          stdio: 'inherit',
          env: {
            ...process.env,
            // The json reporter writes to this file (relative to cwd)
            PLAYWRIGHT_JSON_OUTPUT_NAME: 'test-results/results.json',
          },
          timeout: 300_000, // max 5 min per single iteration
        }
      );
      passed = true;
    } catch (err) {
      // playwright test exits with non-zero when tests fail — that's expected
      // We still want to collect the results.json that was generated
      passed = false;
      errorMessage = err?.message?.split('\n')[0] ?? 'Unknown error';
      console.warn(`   ⚠️  Iteration ${iteration} had failures: ${errorMessage}`);
    }

    const iterEnd = Date.now();
    const iterEndIso = new Date(iterEnd).toISOString();

    // Read the results.json produced by this iteration
    const pwJson = readResultsJson(resultsJsonPath);
    const { timings, navTimings } = pwJson
      ? extractTimingsFromPlaywrightJson(pwJson)
      : { timings: [], navTimings: [] };

    const iterResult = {
      iteration,
      passed,
      errorMessage: passed ? '' : errorMessage,
      startedAt: iterStartIso,
      finishedAt: iterEndIso,
      durationMs: iterEnd - iterStart,
      timings,
      navTimings,
    };

    aggregateData.iterations.push(iterResult);
    aggregateData.allTimings.push(...timings);
    aggregateData.allNavTimings.push(...navTimings);

    const statusIcon = passed ? '✅' : '❌';
    console.log(`   ${statusIcon} Iteration ${iteration} complete in ${((iterEnd - iterStart) / 1000).toFixed(1)}s | Timings collected: ${timings.length}`);

    // Write intermediate results so they're not lost if the runner is killed
    aggregateData.finishedAt = iterEndIso;
    writeFileSync(outputPath, JSON.stringify(aggregateData, null, 2), 'utf-8');
  }

  aggregateData.finishedAt = new Date().toISOString();
  writeFileSync(outputPath, JSON.stringify(aggregateData, null, 2), 'utf-8');

  const totalPassed = aggregateData.iterations.filter((i) => i.passed).length;
  const totalFailed = aggregateData.iterations.filter((i) => !i.passed).length;

  console.log('\n══════════════════════════════════════════════════');
  console.log('  RUN COMPLETE');
  console.log('══════════════════════════════════════════════════');
  console.log(`  Total Iterations : ${iteration}`);
  console.log(`  Passed           : ${totalPassed}`);
  console.log(`  Failed           : ${totalFailed}`);
  console.log(`  Total Timings    : ${aggregateData.allTimings.length}`);
  console.log(`  Results saved to : ${outputPath}`);
  console.log('══════════════════════════════════════════════════\n');
  console.log('  Next step: node scripts/generate-report.mjs --input ' + output);
  console.log('         or: npm run perf:report\n');
}

main().catch((err) => {
  console.error('[run-duration] Fatal error:', err);
  process.exit(1);
});
