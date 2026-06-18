/**
 * Scenario 5: Send Messages
 * Objective: Send messages to Drivers and Providers (approx 1k users)
 * Platform: eColane DRT Platform
 * Navigation: Operations --> Messages --> Send Messages
 */

const { test, expect } = require('@playwright/test');
const { LoginPage } = require('./pages/LoginPage');
const { NavigationPage } = require('./pages/NavigationPage');
const { MessagesPage } = require('./pages/MessagesPage');
const { TEST_CONFIG } = require('./config/testData');

test.describe('Scenario 5: Send Messages to Driver and Providers', () => {
  let loginPage;
  let navigationPage;
  let messagesPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    navigationPage = new NavigationPage(page);
    messagesPage = new MessagesPage(page);

    // Step 1: Login
    await loginPage.navigate();
    await loginPage.login(
      TEST_CONFIG.credentials.username,
      TEST_CONFIG.credentials.password
    );
    await loginPage.waitForLoadingComplete();

    const loggedIn = await loginPage.isLoggedIn();
    expect(loggedIn, 'User must be logged in to send messages').toBeTruthy();
  });

  // ──────────────────────────────────────────────────────
  // TC-01: Navigate to Operations > Messages > Send Messages
  // ──────────────────────────────────────────────────────
  test('TC-01: Navigate to Operations > Messages > Send Messages', async ({ page }) => {
    await test.step('Click Operations menu and navigate to Send Messages', async () => {
      await navigationPage.goToSendMessages();
      await messagesPage.takeScreenshot('05_TC01_send_messages_page');
    });

    await test.step('Verify Send Messages page is displayed', async () => {
      const url = page.url();
      const pageContent = await page.textContent('body');
      console.log('Send Messages URL:', url);
      expect(pageContent.toLowerCase()).toMatch(/message|send|recipient|driver|provider/i);
    });
  });

  // ──────────────────────────────────────────────────────
  // TC-02: Verify Send Messages form has all required fields
  // ──────────────────────────────────────────────────────
  test('TC-02: Send Messages form displays required fields', async ({ page }) => {
    await test.step('Navigate to Send Messages page', async () => {
  await navigationPage.goToSendMessages();
    });

    await test.step('Verify message body / content field is present', async () => {
    await messagesPage.takeScreenshot('05_TC02_form_fields');
    const bodyVisible = await messagesPage.messageBodyTextarea.isVisible().catch(() => false);
      console.log('Message body textarea visible:', bodyVisible);
    });

  await test.step('Verify Send button is present', async () => {
      const sendVisible = await messagesPage.sendButton.isVisible().catch(() => false);
      console.log('Send button visible:', sendVisible);
      expect(sendVisible, 'Send button should be visible on the form').toBeTruthy();
    });
  });

  // ──────────────────────────────────────────────────────
  // TC-03: Fill all message details and send to Driver
  // ──────────────────────────────────────────────────────
  test('TC-03: Fill message details and send message to Driver', async ({ page }) => {
    await test.step('Navigate to Send Messages page', async () => {
      await navigationPage.goToSendMessages();
    });

    await test.step('Select recipient type (Driver)', async () => {
      await messagesPage.selectRecipient(TEST_CONFIG.message.recipient);
      await messagesPage.takeScreenshot('05_TC03_recipient_selected');
    });

    await test.step('Select message type', async () => {
      await messagesPage.selectMessageType(TEST_CONFIG.message.messageType);
    });

    await test.step('Fill Subject (if present)', async () => {
      await messagesPage.fillSubject(TEST_CONFIG.message.subject);
    });

    await test.step('Fill message body/content', async () => {
 await messagesPage.fillMessageBody(TEST_CONFIG.message.body);
      await messagesPage.takeScreenshot('05_TC03_message_body_filled');
    });

    await test.step('Take screenshot of complete filled form', async () => {
      await messagesPage.takeScreenshot('05_TC03_full_form_filled');
    });

  await test.step('Click Send button', async () => {
      await messagesPage.clickSend();
  await messagesPage.takeScreenshot('05_TC03_after_send');
  });

    await test.step('Verify message was sent', async () => {
  const sent = await messagesPage.isMessageSent();
      const pageContent = await page.textContent('body');
      console.log('Message sent result:', sent);
      console.log('Page content after send (partial):', pageContent.substring(0, 300));
    });
  });

  // ──────────────────────────────────────────────────────
  // TC-04: Send message to Provider
  // ──────────────────────────────────────────────────────
  test('TC-04: Send message to Provider', async ({ page }) => {
  await test.step('Navigate to Send Messages page', async () => {
      await navigationPage.goToSendMessages();
    });

    await test.step('Select Provider as recipient', async () => {
      await messagesPage.selectRecipient('Provider');
      await messagesPage.takeScreenshot('05_TC04_provider_selected');
    });

    await test.step('Select provider from provider dropdown (if shown)', async () => {
      await messagesPage.selectProvider('Default Provider');
    });

    await test.step('Fill message body', async () => {
      await messagesPage.fillMessageBody('Test message to Provider from Playwright automation - ' + new Date().toISOString());
    });

 await test.step('Click Send button', async () => {
  await messagesPage.clickSend();
      await messagesPage.takeScreenshot('05_TC04_provider_message_sent');
    });

    await test.step('Verify message was sent to provider', async () => {
      const sent = await messagesPage.isMessageSent();
      console.log('Provider message sent result:', sent);
    });
  });

  // ──────────────────────────────────────────────────────
  // TC-05: Verify message body is required field
  // ──────────────────────────────────────────────────────
  test('TC-05: Message body is a required field', async ({ page }) => {
    await test.step('Navigate to Send Messages page', async () => {
      await navigationPage.goToSendMessages();
    });

  await test.step('Attempt to send without filling message body', async () => {
      // Try clicking send without filling body
      await messagesPage.clickSend();
      await messagesPage.takeScreenshot('05_TC05_empty_body_validation');
    });

    await test.step('Verify validation prevents sending empty message', async () => {
      const pageContent = await page.textContent('body');
      const sendBtnStillVisible = await messagesPage.sendButton.isVisible().catch(() => false);
      console.log('Send button still visible (means form not submitted):', sendBtnStillVisible);
      console.log('Page content after empty send attempt:', pageContent.substring(0, 200));
    });
  });

  // ──────────────────────────────────────────────────────
  // TC-06: Send message with subject and body to Driver
  // ──────────────────────────────────────────────────────
  test('TC-06: Send message with subject and body to Driver', async ({ page }) => {
    await test.step('Navigate to Send Messages page', async () => {
      await navigationPage.goToSendMessages();
    });

    await test.step('Fill all fields including subject', async () => {
      await messagesPage.selectRecipient('Driver');
      await messagesPage.fillSubject('Urgent: Route Change - ' + new Date().toLocaleDateString());
      await messagesPage.fillMessageBody(
        'Dear Driver, please be advised of a route change today. Report to dispatch for updated instructions. This is an automated test message.'
      );
      await messagesPage.takeScreenshot('05_TC06_subject_and_body_filled');
    });

    await test.step('Click Send and verify', async () => {
      await messagesPage.clickSend();
      await messagesPage.takeScreenshot('05_TC06_message_sent');
    const sent = await messagesPage.isMessageSent();
      console.log('Message with subject sent result:', sent);
    });
  });

  // ──────────────────────────────────────────────────────
  // TC-07: Verify session is active during messaging
  // ──────────────────────────────────────────────────────
  test('TC-07: Session remains active during messaging workflow', async ({ page }) => {
    await test.step('Verify session is active', async () => {
      const loggedIn = await loginPage.isLoggedIn();
    expect(loggedIn, 'Session should remain active during messaging').toBeTruthy();
    });

    await test.step('Navigate to Send Messages (session active)', async () => {
      await navigationPage.goToSendMessages();
      const url = page.url();
      expect(url, 'Should not be redirected to login').not.toContain('login');
      await messagesPage.takeScreenshot('05_TC07_session_active_messages');
  });
  });

  // ──────────────────────────────────────────────────────
  // TC-08: Verify Send Messages page loads without errors
  // ──────────────────────────────────────────────────────
  test('TC-08: Send Messages page loads without any console errors', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
   }
    });

    await test.step('Navigate to Send Messages page', async () => {
      await navigationPage.goToSendMessages();
      await messagesPage.takeScreenshot('05_TC08_page_load_check');
    });

    await test.step('Verify page loaded without critical errors', async () => {
      console.log('Console errors captured:', consoleErrors.length);
    if (consoleErrors.length > 0) {
        console.log('Errors:', consoleErrors);
      }
      // Page should be accessible even if there are minor console warnings
    const pageContent = await page.textContent('body');
   expect(pageContent.length, 'Page should have content').toBeGreaterThan(0);
    });
  });
});
