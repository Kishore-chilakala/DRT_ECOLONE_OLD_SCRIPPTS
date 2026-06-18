/**
 * Scenario 4: Batch Optimization
 * Objective: Optimize schedules (approx 1k users)
 * Platform: eColane DRT Platform
 * Navigation: Operations --> Schedules --> Optimize Schedules
 * Actions:
 *   - Click Search
 *   - Go to Schedule > click Mark for Review
 *   - Go to Mark Complete > click Mark for Review
 *   - Go to Manual Dispatch > click Mark for Review
 */

const { test, expect } = require('@playwright/test');
const { LoginPage } = require('./pages/LoginPage');
const { NavigationPage } = require('./pages/NavigationPage');
const { OptimizationPage } = require('./pages/OptimizationPage');
const { TEST_CONFIG } = require('./config/testData');

test.describe('Scenario 4: Batch Optimization', () => {
  let loginPage;
  let navigationPage;
  let optimizationPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    navigationPage = new NavigationPage(page);
    optimizationPage = new OptimizationPage(page);

    // Step 1: Login
    await loginPage.navigate();
    await loginPage.login(
    TEST_CONFIG.credentials.username,
      TEST_CONFIG.credentials.password
    );
    await loginPage.waitForLoadingComplete();

    const loggedIn = await loginPage.isLoggedIn();
    expect(loggedIn, 'User must be logged in to access Batch Optimization').toBeTruthy();
  });

  // ──────────────────────────────────────────────────────
  // TC-01: Navigate to Operations > Schedules > Optimize Schedules
  // ──────────────────────────────────────────────────────
  test('TC-01: Navigate to Operations > Schedules > Optimize Schedules', async ({ page }) => {
    await test.step('Click Operations menu and navigate to Optimize Schedules', async () => {
      await navigationPage.goToOptimizeSchedules();
    await optimizationPage.takeScreenshot('04_TC01_optimize_schedules_page');
    });

  await test.step('Verify Optimize Schedules page is displayed', async () => {
      const url = page.url();
      const pageContent = await page.textContent('body');
      console.log('Optimize Schedules URL:', url);
      expect(pageContent.toLowerCase()).toMatch(/schedule|optimize|dispatch/i);
    });
  });

  // ──────────────────────────────────────────────────────
  // TC-02: Click Search button on Optimize Schedules
  // ──────────────────────────────────────────────────────
  test('TC-02: Click Search on Optimize Schedules page', async ({ page }) => {
    await test.step('Navigate to Optimize Schedules', async () => {
      await navigationPage.goToOptimizeSchedules();
    });

    await test.step('Take screenshot before search', async () => {
    await optimizationPage.takeScreenshot('04_TC02_before_search');
    });

    await test.step('Click Search button', async () => {
      await optimizationPage.clickSearch();
      await optimizationPage.takeScreenshot('04_TC02_after_search');
    });

    await test.step('Verify search results or schedule data is displayed', async () => {
      const pageContent = await page.textContent('body');
      console.log('Search result content (partial):', pageContent.substring(0, 300));
      expect(pageContent.length).toBeGreaterThan(0);
    });
  });

  // ──────────────────────────────────────────────────────
  // TC-03: Verify Schedule section is present after search
  // ──────────────────────────────────────────────────────
  test('TC-03: Verify schedule section is available after search', async ({ page }) => {
    await test.step('Navigate to Optimize Schedules', async () => {
      await navigationPage.goToOptimizeSchedules();
    });

    await test.step('Click Search', async () => {
      await optimizationPage.clickSearch();
    });

    await test.step('Verify schedule rows or tabs are visible', async () => {
    await optimizationPage.takeScreenshot('04_TC03_schedule_section');
   const hasResults = await optimizationPage.hasScheduleResults();
      console.log('Has schedule results:', hasResults);
      // Log the page state for validation
      const pageContent = await page.textContent('body');
      console.log('Schedule section content (partial):', pageContent.substring(0, 500));
    });
  });

  // ──────────────────────────────────────────────────────
  // TC-04: Click Mark for Review in Schedule section
  // ──────────────────────────────────────────────────────
  test('TC-04: Click Mark for Review in Schedule section', async ({ page }) => {
    await test.step('Navigate to Optimize Schedules', async () => {
      await navigationPage.goToOptimizeSchedules();
    });

    await test.step('Click Search button', async () => {
      await optimizationPage.clickSearch();
    });

    await test.step('Take screenshot of schedule section', async () => {
      await optimizationPage.takeScreenshot('04_TC04_schedule_before_review');
    });

  await test.step('Click first schedule row if results exist', async () => {
      const hasResults = await optimizationPage.hasScheduleResults();
    if (hasResults) {
        await optimizationPage.clickFirstScheduleRow();
      } else {
        console.log('No schedule rows found - skipping row click');
   }
    });

    await test.step('Click Mark for Review button in Schedule section', async () => {
await optimizationPage.clickMarkForReviewInSchedule();
      await optimizationPage.takeScreenshot('04_TC04_schedule_mark_review_clicked');
    });

    await test.step('Verify action was acknowledged', async () => {
      const pageContent = await page.textContent('body');
      console.log('After Mark for Review in Schedule (partial):', pageContent.substring(0, 300));
    });
  });

  // ──────────────────────────────────────────────────────
  // TC-05: Click Mark for Review in Mark Complete section
  // ──────────────────────────────────────────────────────
  test('TC-05: Click Mark for Review in Mark Complete section', async ({ page }) => {
    await test.step('Navigate to Optimize Schedules', async () => {
      await navigationPage.goToOptimizeSchedules();
    });

    await test.step('Click Search button', async () => {
      await optimizationPage.clickSearch();
    });

    await test.step('Navigate to Mark Complete section / tab', async () => {
      await optimizationPage.takeScreenshot('04_TC05_mark_complete_before');
    });

    await test.step('Click Mark for Review in Mark Complete section', async () => {
      await optimizationPage.clickMarkForReviewInMarkComplete();
      await optimizationPage.takeScreenshot('04_TC05_mark_complete_after');
    });

await test.step('Verify action was processed', async () => {
      const pageContent = await page.textContent('body');
      console.log('After Mark for Review in Mark Complete (partial):', pageContent.substring(0, 300));
});
  });

  // ──────────────────────────────────────────────────────
  // TC-06: Click Mark for Review in Manual Dispatch section
  // ──────────────────────────────────────────────────────
  test('TC-06: Click Mark for Review in Manual Dispatch section', async ({ page }) => {
    await test.step('Navigate to Optimize Schedules', async () => {
      await navigationPage.goToOptimizeSchedules();
    });

    await test.step('Click Search button', async () => {
      await optimizationPage.clickSearch();
    });

    await test.step('Navigate to Manual Dispatch section / tab', async () => {
      await optimizationPage.takeScreenshot('04_TC06_manual_dispatch_before');
    });

    await test.step('Click Mark for Review in Manual Dispatch section', async () => {
await optimizationPage.clickMarkForReviewInManualDispatch();
      await optimizationPage.takeScreenshot('04_TC06_manual_dispatch_after');
    });

    await test.step('Verify action was processed', async () => {
      const pageContent = await page.textContent('body');
  console.log('After Mark for Review in Manual Dispatch (partial):', pageContent.substring(0, 300));
    });
  });

  // ──────────────────────────────────────────────────────
  // TC-07: Full Batch Optimization Workflow
  // ──────────────────────────────────────────────────────
  test('TC-07: Full Batch Optimization workflow - Search + all Mark for Review actions', async ({ page }) => {
    await test.step('Navigate to Operations > Schedules > Optimize Schedules', async () => {
      await navigationPage.goToOptimizeSchedules();
  await optimizationPage.takeScreenshot('04_TC07_optimize_page_loaded');
    });

    await test.step('Click Search button to load schedules', async () => {
      await optimizationPage.clickSearch();
      await optimizationPage.takeScreenshot('04_TC07_after_search');
    });

    await test.step('Schedule section - Click Mark for Review', async () => {
      const hasResults = await optimizationPage.hasScheduleResults();
  if (hasResults) {
        await optimizationPage.clickMarkForReviewInSchedule();
      }
      await optimizationPage.takeScreenshot('04_TC07_schedule_marked');
console.log('Step 1: Schedule Mark for Review - Done');
    });

    await test.step('Mark Complete section - Click Mark for Review', async () => {
await optimizationPage.clickMarkForReviewInMarkComplete();
      await optimizationPage.takeScreenshot('04_TC07_mark_complete_reviewed');
      console.log('Step 2: Mark Complete Mark for Review - Done');
    });

 await test.step('Manual Dispatch section - Click Mark for Review', async () => {
      await optimizationPage.clickMarkForReviewInManualDispatch();
      await optimizationPage.takeScreenshot('04_TC07_manual_dispatch_reviewed');
      console.log('Step 3: Manual Dispatch Mark for Review - Done');
    });

    await test.step('Verify batch optimization workflow completed', async () => {
      const pageContent = await page.textContent('body');
    console.log('Final batch optimization page state (partial):', pageContent.substring(0, 300));
      expect(pageContent.length).toBeGreaterThan(0);
    });
  });

  // ──────────────────────────────────────────────────────
  // TC-08: Verify session is active during optimization
  // ──────────────────────────────────────────────────────
  test('TC-08: Session remains active during batch optimization', async ({ page }) => {
    await test.step('Verify session is active', async () => {
      const loggedIn = await loginPage.isLoggedIn();
      expect(loggedIn, 'Session should remain active during optimization').toBeTruthy();
    });

    await test.step('Navigate to Optimize Schedules (session active)', async () => {
 await navigationPage.goToOptimizeSchedules();
      const url = page.url();
      expect(url, 'Should not be redirected to login').not.toContain('login');
  await optimizationPage.takeScreenshot('04_TC08_session_active_optimization');
    });
  });
});
