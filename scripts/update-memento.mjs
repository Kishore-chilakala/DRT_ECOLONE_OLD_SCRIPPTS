import { readFileSync, writeFileSync } from 'fs';

// ── Update progress.md ─────────────────────────────────────────────────────
let progress = readFileSync('memento/progress.md', 'utf8');
progress = progress.replace(
  '- [ ] (Optional) CI/CD integration',
  '- [x] CI/CD integration — GitHub Actions workflow created (`.github/workflows/playwright-ci.yml`)'
);
writeFileSync('memento/progress.md', progress, 'utf8');
console.log('progress.md updated');

// ── Update activeContext.md ────────────────────────────────────────────────
let active = readFileSync('memento/activeContext.md', 'utf8');

const ciSection = `
## CI/CD — GitHub Actions Workflow

File: \`.github/workflows/playwright-ci.yml\`

### Trigger Events
- **push** to any branch
- **pull_request** to any branch
- **workflow_dispatch** (manual run with optional \`headless\` and \`base_url\` inputs)

### Steps Executed
1. Checkout repository
2. Set up Node.js 20 with npm cache
3. \`npm ci\` — install dependencies
4. \`npx playwright install chromium --with-deps\` — install browser + OS deps
5. \`npx playwright test --grep @oldscripts\` — run only tests tagged \`@oldscripts\`
6. Upload \`playwright-report/\` artifact (30-day retention)
7. Upload \`test-results/\` artifact (30-day retention)
8. Upload \`perf-results/\` artifact (30-day retention)
9. Write GitHub Step Summary with run metadata

### Tag Convention
All test specs are tagged \`@oldscripts\` so the CI workflow can target them via \`--grep @oldscripts\`:
- \`tests/react-front-end.spec.ts\` — 6 tests (TC-RE-001 through TC-RE-SOAK)
- \`tests/react-booking-new.spec.ts\` — 1 test.describe block
- \`tests/react-perf-test.spec.ts\` — 1 test.describe block

### Key Environment Variables
| Variable | Default in CI | Description |
|----------|--------------|-------------|
| \`BASE_URL\` | \`https://qa-react.ecolane.com/drt\` | Target React app URL |
| \`HEADLESS\` | \`true\` | Always headless in CI |
| \`CI\` | \`true\` | Set by GitHub Actions automatically |
`;

if (!active.includes('## CI/CD')) {
  active = active + ciSection;
  writeFileSync('memento/activeContext.md', active, 'utf8');
  console.log('activeContext.md updated with CI/CD section');
} else {
  console.log('activeContext.md already has CI/CD section');
}
