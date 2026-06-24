# Tech Context

## Technologies Used

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | v26.2.0 | Runtime |
| TypeScript | ^5.4.0 | Type-safe test authoring |
| @playwright/test | ^1.44.0 | E2E framework + codegen + reporting |
| Chromium | Latest (via Playwright) | Browser under test |

## Development Setup

### Prerequisites
- Node.js >= 18 (v26.2.0 confirmed on this machine)
- npm >= 9

### Installation
```powershell
npm install                    # installs @playwright/test, typescript, @types/node
npx playwright install chromium  # downloads Chromium binary
```

### Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `http://localhost:3000` | URL of the React dev server |

Set in PowerShell:
```powershell
$env:BASE_URL = "http://localhost:3000"
```

## Key Commands

| Command | What it does |
|---------|-------------|
| `npm run codegen` | Opens Playwright codegen in Chrome at BASE_URL |
| `npm run codegen:record` | Codegen + saves output to `tests/recorded.spec.ts` |
| `npm test` | Runs all tests headless (or headed per config) |
| `npm run test:headed` | Force-headed run |
| `npm run test:ui` | Opens Playwright UI mode |
| `npm run report` | Opens last HTML report |
| `npm run install:browsers` | Re-installs Chromium binary |
| `.\scripts\codegen.ps1` | PowerShell launcher with instructions |
| `.\scripts\codegen.ps1 -Url http://... -Output tests/flow.spec.ts` | Record to file |

## Project Structure
```
playwright-react-perf-e2e/
├── package.json                  # npm scripts + dependencies
├── playwright.config.ts          # Playwright configuration
├── tsconfig.json                 # TypeScript configuration
├── .gitignore
├── scripts/
│   └── codegen.ps1               # PowerShell codegen launcher
├── tests/
│   ├── e2e.spec.ts               # Main test file (paste codegen output here)
│   └── helpers/
│       └── perfHelper.ts         # Performance measurement utilities
├── memento/                      # AiDE project memory
├── playwright-report/            # HTML report output (git-ignored)
└── test-results/                 # Test artifacts + JSON report (git-ignored)
```

## Technical Constraints
- `workers: 1` — single-threaded to avoid CPU noise in perf measurements
- `headless: false` — headed so visual rendering is exercised realistically
- `channel: 'chromium'` — uses Playwright's bundled Chromium, not system Chrome
- `networkidle` wait strategy — waits for React async data fetches to complete before measuring
- Performance Observer injected via `addInitScript` — runs before any page JS executes

## Browser Performance APIs Used
- `performance.mark()` / `performance.measure()` — W3C User Timing Level 2
- `PerformanceObserver` — for longtask, layout-shift, paint, measure entries
- `performance.getEntriesByType('navigation')` — Navigation Timing Level 2
