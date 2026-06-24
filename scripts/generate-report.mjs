#!/usr/bin/env node
/**
 * generate-report.mjs
 *
 * Reads the aggregate JSON produced by run-duration.mjs and generates
 * a self-contained HTML performance report with charts and tables.
 *
 * Usage:
 *   node scripts/generate-report.mjs
 *   node scripts/generate-report.mjs --input perf-results/aggregate-results.json --output perf-results/report.html
 *
 * Environment variables (alternative to flags):
 *   INPUT_FILE=perf-results/aggregate-results.json
 *   OUTPUT_FILE=perf-results/report.html
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

// ─── Key transactions to highlight in the dedicated table ────────────────────
const KEY_TRANSACTIONS = [
  'sign-in',
  'clients-list-load',
  'create-new-client',
  'search-client-by-id',
  'confirm-trip-booking',
  'navigate-to-messages',
  'send-message',
];

// ─── Parse CLI Arguments ──────────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    input: process.env.INPUT_FILE || 'perf-results/aggregate-results.json',
    output: process.env.OUTPUT_FILE || 'perf-results/report.html',
  };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--input' && args[i + 1]) result.input = args[++i];
    else if (args[i] === '--output' && args[i + 1]) result.output = args[++i];
  }
  return result;
}

// ─── Statistics helpers ───────────────────────────────────────────────────────
function avg(arr) {
  return arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length;
}
function min(arr) { return arr.length === 0 ? 0 : Math.min(...arr); }
function max(arr) { return arr.length === 0 ? 0 : Math.max(...arr); }
function p75(arr) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil(0.75 * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}
function stddev(arr) {
  if (arr.length < 2) return 0;
  const mean = avg(arr);
  return Math.sqrt(arr.reduce((sum, v) => sum + (v - mean) ** 2, 0) / arr.length);
}
function fmt(n) { return typeof n === 'number' ? n.toFixed(1) : '—'; }

// ─── Build statistics per action ─────────────────────────────────────────────
function buildActionStats(allTimings) {
  /** Group durations by action name */
  const byAction = {};
  for (const t of allTimings) {
    if (!byAction[t.action]) byAction[t.action] = [];
    byAction[t.action].push(t.duration);
  }

  return Object.entries(byAction).map(([action, durations]) => ({
    action,
    count: durations.length,
    avg: avg(durations),
    min: min(durations),
    max: max(durations),
    p75: p75(durations),
    stddev: stddev(durations),
    slowCount: durations.filter((d) => d > 300).length,
  }));
}

// ─── Build per-iteration summary ─────────────────────────────────────────────
function buildIterationSummary(iterations) {
  return iterations.map((it) => {
    const durations = (it.timings ?? []).map((t) => t.duration);
    return {
      iteration: it.iteration,
      passed: it.passed,
      durationMs: it.durationMs,
      avgRender: avg(durations),
      maxRender: max(durations),
      timingCount: durations.length,
      startedAt: it.startedAt,
    };
  });
}

// ─── Trend data: avg render per iteration ────────────────────────────────────
function buildTrendData(iterSummaries) {
  return {
    labels: iterSummaries.map((it) => `Iter ${it.iteration}`),
    avgRender: iterSummaries.map((it) => parseFloat(it.avgRender.toFixed(2))),
    maxRender: iterSummaries.map((it) => parseFloat(it.maxRender.toFixed(2))),
    passed: iterSummaries.map((it) => it.passed),
  };
}

// ─── Color helpers ────────────────────────────────────────────────────────────
function perfColor(ms) {
  if (ms <= 100) return '#22c55e';   // green
  if (ms <= 300) return '#f59e0b';   // amber
  if (ms <= 800) return '#ef4444';   // red
  return '#7c3aed';                  // purple (very slow)
}

function statusBadge(passed) {
  return passed
    ? '<span class="badge pass">PASS</span>'
    : '<span class="badge fail">FAIL</span>';
}

// ─── HTML Template ────────────────────────────────────────────────────────────
function buildHTML(data, actionStats, iterSummaries, trendData) {
  const totalIterations = data.iterations.length;
  const passedCount = data.iterations.filter((i) => i.passed).length;
  const failedCount = totalIterations - passedCount;
  const allDurations = data.allTimings.map((t) => t.duration);
  const overallAvg = avg(allDurations);
  const overallMax = max(allDurations);
  const overallMin = min(allDurations);
  const overallP75 = p75(allDurations);
  const allNavTimings = data.allNavTimings ?? [];
  const avgDCL = avg(allNavTimings.map((n) => n.domContentLoaded));
  const avgTTFB = avg(allNavTimings.map((n) => n.firstByte));
  const avgLoad = avg(allNavTimings.map((n) => n.loadEvent));

  // ── Key Transactions table rows ──────────────────────────────────────────
  const keyStats = KEY_TRANSACTIONS.map((txName) => {
    const stat = actionStats.find((s) => s.action === txName);
    if (!stat) {
      return `
      <tr>
        <td class="action-name">${txName}</td>
        <td colspan="7" style="color:#475569;font-style:italic">No data collected</td>
      </tr>`;
    }
    const avgColor = perfColor(stat.avg);
    const p75Color = perfColor(stat.p75);
    const slowBadge = stat.slowCount > 0 ? `<span class="badge slow">${stat.slowCount} slow</span>` : '';
    return `
      <tr>
        <td class="action-name">${stat.action}</td>
        <td>${stat.count}</td>
        <td style="color:${avgColor};font-weight:600">${fmt(stat.avg)}</td>
        <td>${fmt(stat.min)}</td>
        <td>${fmt(stat.max)}</td>
        <td style="color:${p75Color};font-weight:600">${fmt(stat.p75)}</td>
        <td>${fmt(stat.stddev)}</td>
        <td>${slowBadge || '—'}</td>
      </tr>`;
  }).join('');

  // ── Key Transactions chart data ──────────────────────────────────────────
  const keyStatsForChart = KEY_TRANSACTIONS.map((txName) => {
    const stat = actionStats.find((s) => s.action === txName);
    return stat || { action: txName, avg: 0, p75: 0, max: 0 };
  });
  const keyChartData = JSON.stringify({
    labels: keyStatsForChart.map((s) => s.action),
    avg: keyStatsForChart.map((s) => parseFloat((s.avg || 0).toFixed(2))),
    p75: keyStatsForChart.map((s) => parseFloat((s.p75 || 0).toFixed(2))),
    max: keyStatsForChart.map((s) => parseFloat((s.max || 0).toFixed(2))),
  });

  // ── All-actions table rows ───────────────────────────────────────────────
  const actionRows = actionStats.map((s) => {
    const avgColor = perfColor(s.avg);
    const p75Color = perfColor(s.p75);
    const slowBadge = s.slowCount > 0 ? `<span class="badge slow">${s.slowCount} slow</span>` : '';
    return `
      <tr>
        <td class="action-name">${s.action}</td>
        <td>${s.count}</td>
        <td style="color:${avgColor};font-weight:600">${fmt(s.avg)}</td>
        <td>${fmt(s.min)}</td>
        <td>${fmt(s.max)}</td>
        <td style="color:${p75Color};font-weight:600">${fmt(s.p75)}</td>
        <td>${fmt(s.stddev)}</td>
        <td>${slowBadge || '—'}</td>
      </tr>`;
  }).join('');

  // Iteration table rows
  const iterRows = iterSummaries.map((it) => `
    <tr class="${it.passed ? '' : 'row-fail'}">
      <td>${it.iteration}</td>
      <td>${statusBadge(it.passed)}</td>
      <td>${(it.durationMs / 1000).toFixed(1)}s</td>
      <td>${fmt(it.avgRender)}</td>
      <td>${fmt(it.maxRender)}</td>
      <td>${it.timingCount}</td>
      <td class="small-text">${new Date(it.startedAt).toLocaleTimeString()}</td>
    </tr>`).join('');

  // Chart.js data as JSON string
  const trendJson = JSON.stringify(trendData);
  const actionChartData = JSON.stringify({
    labels: actionStats.map((s) => s.action),
    avg: actionStats.map((s) => parseFloat(s.avg.toFixed(2))),
    p75: actionStats.map((s) => parseFloat(s.p75.toFixed(2))),
    max: actionStats.map((s) => parseFloat(s.max.toFixed(2))),
  });

  const navRows = allNavTimings.length === 0 ? '<tr><td colspan="4">No navigation timing data collected</td></tr>' : `
    <tr><td>Avg DOM Content Loaded</td><td>${fmt(avgDCL)} ms</td></tr>
    <tr><td>Avg Time to First Byte (TTFB)</td><td>${fmt(avgTTFB)} ms</td></tr>
    <tr><td>Avg Load Event</td><td>${fmt(avgLoad)} ms</td></tr>
    <tr><td>Samples</td><td>${allNavTimings.length}</td></tr>
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Performance Report — ${data.spec}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    /* ── Reset & Base ──────────────────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; }

    /* ── Layout ────────────────────────────────────────────── */
    .container { max-width: 1400px; margin: 0 auto; padding: 2rem 1.5rem; }

    /* ── Header ────────────────────────────────────────────── */
    .header { background: linear-gradient(135deg, #1e3a5f 0%, #1e293b 100%); border-radius: 12px; padding: 2rem; margin-bottom: 2rem; border: 1px solid #334155; }
    .header h1 { font-size: 1.75rem; font-weight: 700; color: #f1f5f9; margin-bottom: 0.5rem; }
    .header .subtitle { color: #94a3b8; font-size: 0.95rem; }
    .header .meta { display: flex; gap: 2rem; margin-top: 1.5rem; flex-wrap: wrap; }
    .header .meta-item { display: flex; flex-direction: column; gap: 0.25rem; }
    .header .meta-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
    .header .meta-value { font-size: 1rem; font-weight: 600; color: #e2e8f0; }

    /* ── KPI Cards ─────────────────────────────────────────── */
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .kpi-card { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .kpi-card .kpi-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
    .kpi-card .kpi-value { font-size: 1.75rem; font-weight: 700; }
    .kpi-card .kpi-sub { font-size: 0.8rem; color: #94a3b8; }
    .kpi-green { color: #22c55e; }
    .kpi-amber { color: #f59e0b; }
    .kpi-red { color: #ef4444; }
    .kpi-blue { color: #38bdf8; }
    .kpi-purple { color: #a78bfa; }

    /* ── Sections ───────────────────────────────────────────── */
    .section { background: #1e293b; border: 1px solid #334155; border-radius: 10px; margin-bottom: 2rem; overflow: hidden; }
    .section-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid #334155; display: flex; align-items: center; gap: 0.75rem; }
    .section-header h2 { font-size: 1.05rem; font-weight: 600; color: #f1f5f9; }
    .section-icon { font-size: 1.25rem; }

    /* ── Key transactions section accent ───────────────────── */
    .section.key-tx { border-color: #0ea5e9; }
    .section.key-tx .section-header { background: linear-gradient(90deg, #0c2a3a 0%, #1e293b 100%); border-bottom-color: #0ea5e9; }
    .section.key-tx .section-header h2 { color: #7dd3fc; }

    /* ── Charts ────────────────────────────────────────────── */
    .chart-wrapper { padding: 1.5rem; position: relative; }
    .chart-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
    @media (max-width: 900px) { .chart-row { grid-template-columns: 1fr; } }
    canvas { max-height: 320px; }

    /* ── Tables ────────────────────────────────────────────── */
    .table-wrapper { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    thead th { background: #0f172a; color: #94a3b8; padding: 0.75rem 1rem; text-align: left; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; position: sticky; top: 0; }
    tbody td { padding: 0.75rem 1rem; border-bottom: 1px solid #1e293b; vertical-align: middle; }
    tbody tr:hover td { background: #0f172a33; }
    tbody tr:last-child td { border-bottom: none; }
    .action-name { font-family: 'Cascadia Code', 'Fira Code', monospace; font-size: 0.8rem; color: #7dd3fc; max-width: 280px; word-break: break-all; }
    .small-text { font-size: 0.78rem; color: #64748b; }
    .row-fail td { background: #450a0a22; }

    /* ── Badges ────────────────────────────────────────────── */
    .badge { display: inline-flex; align-items: center; padding: 0.15rem 0.5rem; border-radius: 999px; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.03em; }
    .badge.pass { background: #14532d33; color: #86efac; border: 1px solid #166534; }
    .badge.fail { background: #450a0a33; color: #fca5a5; border: 1px solid #7f1d1d; }
    .badge.slow { background: #78350f33; color: #fcd34d; border: 1px solid #92400e; }

    /* ── Nav timing mini-table ─────────────────────────────── */
    .nav-table td:first-child { color: #94a3b8; width: 60%; }
    .nav-table td:last-child { font-weight: 600; color: #e2e8f0; }

    /* ── Footer ─────────────────────────────────────────────── */
    .footer { text-align: center; padding: 2rem; color: #475569; font-size: 0.8rem; }
  </style>
</head>
<body>
<div class="container">

  <!-- ── Header ──────────────────────────────────────────────────────── -->
  <div class="header">
    <h1>⚡ Aggregate Performance Report</h1>
    <div class="subtitle">${data.spec}</div>
    <div class="meta">
      <div class="meta-item">
        <span class="meta-label">Started</span>
        <span class="meta-value">${new Date(data.startedAt).toLocaleString()}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Finished</span>
        <span class="meta-value">${new Date(data.finishedAt ?? data.startedAt).toLocaleString()}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Configured Duration</span>
        <span class="meta-value">${data.durationMinutes} minutes</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Generated</span>
        <span class="meta-value">${new Date().toLocaleString()}</span>
      </div>
    </div>
  </div>

  <!-- ── KPI Cards ───────────────────────────────────────────────────── -->
  <div class="kpi-grid">
    <div class="kpi-card">
      <span class="kpi-label">Total Iterations</span>
      <span class="kpi-value kpi-blue">${totalIterations}</span>
      <span class="kpi-sub">test runs</span>
    </div>
    <div class="kpi-card">
      <span class="kpi-label">Passed</span>
      <span class="kpi-value kpi-green">${passedCount}</span>
      <span class="kpi-sub">${totalIterations > 0 ? ((passedCount / totalIterations) * 100).toFixed(0) : 0}% success rate</span>
    </div>
    <div class="kpi-card">
      <span class="kpi-label">Failed</span>
      <span class="kpi-value ${failedCount > 0 ? 'kpi-red' : 'kpi-green'}">${failedCount}</span>
      <span class="kpi-sub">iterations with errors</span>
    </div>
    <div class="kpi-card">
      <span class="kpi-label">Avg Render Time</span>
      <span class="kpi-value ${overallAvg <= 300 ? 'kpi-green' : overallAvg <= 800 ? 'kpi-amber' : 'kpi-red'}">${fmt(overallAvg)}</span>
      <span class="kpi-sub">ms across all actions</span>
    </div>
    <div class="kpi-card">
      <span class="kpi-label">P75 Render Time</span>
      <span class="kpi-value ${overallP75 <= 300 ? 'kpi-green' : overallP75 <= 800 ? 'kpi-amber' : 'kpi-red'}">${fmt(overallP75)}</span>
      <span class="kpi-sub">ms (75th percentile)</span>
    </div>
    <div class="kpi-card">
      <span class="kpi-label">Max Render Time</span>
      <span class="kpi-value kpi-red">${fmt(overallMax)}</span>
      <span class="kpi-sub">ms (worst single action)</span>
    </div>
    <div class="kpi-card">
      <span class="kpi-label">Min Render Time</span>
      <span class="kpi-value kpi-green">${fmt(overallMin)}</span>
      <span class="kpi-sub">ms (best single action)</span>
    </div>
    <div class="kpi-card">
      <span class="kpi-label">Total Measurements</span>
      <span class="kpi-value kpi-purple">${data.allTimings.length}</span>
      <span class="kpi-sub">action timing samples</span>
    </div>
  </div>

  <!-- ── Key Transactions ────────────────────────────────────────────── -->
  <div class="section key-tx">
    <div class="section-header">
      <span class="section-icon">🎯</span>
      <h2>Key Transaction Performance (Avg vs P75)</h2>
    </div>
    <div class="chart-wrapper">
      <canvas id="keyTxChart" style="max-height:280px"></canvas>
    </div>
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Transaction</th>
            <th>Samples</th>
            <th>Avg (ms)</th>
            <th>Min (ms)</th>
            <th>Max (ms)</th>
            <th>P75 (ms)</th>
            <th>StdDev (ms)</th>
            <th>Slow (>300ms)</th>
          </tr>
        </thead>
        <tbody>
          ${keyStats}
        </tbody>
      </table>
    </div>
  </div>

  <!-- ── Charts row ──────────────────────────────────────────────────── -->
  <div class="chart-row">
    <!-- Trend chart: avg render per iteration -->
    <div class="section">
      <div class="section-header">
        <span class="section-icon">📈</span>
        <h2>Render Time Trend (Per Iteration)</h2>
      </div>
      <div class="chart-wrapper">
        <canvas id="trendChart"></canvas>
      </div>
    </div>

    <!-- Action avg bar chart -->
    <div class="section">
      <div class="section-header">
        <span class="section-icon">📊</span>
        <h2>Per-Action Avg vs P75 (ms)</h2>
      </div>
      <div class="chart-wrapper">
        <canvas id="actionChart"></canvas>
      </div>
    </div>
  </div>

  <!-- ── Per-Action Statistics ────────────────────────────────────────── -->
  <div class="section">
    <div class="section-header">
      <span class="section-icon">🔍</span>
      <h2>Per-Action Statistics (all iterations aggregated)</h2>
    </div>
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Action</th>
            <th>Samples</th>
            <th>Avg (ms)</th>
            <th>Min (ms)</th>
            <th>Max (ms)</th>
            <th>P75 (ms)</th>
            <th>StdDev (ms)</th>
            <th>Slow (>300ms)</th>
          </tr>
        </thead>
        <tbody>
          ${actionRows}
        </tbody>
      </table>
    </div>
  </div>

  <!-- ── Per-Iteration Summary ────────────────────────────────────────── -->
  <div class="section">
    <div class="section-header">
      <span class="section-icon">🔄</span>
      <h2>Per-Iteration Summary</h2>
    </div>
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Status</th>
            <th>Duration</th>
            <th>Avg Render (ms)</th>
            <th>Max Render (ms)</th>
            <th>Timings</th>
            <th>Started At</th>
          </tr>
        </thead>
        <tbody>
          ${iterRows}
        </tbody>
      </table>
    </div>
  </div>

  <!-- ── Navigation Timing ───────────────────────────────────────────── -->
  <div class="section">
    <div class="section-header">
      <span class="section-icon">🌐</span>
      <h2>Navigation Timing (averaged over ${allNavTimings.length} page loads)</h2>
    </div>
    <div class="chart-wrapper">
      <table class="nav-table" style="max-width:500px">
        <tbody>
          ${navRows}
        </tbody>
      </table>
    </div>
  </div>

  <div class="footer">
    Report generated by <strong>generate-report.mjs</strong> on ${new Date().toLocaleString()} &nbsp;|&nbsp;
    Playwright Duration-Based Performance Runner
  </div>

</div><!-- /container -->

<script>
// ── Key Transactions Chart ────────────────────────────────────────────────────
(function() {
  const data = ${keyChartData};
  const ctx = document.getElementById('keyTxChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [
        {
          label: 'Avg (ms)',
          data: data.avg,
          backgroundColor: data.avg.map(v => v <= 100 ? '#22c55e80' : v <= 300 ? '#f59e0b80' : '#ef444480'),
          borderColor: data.avg.map(v => v <= 100 ? '#22c55e' : v <= 300 ? '#f59e0b' : '#ef4444'),
          borderWidth: 1,
        },
        {
          label: 'P75 (ms)',
          data: data.p75,
          backgroundColor: '#0ea5e940',
          borderColor: '#0ea5e9',
          borderWidth: 1,
        },
        {
          label: 'Max (ms)',
          data: data.max,
          backgroundColor: '#a78bfa30',
          borderColor: '#a78bfa',
          borderWidth: 1,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        x: { ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { color: '#1e293b' } },
        y: { ticks: { color: '#64748b', callback: v => v + 'ms' }, grid: { color: '#334155' } }
      },
      plugins: {
        legend: { labels: { color: '#94a3b8' } },
        tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.raw + 'ms' } }
      }
    }
  });
})();

// ── Trend Chart ──────────────────────────────────────────────────────────────
(function() {
  const trendData = ${trendJson};
  const ctx = document.getElementById('trendChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: trendData.labels,
      datasets: [
        {
          label: 'Avg Render (ms)',
          data: trendData.avgRender,
          borderColor: '#38bdf8',
          backgroundColor: '#38bdf820',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: trendData.passed.map(p => p ? '#22c55e' : '#ef4444'),
        },
        {
          label: 'Max Render (ms)',
          data: trendData.maxRender,
          borderColor: '#f59e0b',
          backgroundColor: 'transparent',
          borderDash: [5, 3],
          tension: 0.3,
          pointRadius: 3,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        x: { ticks: { color: '#64748b', maxRotation: 45 }, grid: { color: '#1e293b' } },
        y: { ticks: { color: '#64748b', callback: v => v + 'ms' }, grid: { color: '#334155' } }
      },
      plugins: {
        legend: { labels: { color: '#94a3b8' } },
        tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.raw + 'ms' } }
      }
    }
  });
})();

// ── Action Chart ─────────────────────────────────────────────────────────────
(function() {
  const data = ${actionChartData};
  const ctx = document.getElementById('actionChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [
        {
          label: 'Avg (ms)',
          data: data.avg,
          backgroundColor: data.avg.map(v => v <= 100 ? '#22c55e80' : v <= 300 ? '#f59e0b80' : '#ef444480'),
          borderColor: data.avg.map(v => v <= 100 ? '#22c55e' : v <= 300 ? '#f59e0b' : '#ef4444'),
          borderWidth: 1,
        },
        {
          label: 'P75 (ms)',
          data: data.p75,
          backgroundColor: '#38bdf840',
          borderColor: '#38bdf8',
          borderWidth: 1,
          type: 'bar',
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      indexAxis: 'y',
      scales: {
        x: { ticks: { color: '#64748b', callback: v => v + 'ms' }, grid: { color: '#334155' } },
        y: { ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { color: '#1e293b' } }
      },
      plugins: {
        legend: { labels: { color: '#94a3b8' } },
        tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.raw + 'ms' } }
      }
    }
  });
})();
</script>
</body>
</html>`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function main() {
  const { input, output } = parseArgs();
  const inputPath = resolve(projectRoot, input);
  const outputPath = resolve(projectRoot, output);

  if (!existsSync(inputPath)) {
    console.error(`\n[generate-report] Input file not found: ${inputPath}`);
    console.error('  Run the duration runner first:');
    console.error('  npm run perf:run -- --duration 5\n');
    process.exit(1);
  }

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║   Aggregate HTML Performance Report Generator    ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`  Input  : ${inputPath}`);
  console.log(`  Output : ${outputPath}\n`);

  const raw = readFileSync(inputPath, 'utf-8');
  const data = JSON.parse(raw);

  if (!data.iterations || data.iterations.length === 0) {
    console.error('[generate-report] No iterations found in input file. Nothing to report.');
    process.exit(1);
  }

  const actionStats    = buildActionStats(data.allTimings ?? []);
  const iterSummaries  = buildIterationSummary(data.iterations);
  const trendData      = buildTrendData(iterSummaries);

  const html = buildHTML(data, actionStats, iterSummaries, trendData);

  const dir = dirname(outputPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(outputPath, html, 'utf-8');

  console.log(`✅ Report generated: ${outputPath}`);
  console.log(`\n  Open in browser:`);
  console.log(`  start "${outputPath}"\n`);
}

main();
