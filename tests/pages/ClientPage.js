/**
 * Client Page Object Model
 * Handles new client creation and client management interactions
 */

class ClientPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // New Client form fields
    this.firstNameInput = page.locator(
      'input[name*="first" i], input[id*="first" i], input[placeholder*="first name" i]'
    ).first();
    this.lastNameInput = page.locator(
   'input[name*="last" i], input[id*="last" i], input[placeholder*="last name" i]'
    ).first();
    this.dateOfBirthInput = page.locator(
      'input[name*="dob" i], input[id*="dob" i], input[name*="birth" i], input[id*="birth" i], input[placeholder*="birth" i], input[placeholder*="dob" i]'
    ).first();
    this.phoneInput = page.locator(
      'input[name*="phone" i], input[id*="phone" i], input[placeholder*="phone" i], input[type="tel"]'
    ).first();
    this.emailInput = page.locator(
      'input[name*="email" i], input[id*="email" i], input[type="email"], input[placeholder*="email" i]'
    ).first();
    this.addressInput = page.locator(
      'input[name*="address" i], input[id*="address" i], input[placeholder*="address" i], input[name*="street" i]'
    ).first();
    this.cityInput = page.locator(
      'input[name*="city" i], input[id*="city" i], input[placeholder*="city" i]'
    ).first();
    this.stateSelect = page.locator(
      'select[name*="state" i], select[id*="state" i]'
    ).first();
    this.zipInput = page.locator(
      'input[name*="zip" i], input[id*="zip" i], input[placeholder*="zip" i], input[name*="postal" i]'
    ).first();
    this.countyInput = page.locator(
      'input[name*="county" i], input[id*="county" i], select[name*="county" i], select[id*="county" i]'
    ).first();
    this.genderSelect = page.locator(
      'select[name*="gender" i], select[id*="gender" i]'
    ).first();

    // Save/Create button
 this.saveButton = page.locator(
      'button:has-text("Save"), button:has-text("Create"), button:has-text("Submit"), button[type="submit"]'
    ).first();
    this.cancelButton = page.locator(
      'button:has-text("Cancel"), a:has-text("Cancel")'
    ).first();

    // Success / Error messages
    this.successMessage = page.locator(
      '[class*="success"], [class*="Success"], .alert-success, [role="alert"], [class*="confirm"]'
    ).first();
  this.errorMessage = page.locator(
      '[class*="error"], [class*="Error"], .alert-danger, [role="alert"]'
    ).first();

    // Client search
    this.clientNumberInput = page.locator(
      'input[name*="client" i], input[id*="client" i], input[placeholder*="client number" i], input[placeholder*="client id" i]'
    ).first();
    this.searchButton = page.locator(
      'button:has-text("Search"), input[type="submit"][value*="Search" i]'
    ).first();

    this.loadingSpinner = page.locator('[class*="loading"], [class*="spinner"], .loader');
  }

/**
   * Wait for page to load
   */
  async waitForLoad() {
    try {
      await this.loadingSpinner.first().waitFor({ state: 'hidden', timeout: 15000 });
    } catch { /* no spinner */ }
    await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
    await this.page.waitForTimeout(1500);
  }

  /**
   * Fill First Name
   * @param {string} firstName
   */
  async fillFirstName(firstName) {
    await this.firstNameInput.waitFor({ state: 'visible', timeout: 15000 });
    await this.firstNameInput.clear();
    await this.firstNameInput.fill(firstName);
  }

  /**
   * Fill Last Name
   * @param {string} lastName
   */
  async fillLastName(lastName) {
    await this.lastNameInput.waitFor({ state: 'visible', timeout: 15000 });
    await this.lastNameInput.clear();
    await this.lastNameInput.fill(lastName);
  }

  /**
   * Fill Date of Birth
   * @param {string} dob - MM/DD/YYYY
   */
  async fillDateOfBirth(dob) {
    try {
      await this.dateOfBirthInput.waitFor({ state: 'visible', timeout: 10000 });
      await this.dateOfBirthInput.clear();
      await this.dateOfBirthInput.fill(dob);
      await this.page.keyboard.press('Tab');
    } catch { /* field may not be required */ }
  }

  /**
   * Fill Phone Number
   * @param {string} phone
   */
  async fillPhone(phone) {
    try {
      await this.phoneInput.waitFor({ state: 'visible', timeout: 10000 });
      await this.phoneInput.clear();
    await this.phoneInput.fill(phone);
    } catch { /* optional */ }
  }

  /**
   * Fill Email
   * @param {string} email
   */
  async fillEmail(email) {
    try {
      await this.emailInput.waitFor({ state: 'visible', timeout: 10000 });
      await this.emailInput.clear();
   await this.emailInput.fill(email);
    } catch { /* optional */ }
  }

  /**
 * Fill Address
   * @param {string} address
   */
  async fillAddress(address) {
    try {
      await this.addressInput.waitFor({ state: 'visible', timeout: 10000 });
      await this.addressInput.clear();
      await this.addressInput.fill(address);
 await this.page.waitForTimeout(1000);
    // Handle autocomplete
      const autocomplete = this.page.locator('[class*="autocomplete"], [class*="dropdown"], [role="listbox"], [role="option"]');
      try {
 await autocomplete.first().waitFor({ state: 'visible', timeout: 3000 });
        await autocomplete.first().click();
      } catch { /* no autocomplete */ }
    } catch { /* field may not be present */ }
  }

  /**
   * Fill City
   * @param {string} city
   */
  async fillCity(city) {
    try {
 await this.cityInput.waitFor({ state: 'visible', timeout: 10000 });
      await this.cityInput.clear();
      await this.cityInput.fill(city);
    } catch { /* optional */ }
  }

  /**
   * Select State
   * @param {string} state
   */
  async selectState(state) {
    try {
      await this.stateSelect.waitFor({ state: 'visible', timeout: 10000 });
      await this.stateSelect.selectOption({ label: state });
    } catch { /* optional */ }
  }

  /**
   * Fill ZIP Code
   * @param {string} zip
   */
  async fillZip(zip) {
    try {
      await this.zipInput.waitFor({ state: 'visible', timeout: 10000 });
      await this.zipInput.clear();
      await this.zipInput.fill(zip);
 } catch { /* optional */ }
  }

  /**
   * Fill or select County
   * @param {string} county
   */
  async fillCounty(county) {
 try {
      const countyEl = this.page.locator(
        'select[name*="county" i], select[id*="county" i]'
      ).first();
      const inputEl = this.page.locator(
   'input[name*="county" i], input[id*="county" i]'
      ).first();
  const countyCount = await countyEl.count();
      if (countyCount > 0) {
        await countyEl.selectOption({ label: county });
      } else {
        await inputEl.clear();
        await inputEl.fill(county);
}
    } catch { /* optional */ }
  }

  /**
   * Select Gender
   * @param {string} gender
   */
  async selectGender(gender) {
    try {
      await this.genderSelect.waitFor({ state: 'visible', timeout: 10000 });
      await this.genderSelect.selectOption({ label: gender });
    } catch { /* optional */ }
  }

  /**
   * Click Save/Create button
   */
  async clickSave() {
    await this.saveButton.waitFor({ state: 'visible', timeout: 15000 });
    await this.saveButton.click();
 await this.waitForLoad();
  }

  /**
   * Check if client was created successfully
   * @returns {Promise<boolean>}
   */
  async isClientCreated() {
    try {
      await this.successMessage.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      const url = this.page.url();
      return url.includes('client') && !url.includes('new');
    }
  }

  /**
   * Search for client by client number
   * @param {string} clientNumber
   */
  async searchClientByNumber(clientNumber) {
    try {
      await this.clientNumberInput.waitFor({ state: 'visible', timeout: 15000 });
      await this.clientNumberInput.clear();
      await this.clientNumberInput.fill(clientNumber);
      await this.searchButton.click();
      await this.waitForLoad();
    } catch { /* search may work differently */ }
  }

  /**
   * Take a screenshot
   * @param {string} name
   */
  async takeScreenshot(name) {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
  }
}

module.exports = { ClientPage };
