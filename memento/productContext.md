# Product Context

## Why This Project Exists
Frontend performance is critical for React apps. Each user click triggers React's reconciliation, re-renders, and potentially network requests. Without measurement, slow renders go undetected until users complain.

This project provides a **zero-friction workflow**:
1. Open codegen → click through your app → get test code automatically
2. Wrap recorded actions in `measureRender()` helpers
3. Run tests → get per-click render durations, long task counts, CLS scores

## Problems It Solves
- **Blind spots in React rendering** — Identifies which clicks are slow (>300ms threshold)
- **Manual selector writing** — Eliminated via `playwright codegen`
- **One-off performance audits** — Replaced with repeatable, automated measurements
- **Report scatter** — Consolidated into a single JSON + HTML Playwright report

## How It Should Work

### Recording Flow
```
Developer → runs `npm run codegen` → Chrome opens → clicks through React app
         → Playwright Inspector generates selectors + actions automatically
         → Developer pastes actions into measureRender() wrappers in e2e.spec.ts
```

### Measurement Flow
```
Test starts → injectPerformanceObserver() hooks browser APIs
           → page.goto(BASE_URL) → navTiming captured
           → per action: markActionStart → click → waitForLoadState → markActionEnd
           → RenderTiming object collected (duration, longTasks, CLS, paint)
           → buildReport() + printReport() at end of test
           → JSON report attached to Playwright HTML report
```

## User Experience Goals
- **One command to record**: `npm run codegen`
- **One command to test**: `npm test`
- **One command for HTML report**: `npm run report`
- Clear console output with per-action timing during test run
- Flagged warnings for actions exceeding 300ms render threshold
