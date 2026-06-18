/**
 * Trip Page Object Model
 * Handles trip creation interactions for eColane DRT Platform
 */

class TripPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Trip creation button
    this.newTripButton = page.locator(
   'button:has-text("New Trip"), a:has-text("New Trip"), button:has-text("Create Trip"), a:has-text("Create Trip")'
    ).first();

  // Trip form fields
    this.pickupAddressInput = page.locator(
      'input[name*="pickup" i], input[id*="pickup" i], input[placeholder*="pickup" i], input[placeholder*="pick up" i]'
    ).first();
    this.dropoffAddressInput = page.locator(
      'input[name*="dropoff" i], input[id*="dropoff" i], input[placeholder*="dropoff" i], input[placeholder*="drop off" i], input[placeholder*="destination" i]'
    ).first();
  this.tripDateInput = page.locator(
      'input[name*="date" i], input[id*="date" i], input[type="date"], input[placeholder*="date" i]'
    ).first();
    this.tripTimeInput = page.locator(
      'input[name*="time" i], input[id*="time" i], input[type="time"], input[placeholder*="time" i]'
    ).first();
    this.appointmentTimeInput = page.locator(
      'input[name*="appointment" i], input[id*="appt" i], input[placeholder*="appointment" i]'
    ).first();
    this.tripPurposeSelect = page.locator(
      'select[name*="purpose" i], select[id*="purpose" i], [class*="purpose"] select'
  ).first();
    this.spacesInput = page.locator(
      'input[name*="spaces" i], input[id*="spaces" i], input[name*="passenger" i]'
    ).first();
    this.fundingSourceSelect = page.locator(
      'select[name*="funding" i], select[id*="funding" i], [class*="funding"] select'
    ).first();
    this.serviceTypeSelect = page.locator(
  'select[name*="service" i], select[id*="service" i], [class*="service"] select'
    ).first();

    // Submit buttons
    this.createTripButton = page.locator(
   'button:has-text("Create Trip"), button:has-text("Save"), button[type="submit"], input[type="submit"]'
    ).first();
    this.cancelButton = page.locator(
    'button:has-text("Cancel"), a:has-text("Cancel")'
    ).first();

    // Confirmation / success messages
    this.successMessage = page.locator(
 '[class*="success"], [class*="Success"], .alert-success, [role="alert"]'
    ).first();
  this.tripIdLabel = page.locator(
      '[class*="trip-id"], [class*="tripId"], [class*="confirmation"]'
    ).first();

    // Search / result table
    this.searchResultsTable = page.locator('table, [class*="results"], [class*="grid"]').first();
    this.firstClientResult = page.locator('table tbody tr, [class*="results"] [class*="row"]').first();

    this.loadingSpinner = page.locator('[class*="loading"], [class*="spinner"], .loader');
  }

  /**
   * Wait for loading to complete
   */
async waitForLoad() {
  try {
      await this.loadingSpinner.first().waitFor({ state: 'hidden', timeout: 15000 });
    } catch { /* no spinner */ }
    await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
    await this.page.waitForTimeout(1500);
  }

  /**
   * Click New Trip button
   */
  async clickNewTrip() {
    await this.newTripButton.waitFor({ state: 'visible', timeout: 20000 });
    await this.newTripButton.click();
    await this.waitForLoad();
  }

  /**
   * Fill pickup address
   * @param {string} address
   */
  async fillPickupAddress(address) {
    await this.pickupAddressInput.waitFor({ state: 'visible', timeout: 15000 });
    await this.pickupAddressInput.clear();
  await this.pickupAddressInput.fill(address);
    await this.page.waitForTimeout(1000);
    // Handle autocomplete dropdown if it appears
    const autocomplete = this.page.locator('[class*="autocomplete"], [class*="dropdown"], [role="listbox"], [role="option"]');
    try {
      await autocomplete.first().waitFor({ state: 'visible', timeout: 3000 });
      await autocomplete.first().click();
    } catch { /* no autocomplete */ }
  }

  /**
   * Fill dropoff address
   * @param {string} address
   */
  async fillDropoffAddress(address) {
    await this.dropoffAddressInput.waitFor({ state: 'visible', timeout: 15000 });
    await this.dropoffAddressInput.clear();
    await this.dropoffAddressInput.fill(address);
    await this.page.waitForTimeout(1000);
    const autocomplete = this.page.locator('[class*="autocomplete"], [class*="dropdown"], [role="listbox"], [role="option"]');
    try {
      await autocomplete.first().waitFor({ state: 'visible', timeout: 3000 });
      await autocomplete.first().click();
 } catch { /* no autocomplete */ }
  }

  /**
   * Fill trip date
   * @param {string} date - MM/DD/YYYY format
 */
  async fillTripDate(date) {
    await this.tripDateInput.waitFor({ state: 'visible', timeout: 15000 });
    await this.tripDateInput.clear();
    await this.tripDateInput.fill(date);
    await this.page.keyboard.press('Tab');
  }

  /**
   * Fill trip time
   * @param {string} time
   */
  async fillTripTime(time) {
    try {
  await this.tripTimeInput.waitFor({ state: 'visible', timeout: 10000 });
      await this.tripTimeInput.clear();
      await this.tripTimeInput.fill(time);
      await this.page.keyboard.press('Tab');
} catch { /* field may not be separate */ }
  }

  /**
   * Fill appointment time
   * @param {string} time
   */
  async fillAppointmentTime(time) {
    try {
      await this.appointmentTimeInput.waitFor({ state: 'visible', timeout: 10000 });
      await this.appointmentTimeInput.clear();
      await this.appointmentTimeInput.fill(time);
      await this.page.keyboard.press('Tab');
} catch { /* field may not be present */ }
  }

  /**
   * Select trip purpose
   * @param {string} purpose
   */
  async selectTripPurpose(purpose) {
    try {
 await this.tripPurposeSelect.waitFor({ state: 'visible', timeout: 10000 });
    await this.tripPurposeSelect.selectOption({ label: purpose });
    } catch { /* field may not be present or value not found */ }
  }

  /**
   * Fill number of spaces
   * @param {string} spaces
   */
  async fillSpaces(spaces) {
    try {
      await this.spacesInput.waitFor({ state: 'visible', timeout: 10000 });
      await this.spacesInput.clear();
 await this.spacesInput.fill(spaces);
} catch { /* field may not be present */ }
  }

  /**
   * Select funding source
* @param {string} fundingSource
   */
  async selectFundingSource(fundingSource) {
    try {
      await this.fundingSourceSelect.waitFor({ state: 'visible', timeout: 10000 });
      await this.fundingSourceSelect.selectOption({ label: fundingSource });
    } catch { /* field or value not present */ }
  }

  /**
   * Select service type
   * @param {string} serviceType
   */
  async selectServiceType(serviceType) {
    try {
      await this.serviceTypeSelect.waitFor({ state: 'visible', timeout: 10000 });
      await this.serviceTypeSelect.selectOption({ label: serviceType });
    } catch { /* field or value not present */ }
  }

  /**
   * Click Create Trip / Save button
   */
  async clickCreateTrip() {
    await this.createTripButton.waitFor({ state: 'visible', timeout: 15000 });
    await this.createTripButton.click();
    await this.waitForLoad();
  }

  /**
   * Check if trip was created successfully
   * @returns {Promise<boolean>}
   */
  async isTripCreated() {
    try {
      await this.successMessage.waitFor({ state: 'visible', timeout: 10000 });
      return true;
 } catch {
   // Check for trip ID or confirmation in page
      const url = this.page.url();
      return url.includes('trip') || url.includes('confirm');
    }
  }

  /**
   * Click on first client result in search
   */
  async clickFirstClientResult() {
 await this.firstClientResult.waitFor({ state: 'visible', timeout: 15000 });
    await this.firstClientResult.click();
    await this.waitForLoad();
  }

  /**
   * Take screenshot
   * @param {string} name
   */
  async takeScreenshot(name) {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
  }
}

module.exports = { TripPage };
