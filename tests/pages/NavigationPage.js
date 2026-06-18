/**
 * Navigation Page Object Model
 * Handles top-level navigation menu interactions for eColane DRT Platform
 */

class NavigationPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
  this.page = page;

    // Top-level menu items
    this.administrationMenu = page.locator('text=Administration, a:has-text("Administration"), [class*="nav"] >> text=Administration').first();
    this.operationsMenu = page.locator('text=Operations, a:has-text("Operations"), [class*="nav"] >> text=Operations').first();

    // Administration sub-menus
    this.clientsMenuItem = page.locator('text=Clients, a:has-text("Clients")').first();
    this.newClientMenuItem = page.locator('text="New Client", a:has-text("New Client")').first();

    // Operations sub-menus
    this.schedulesMenuItem = page.locator('text=Schedules, a:has-text("Schedules")').first();
    this.messagesMenuItem = page.locator('text=Messages, a:has-text("Messages")').first();
    this.optimizeSchedulesMenuItem = page.locator('text="Optimize Schedules", a:has-text("Optimize Schedules"), text="Optimize schedules"').first();
    this.sendMessagesMenuItem = page.locator('text="Send Messages", a:has-text("Send Messages")').first();

  // Breadcrumb / page title
    this.pageTitle = page.locator('h1, h2, [class*="page-title"], [class*="pageTitle"], [class*="heading"]').first();

    // Generic spinner/loader
    this.loadingSpinner = page.locator('[class*="loading"], [class*="spinner"], .loader, [class*="progress"]');
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    try {
      await this.loadingSpinner.first().waitFor({ state: 'hidden', timeout: 15000 });
    } catch { /* spinner may not exist */ }
    await this.page.waitForTimeout(1500);
  }

  /**
   * Navigate to Administration > Clients
 */
  async goToAdministrationClients() {
    await this.administrationMenu.waitFor({ state: 'visible', timeout: 20000 });
    await this.administrationMenu.click();
    await this.page.waitForTimeout(1000);
 await this.clientsMenuItem.waitFor({ state: 'visible', timeout: 15000 });
    await this.clientsMenuItem.click();
    await this.waitForPageLoad();
  }

  /**
   * Navigate to Administration > Clients > New Client
   */
  async goToNewClient() {
    await this.administrationMenu.waitFor({ state: 'visible', timeout: 20000 });
    await this.administrationMenu.click();
    await this.page.waitForTimeout(1000);
    await this.clientsMenuItem.waitFor({ state: 'visible', timeout: 15000 });
    await this.clientsMenuItem.click();
    await this.page.waitForTimeout(1000);
    await this.newClientMenuItem.waitFor({ state: 'visible', timeout: 15000 });
    await this.newClientMenuItem.click();
    await this.waitForPageLoad();
  }

  /**
   * Navigate to Operations > Schedules > Optimize Schedules
   */
  async goToOptimizeSchedules() {
    await this.operationsMenu.waitFor({ state: 'visible', timeout: 20000 });
    await this.operationsMenu.click();
    await this.page.waitForTimeout(1000);
    await this.schedulesMenuItem.waitFor({ state: 'visible', timeout: 15000 });
    await this.schedulesMenuItem.click();
    await this.page.waitForTimeout(1000);
    await this.optimizeSchedulesMenuItem.waitFor({ state: 'visible', timeout: 15000 });
    await this.optimizeSchedulesMenuItem.click();
    await this.waitForPageLoad();
  }

  /**
   * Navigate to Operations > Messages > Send Messages
   */
  async goToSendMessages() {
    await this.operationsMenu.waitFor({ state: 'visible', timeout: 20000 });
    await this.operationsMenu.click();
    await this.page.waitForTimeout(1000);
 await this.messagesMenuItem.waitFor({ state: 'visible', timeout: 15000 });
    await this.messagesMenuItem.click();
    await this.page.waitForTimeout(1000);
    await this.sendMessagesMenuItem.waitFor({ state: 'visible', timeout: 15000 });
    await this.sendMessagesMenuItem.click();
    await this.waitForPageLoad();
  }

  /**
   * Search for a client by client number
   * @param {string} clientNumber
   */
  async searchClient(clientNumber) {
    const searchInput = this.page.locator(
      'input[placeholder*="client" i], input[placeholder*="search" i], input[name*="client" i], input[id*="client" i], input[id*="search" i]'
 ).first();
    await searchInput.waitFor({ state: 'visible', timeout: 15000 });
    await searchInput.clear();
    await searchInput.fill(clientNumber);

    const searchBtn = this.page.locator(
   'button:has-text("Search"), input[type="submit"][value*="Search" i], button[type="submit"]'
).first();
    await searchBtn.click();
    await this.waitForPageLoad();
  }

  /**
   * Take a screenshot
   * @param {string} name
   */
  async takeScreenshot(name) {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
  }
}

module.exports = { NavigationPage };
