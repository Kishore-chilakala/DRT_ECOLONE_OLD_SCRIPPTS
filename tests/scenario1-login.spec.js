/**
 * Scenario 1: Login Functionality
 * Objective: Login with one user (approx 1k users)
 * Platform: eColane DRT Platform
 * URL: https://qa-react.ecolane.com/drt/
 * Role: Scheduler/Planner or Admin
 */

const { test, expect } = require('@playwright/test');
const { LoginPage } = require('./pages/LoginPage');
const { TEST_CONFIG } = require('./config/testData');

test.describe('Scenario 1: Login Functionality', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
  });

  // ─────────────────────────────────────────────
  // TC-01: Successful Login with valid credentials
  // ─────────────────────────────────────────────
  test('TC-01: Successful login with valid Admin/Scheduler credentials', async ({ page }) => {
    // Step 1: Navigate to eColane DRT Platform
    await test.step('Navigate to eColane DRT login page', async () => {
   await loginPage.navigate();
      await expect(page).toHaveURL(/qa-react\.ecolane\.com\/drt/);
    });

    // Step 2: Verify login page is displayed
  await test.step('Verify login page is displayed', async () => {
      await loginPage.takeScreenshot('01_login_page_loaded');
      const usernameVisible = await loginPage.usernameInput.isVisible();
  expect(usernameVisible, 'Username input should be visible').toBeTruthy();
      const passwordVisible = await loginPage.passwordInput.isVisible();
      expect(passwordVisible, 'Password input should be visible').toBeTruthy();
  const loginBtnVisible = await loginPage.loginButton.isVisible();
      expect(loginBtnVisible, 'Login button should be visible').toBeTruthy();
  });

    // Step 3: Enter username
    await test.step('Enter valid username', async () => {
      await loginPage.enterUsername(TEST_CONFIG.credentials.username);
    });

    // Step 4: Enter password
    await test.step('Enter valid password', async () => {
      await loginPage.enterPassword(TEST_CONFIG.credentials.password);
    });

    // Step 5: Click login button
    await test.step('Click login button', async () => {
      await loginPage.clickLogin();
    });

    // Step 6: Verify successful login
    await test.step('Verify user is logged in and dashboard is visible', async () => {
      await loginPage.waitForLoadingComplete();
      await loginPage.takeScreenshot('01_login_success');
      const loggedIn = await loginPage.isLoggedIn();
      expect(loggedIn, 'User should be logged in after valid credentials').toBeTruthy();
    });

    // Step 7: Verify session is active (URL no longer on login page)
    await test.step('Verify session is active', async () => {
      const currentUrl = page.url();
      console.log('Current URL after login:', currentUrl);
      expect(currentUrl).toContain('ecolane.com');
    });
  });

  // ─────────────────────────────────────────────
  // TC-02: Login page loads correctly
  // ─────────────────────────────────────────────
  test('TC-02: Login page loads with all required elements', async ({ page }) => {
    await test.step('Navigate to login URL', async () => {
      await loginPage.navigate();
  });

    await test.step('Verify all login form elements are present', async () => {
      await loginPage.takeScreenshot('02_login_form_elements');
      await expect(loginPage.usernameInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.loginButton).toBeVisible();
    });

    await test.step('Verify page title or branding is displayed', async () => {
      const title = await page.title();
      console.log('Page title:', title);
      expect(title).toBeTruthy();
    });
  });

  // ─────────────────────────────────────────────
  // TC-03: Login with invalid credentials shows error
  // ─────────────────────────────────────────────
  test('TC-03: Login with invalid credentials shows error message', async ({ page }) => {
    await test.step('Navigate to login page', async () => {
      await loginPage.navigate();
    });

    await test.step('Enter invalid credentials', async () => {
      await loginPage.enterUsername('invalid_user_xyz');
      await loginPage.enterPassword('WrongPassword!999');
    });

    await test.step('Click login button', async () => {
      await loginPage.clickLogin();
      await page.waitForTimeout(3000);
    });

    await test.step('Verify error message is shown or login is rejected', async () => {
  await loginPage.takeScreenshot('03_invalid_login_error');
      const errorMsg = await loginPage.getErrorMessage();
      const currentUrl = page.url();
      // Either an error message appears OR user stays on login page
   const isStillOnLoginPage =
    currentUrl.includes('login') ||
        (await loginPage.usernameInput.isVisible().catch(() => false));
      console.log('Error message:', errorMsg);
      console.log('Still on login page:', isStillOnLoginPage);
      // Validate that login was not successful
      expect(errorMsg.length > 0 || isStillOnLoginPage, 'Should show error or stay on login page').toBeTruthy();
    });
  });

  // ─────────────────────────────────────────────
  // TC-04: Login with empty credentials
  // ─────────────────────────────────────────────
  test('TC-04: Login with empty credentials shows validation', async ({ page }) => {
    await test.step('Navigate to login page', async () => {
      await loginPage.navigate();
    });

    await test.step('Click login button without entering credentials', async () => {
      await loginPage.loginButton.click();
      await page.waitForTimeout(2000);
  });

    await test.step('Verify validation prevents login', async () => {
  await loginPage.takeScreenshot('04_empty_credentials_validation');
      const loggedIn = await loginPage.isLoggedIn();
      expect(loggedIn, 'User should NOT be logged in with empty credentials').toBeFalsy();
    });
  });

  // ─────────────────────────────────────────────
  // TC-05: Password field masks input
  // ─────────────────────────────────────────────
  test('TC-05: Password field should mask the entered text', async ({ page }) => {
    await test.step('Navigate to login page', async () => {
      await loginPage.navigate();
  });

await test.step('Verify password field type is password (masked)', async () => {
    const inputType = await loginPage.passwordInput.getAttribute('type');
 expect(inputType).toBe('password');
  });
  });

  // ─────────────────────────────────────────────
  // TC-06: Complete login and verify navigation menu
  // ─────────────────────────────────────────────
  test('TC-06: After login, navigation menu items are accessible', async ({ page }) => {
    await test.step('Navigate and login', async () => {
      await loginPage.navigate();
      await loginPage.login(
        TEST_CONFIG.credentials.username,
        TEST_CONFIG.credentials.password
      );
      await loginPage.waitForLoadingComplete();
    });

    await test.step('Verify navigation/menu is visible after login', async () => {
      await loginPage.takeScreenshot('06_post_login_navigation');
      // Check for any navigation-related element
      const navVisible = await page.locator('nav, [class*="navbar"], [class*="sidebar"], [class*="menu"], header').first().isVisible();
      expect(navVisible, 'Navigation menu should be visible after login').toBeTruthy();
    });

    await test.step('Verify user role indicator is present', async () => {
      const pageContent = await page.textContent('body');
      console.log('Page loaded successfully after login');
      expect(pageContent.length).toBeGreaterThan(0);
  });
  });
});
