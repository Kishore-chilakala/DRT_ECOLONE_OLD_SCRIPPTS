# Active Context

## Current Work Focus
Initial project scaffolding — setting up the Playwright E2E performance testing project from scratch.

## What Was Just Done
1. Created `package.json` with all npm scripts
2. Created `tsconfig.json` with TypeScript configuration
3. Created `playwright.config.ts` — Chromium, headed, single-worker, HTML+JSON reporters
4. Created `tests/helpers/perfHelper.ts` — full Performance API measurement utility
5. Created `tests/e2e.spec.ts` — main test file with codegen integration guide
6. Created `scripts/codegen.ps1` — PowerShell launcher for `playwright codegen`
7. Created `.gitignore`
8. Installed npm dependencies: `@playwright/test`, `@types/node`, `typescript`
9. Running `npx playwright install chromium` to download browser binary

## Next Steps (for developer)
1. **Wait for Chromium install to finish** (Terminal 2)
2. **Start your React app dev server** (e.g. `npm start` in React project — separate terminal)
3. **Set BASE_URL** if not `localhost:3000`:
   ```powershell
   $env:BASE_URL = "http://localhost:YOUR_PORT"
   ```
4. **Run codegen** to record your user flow:
   ```powershell
   npm run codegen
   # or for saving directly to a file:
   npm run codegen:record
   # or use the PowerShell script with instructions:
   .\scripts\codegen.ps1
   ```
5. **Paste recorded actions** into `measureRender()` blocks in `tests/e2e.spec.ts`
6. **Run the test**: `npm test`
7. **View the HTML report**: `npm run report`

## Active Decisions
- `headless: false` chosen for realistic visual rendering measurement
- `workers: 1` to eliminate CPU noise from parallel test runs
- `networkidle` as default wait strategy — appropriate for React apps with async data fetches
- Slow threshold set to **300ms** per action (configurable in `perfHelper.ts` `buildReport()`)
- `performance.mark/measure` used instead of `Date.now()` for browser-native sub-ms accuracy

## Known Issues / Workarounds
- `npm init playwright@latest` interactive wizard got stuck — switched to manual file creation
- TS errors for `@playwright/test` / `process` are expected before `npm install` — resolved after install
- Terminal 1 (`npm init playwright@latest`) may still be running — can be safely ignored/killed
