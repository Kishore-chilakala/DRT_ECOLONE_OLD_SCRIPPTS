# Project Brief

## Project Name
Playwright React E2E Performance Testing Suite

## Purpose
Set up a Playwright-based end-to-end (E2E) test project that:
1. Records user flows on a React JS application using `playwright codegen`
2. Replays those flows in Chrome (Chromium)
3. Measures **frontend rendering times** for every user click/interaction using the browser's Performance API

## Core Requirements
- Use **Playwright** with **TypeScript**
- Target **Chromium** (Chrome-compatible) browser, headed mode
- Integrate **`playwright codegen`** for recording flows without writing selectors manually
- Measure per-click rendering times using:
  - `performance.mark()` / `performance.measure()` (Web Performance API)
  - `PerformanceObserver` for Long Tasks, Layout Shift (CLS), and Paint events
  - Navigation Timing API for initial page load metrics
- Output a structured **performance report** per test run
- Attach the JSON report to Playwright's HTML report

## Key Goals
- Quick setup: record first, then instrument performance
- Zero manual selector writing (use codegen)
- Console + HTML report with per-action render durations
- Configurable BASE_URL via environment variable

## Out of Scope
- React app source code (this project only tests it externally)
- CI/CD pipeline setup (future)
- Multi-browser testing (Chromium only for now)
