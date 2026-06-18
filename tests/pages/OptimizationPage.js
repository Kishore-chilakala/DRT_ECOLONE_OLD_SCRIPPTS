/**
 * Optimization Page Object Model
 * Handles Batch Optimization / Schedule Optimization interactions
 */

class OptimizationPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Search / Filter fields
    this.dateInput = page.locator(
      'input[name*="date" i], input[id*="date" i], input[type="date"], input[placeholder*="date" i]'
    ).first();
    this.providerSelect = page.locator(
      'select[name*="provider" i], select[id*="provider" i]'
    ).first();
 this.serviceSelect = page.locator(
      'select[name*="service" i], select[id*="service" i]'
    ).first();

    // Search button
    this.searchButton = page.locator(
    'button:has-text("Search"), input[type="submit"][value*="Search" i], button[type="submit"]:has-text("Search")'
    ).first();

    // Optimize button
    this.optimizeButton = page.locator(
      'button:has-text("Optimize"), button:has-text("Run Optimization"), button:has-text("Batch Optimize")'
    ).first();

    // Schedule list / table rows
    this.scheduleRows = page.locator('table tbody tr, [class*="schedule-row"], [class*="scheduleRow"]');
    this.firstScheduleRow = page.locator('table tbody tr, [class*="schedule-row"]').first();

    // Mark for Review button
    this.markForReviewButton = page.locator(
   'button:has-text("Mark for Review"), button:has-text("Mark For Review")'
    ).first();

    // Mark Complete button
    this.markCompleteButton = page.locator(
      'button:has-text("Mark Complete"), button:has-text("Complete")'
    ).first();

    // Manual Dispatch button
    this.manualDispatchButton = page.locator(
      'button:has-text("Manual Dispatch"), button:has-text("Dispatch")'
  ).first();

    // Tab buttons for schedule, mark complete, manual dispatch sections
    this.scheduleTab = page.locator(
      '[role="tab"]:has-text("Schedule"), button:has-text("Schedule"), a:has-text("Schedule")'
    ).first();
    this.markCompleteTab = page.locator(
      '[role="tab"]:has-text("Mark Complete"), button:has-text("Mark Complete"), a:has-text("Mark Complete")'
    ).first();
    this.manualDispatchTab = page.locator(
 '[role="tab"]:has-text("Manual Dispatch"), button:has-text("Manual Dispatch"), a:has-text("Manual Dispatch")'
    ).first();

    // Success / confirmation messages
    this.successMessage = page.locator(
      '[class*="success"], [class*="Success"], .alert-success, [role="alert"]'
    ).first();

    this.loadingSpinner = page.locator('[class*="loading"], [class*="spinner"], .loader');
  }

  /**
   * Wait for page to load
   */
  async waitForLoad() {
    try {
      await this.loadingSpinner.first().waitFor({ state: 'hidden', timeout: 30000 });
    } catch { /* no spinner */ }
    await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
    await this.page.waitForTimeout(2000);
  }

  /**
   * Fill the date filter
   * @param {string} date - MM/DD/YYYY
   */
  async fillDate(date) {
    try {
      await this.dateInput.waitFor({ state: 'visible', timeout: 15000 });
      await this.dateInput.clear();
await this.dateInput.fill(date);
  await this.page.keyboard.press('Tab');
    } catch { /* field may not be present */ }
  }

  /**
   * Select provider from dropdown
   * @param {string} provider
   */
async selectProvider(provider) {
    try {
      await this.providerSelect.waitFor({ state: 'visible', timeout: 10000 });
      await this.providerSelect.selectOption({ label: provider });
    } catch { /* optional */ }
  }

  /**
   * Click the Search button
   */
  async clickSearch() {
    await this.searchButton.waitFor({ state: 'visible', timeout: 20000 });
    await this.searchButton.click();
    await this.waitForLoad();
  }

  /**
   * Click Optimize button if present
   */
  async clickOptimize() {
    try {
      await this.optimizeButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.optimizeButton.click();
      await this.waitForLoad();
    } catch { /* button may not be visible */ }
  }

  /**
   * Click on a schedule row / select first result
   */
  async clickFirstScheduleRow() {
    await this.firstScheduleRow.waitFor({ state: 'visible', timeout: 15000 });
    await this.firstScheduleRow.click();
    await this.waitForLoad();
  }

  /**
   * Click Mark for Review button in Schedule section
   */
  async clickMarkForReviewInSchedule() {
    // Try clicking the Schedule tab first
    try {
      await this.scheduleTab.waitFor({ state: 'visible', timeout: 5000 });
    await this.scheduleTab.click();
      await this.page.waitForTimeout(1000);
    } catch { /* no tab */ }

    await this.markForReviewButton.waitFor({ state: 'visible', timeout: 15000 });
    await this.markForReviewButton.click();
    await this.waitForLoad();
  }

  /**
   * Click Mark for Review button in Mark Complete section
   */
  async clickMarkForReviewInMarkComplete() {
    try {
      await this.markCompleteTab.waitFor({ state: 'visible', timeout: 5000 });
      await this.markCompleteTab.click();
    await this.page.waitForTimeout(1000);
    } catch { /* no tab */ }

  // Find all "Mark for Review" buttons – pick based on context
    const buttons = this.page.locator('button:has-text("Mark for Review"), button:has-text("Mark For Review")');
    const count = await buttons.count();
    if (count > 1) {
await buttons.nth(1).click();
    } else {
      await buttons.first().click();
  }
    await this.waitForLoad();
  }

  /**
   * Click Mark for Review button in Manual Dispatch section
   */
  async clickMarkForReviewInManualDispatch() {
    try {
      await this.manualDispatchTab.waitFor({ state: 'visible', timeout: 5000 });
      await this.manualDispatchTab.click();
 await this.page.waitForTimeout(1000);
    } catch { /* no tab */ }

    const buttons = this.page.locator('button:has-text("Mark for Review"), button:has-text("Mark For Review")');
    const count = await buttons.count();
    if (count > 2) {
      await buttons.nth(2).click();
    } else {
      await buttons.last().click();
  }
    await this.waitForLoad();
  }

  /**
   * Click Mark Complete button
   */
  async clickMarkComplete() {
    try {
      await this.markCompleteButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.markCompleteButton.click();
      await this.waitForLoad();
    } catch { /* button may not be visible */ }
  }

  /**
   * Click Manual Dispatch button
   */
  async clickManualDispatch() {
  try {
      await this.manualDispatchButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.manualDispatchButton.click();
      await this.waitForLoad();
    } catch { /* button may not be visible */ }
  }

  /**
   * Check if schedule rows are displayed
   * @returns {Promise<boolean>}
   */
  async hasScheduleResults() {
    try {
      await this.firstScheduleRow.waitFor({ state: 'visible', timeout: 10000 });
      const count = await this.scheduleRows.count();
      return count > 0;
    } catch {
      return false;
    }
  }

  /**
   * Take a screenshot
   * @param {string} name
   */
  async takeScreenshot(name) {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
  }
}

module.exports = { OptimizationPage };
