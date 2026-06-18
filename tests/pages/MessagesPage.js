/**
 * Messages Page Object Model
 * Handles Send Messages interactions for eColane DRT Platform
 */

class MessagesPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Recipient / To field
    this.recipientSelect = page.locator(
      'select[name*="recipient" i], select[id*="recipient" i], select[name*="to" i], select[id*="to" i]'
).first();
    this.recipientInput = page.locator(
  'input[name*="recipient" i], input[id*="recipient" i], input[placeholder*="recipient" i], input[placeholder*="to" i]'
  ).first();

    // Message type
    this.messageTypeSelect = page.locator(
      'select[name*="type" i], select[id*="type" i], select[name*="message-type" i]'
    ).first();

    // Subject field
    this.subjectInput = page.locator(
      'input[name*="subject" i], input[id*="subject" i], input[placeholder*="subject" i]'
 ).first();

    // Message body / content
    this.messageBodyTextarea = page.locator(
    'textarea[name*="body" i], textarea[id*="body" i], textarea[name*="message" i], textarea[id*="message" i], textarea[placeholder*="message" i], textarea[placeholder*="body" i], textarea'
    ).first();

    // Provider / Driver selection
    this.providerSelect = page.locator(
      'select[name*="provider" i], select[id*="provider" i]'
    ).first();
 this.driverSelect = page.locator(
      'select[name*="driver" i], select[id*="driver" i]'
    ).first();

    // Send button
    this.sendButton = page.locator(
      'button:has-text("Send"), button[type="submit"]:has-text("Send"), input[type="submit"][value*="Send" i]'
    ).first();
    this.cancelButton = page.locator(
      'button:has-text("Cancel"), a:has-text("Cancel")'
    ).first();

    // Success / error feedback
    this.successMessage = page.locator(
      '[class*="success"], [class*="Success"], .alert-success, [role="alert"], [class*="confirm"]'
    ).first();
    this.errorMessage = page.locator(
      '[class*="error"], [class*="Error"], .alert-danger'
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
   * Select recipient (Driver / Provider) from dropdown
   * @param {string} recipient
   */
  async selectRecipient(recipient) {
    try {
      const selectCount = await this.recipientSelect.count();
      if (selectCount > 0) {
        await this.recipientSelect.waitFor({ state: 'visible', timeout: 10000 });
        await this.recipientSelect.selectOption({ label: recipient });
      } else {
        await this.recipientInput.waitFor({ state: 'visible', timeout: 10000 });
        await this.recipientInput.clear();
        await this.recipientInput.fill(recipient);
      }
} catch { /* field handling */ }
  }

  /**
   * Select message type
   * @param {string} messageType
   */
  async selectMessageType(messageType) {
    try {
      await this.messageTypeSelect.waitFor({ state: 'visible', timeout: 10000 });
      await this.messageTypeSelect.selectOption({ label: messageType });
    } catch { /* optional */ }
  }

  /**
   * Fill subject
   * @param {string} subject
 */
  async fillSubject(subject) {
    try {
      await this.subjectInput.waitFor({ state: 'visible', timeout: 10000 });
      await this.subjectInput.clear();
 await this.subjectInput.fill(subject);
 } catch { /* subject may not be required */ }
  }

  /**
   * Fill message body
   * @param {string} body
   */
  async fillMessageBody(body) {
    await this.messageBodyTextarea.waitFor({ state: 'visible', timeout: 15000 });
    await this.messageBodyTextarea.clear();
    await this.messageBodyTextarea.fill(body);
  }

  /**
   * Select provider
   * @param {string} provider
   */
  async selectProvider(provider) {
    try {
      await this.providerSelect.waitFor({ state: 'visible', timeout: 10000 });
      await this.providerSelect.selectOption({ label: provider });
    } catch { /* optional */ }
  }

  /**
   * Select driver
   * @param {string} driver
   */
  async selectDriver(driver) {
    try {
      await this.driverSelect.waitFor({ state: 'visible', timeout: 10000 });
      await this.driverSelect.selectOption({ label: driver });
 } catch { /* optional */ }
  }

  /**
   * Click Send button
   */
  async clickSend() {
    await this.sendButton.waitFor({ state: 'visible', timeout: 15000 });
    await this.sendButton.click();
    await this.waitForLoad();
  }

  /**
   * Check if message was sent successfully
   * @returns {Promise<boolean>}
   */
  async isMessageSent() {
    try {
   await this.successMessage.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      // Check page content for success indicators
      const pageContent = await this.page.textContent('body');
      return (
        pageContent.toLowerCase().includes('sent') ||
        pageContent.toLowerCase().includes('success')
      );
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

module.exports = { MessagesPage };
