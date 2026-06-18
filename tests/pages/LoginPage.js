/**
 * Login Page Object Model
 * Handles all interactions on the eColane DRT Login Page
 */

class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Locators
    this.usernameInput = page.locator('input[name="username"], input[id="username"], input[placeholder*="username" i], input[placeholder*="user" i]');
    this.passwordInput = page.locator('input[name="password"], input[id="password"], input[type="password"]');
    this.loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In"), input[type="submit"]');
    this.errorMessage = page.locator('.error, .alert-danger, [class*="error"], [class*="Error"], [role="alert"]');
    this.pageTitle = page.locator('h1, h2, .title, [class*="title"]');
    this.logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Sign Out")');
    this.userMenu = page.locator('[class*="user-menu"], [class*="userMenu"], [class*="profile"], .nav-user');
    this.dashboardContainer = page.locator('[class*="dashboard"], [class*="Dashboard"], main, #main-content, .main-content');
    this.navigationMenu = page.locator('nav, [class*="navbar"], [class*="sidebar"], [class*="menu"]');
    this.loadingSpinner = page.locator('[class*="loading"], [class*="spinner"], .loader');
  }

  /**
   * Navigate to the login page
   */
  async navigate() {
    await this.page.goto('https://qa-react.ecolane.com/drt/', {
    waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await this.page.waitForTimeout(2000);
  }

  /**
   * Fill username field
   * @param {string} username
   */
  async enterUsername(username) {
    await this.usernameInput.first().waitFor({ state: 'visible', timeout: 30000 });
    await this.usernameInput.first().clear();
    await this.usernameInput.first().fill(username);
  }

  /**
   * Fill password field
   * @param {string} password
   */
  async enterPassword(password) {
await this.passwordInput.first().waitFor({ state: 'visible', timeout: 30000 });
    await this.passwordInput.first().clear();
    await this.passwordInput.first().fill(password);
  }

  /**
   * Click login button
   */
  async clickLogin() {
    await this.loginButton.first().waitFor({ state: 'visible', timeout: 30000 });
    await this.loginButton.first().click();
  }

  /**
   * Perform full login
   * @param {string} username
   * @param {string} password
   */
  async login(username, password) {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLogin();
    // Wait for navigation after login
    await this.page.waitForTimeout(3000);
  }

  /**
   * Check if user is logged in (dashboard or navigation visible)
   * @returns {Promise<boolean>}
   */
  async isLoggedIn() {
    try {
      await this.page.waitForSelector(
        'nav, [class*="dashboard"], [class*="navbar"], [class*="sidebar"], .main-nav',
        { timeout: 15000 }
);
      const currentUrl = this.page.url();
      return !currentUrl.includes('login') || currentUrl.includes('drt/');
    } catch {
      return false;
    }
  }

  /**
   * Get error message text
   * @returns {Promise<string>}
   */
  async getErrorMessage() {
    try {
      await this.errorMessage.first().waitFor({ state: 'visible', timeout: 5000 });
      return await this.errorMessage.first().textContent();
    } catch {
      return '';
    }
  }

  /**
 * Wait for loading to complete
 */
  async waitForLoadingComplete() {
    try {
      await this.loadingSpinner.first().waitFor({ state: 'hidden', timeout: 30000 });
    } catch {
      // Spinner may not exist
    }
    await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  }

  /**
   * Logout from the application
   */
  async logout() {
    try {
      await this.userMenu.first().click();
      await this.logoutButton.first().click();
      await this.page.waitForTimeout(2000);
    } catch {
      await this.logoutButton.first().click();
      await this.page.waitForTimeout(2000);
    }
  }

  /**
   * Take screenshot of current state
   * @param {string} name
   */
  async takeScreenshot(name) {
  await this.page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
  }
}

module.exports = { LoginPage };
