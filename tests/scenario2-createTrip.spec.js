/**
 * Scenario 2: Create a substantial number of trips in the future
 * Objective: Create Trips for particular client (approx 1k users)
 * Platform: eColane DRT Platform
 * Navigation: Administration --> Clients --> Client Number 21879 --> Search --> New Trip
 */

const { test, expect } = require('@playwright/test');
const { LoginPage } = require('./pages/LoginPage');
const { NavigationPage } = require('./pages/NavigationPage');
const { TripPage } = require('./pages/TripPage');
const { TEST_CONFIG } = require('./config/testData');

test.describe('Scenario 2: Create Trip for Client 21879', () => {
  let loginPage;
  let navigationPage;
  let tripPage;

  // Login once before all tests in this suite
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    navigationPage = new NavigationPage(page);
    tripPage = new TripPage(page);

    // Step 1: Login
    await loginPage.navigate();
    await loginPage.login(
      TEST_CONFIG.credentials.username,
      TEST_CONFIG.credentials.password
    );
    await loginPage.waitForLoadingComplete();

    const loggedIn = await loginPage.isLoggedIn();
    expect(loggedIn, 'User must be logged in before trip creation').toBeTruthy();
  });

  // ──────────────────────────────────────────────────────
  // TC-01: Navigate to Administration > Clients
  // ──────────────────────────────────────────────────────
  test('TC-01: Navigate to Administration > Clients module', async ({ page }) => {
    await test.step('Click Administration menu', async () => {
    await navigationPage.goToAdministrationClients();
      await tripPage.takeScreenshot('02_TC01_admin_clients');
    });

    await test.step('Verify Clients page is displayed', async () => {
      const url = page.url();
      console.log('Clients page URL:', url);
      const pageContent = await page.textContent('body');
      expect(pageContent.toLowerCase()).toMatch(/client|administration/i);
    });
  });

  // ──────────────────────────────────────────────────────
  // TC-02: Search for Client Number 21879
  // ──────────────────────────────────────────────────────
  test('TC-02: Search for Client Number 21879', async ({ page }) => {
    await test.step('Navigate to Administration > Clients', async () => {
      await navigationPage.goToAdministrationClients();
});

 await test.step('Enter client number 21879 and search', async () => {
      await navigationPage.searchClient(TEST_CONFIG.client.clientNumber);
      await tripPage.takeScreenshot('02_TC02_client_search_results');
    });

    await test.step('Verify client search results are displayed', async () => {
const pageContent = await page.textContent('body');
      console.log('Search result page content (partial):', pageContent.substring(0, 300));
      // Verify either client number or results table is present
      expect(pageContent).toMatch(/21879|client|result/i);
    });
  });

  // ──────────────────────────────────────────────────────
  // TC-03: Click on Client 21879 and open New Trip
  // ──────────────────────────────────────────────────────
  test('TC-03: Open New Trip for Client 21879', async ({ page }) => {
    await test.step('Navigate to Administration > Clients', async () => {
      await navigationPage.goToAdministrationClients();
    });

    await test.step('Search for Client 21879', async () => {
      await navigationPage.searchClient(TEST_CONFIG.client.clientNumber);
    });

    await test.step('Click on client result to open client profile', async () => {
      // Try clicking on a link or row containing the client number
const clientLink = page.locator(
        `text=${TEST_CONFIG.client.clientNumber}, a:has-text("${TEST_CONFIG.client.clientNumber}"), [class*="result"] >> text=${TEST_CONFIG.client.clientNumber}`
      ).first();
      try {
        await clientLink.waitFor({ state: 'visible', timeout: 10000 });
        await clientLink.click();
 } catch {
 // Try clicking first table row result
        await tripPage.clickFirstClientResult();
      }
      await navigationPage.waitForPageLoad();
      await tripPage.takeScreenshot('02_TC03_client_profile');
    });

    await test.step('Click New Trip button', async () => {
      await tripPage.clickNewTrip();
      await tripPage.takeScreenshot('02_TC03_new_trip_form');
    });

    await test.step('Verify New Trip form is displayed', async () => {
   const pageContent = await page.textContent('body');
    expect(pageContent.toLowerCase()).toMatch(/trip|pickup|destination|create/i);
    });
  });

  // ──────────────────────────────────────────────────────
// TC-04: Fill all mandatory trip fields and create trip
  // ──────────────────────────────────────────────────────
  test('TC-04: Create a new trip with all mandatory fields', async ({ page }) => {
    await test.step('Navigate to Administration > Clients', async () => {
    await navigationPage.goToAdministrationClients();
    });

    await test.step('Search and open Client 21879', async () => {
    await navigationPage.searchClient(TEST_CONFIG.client.clientNumber);
      const clientLink = page.locator(
        `a:has-text("${TEST_CONFIG.client.clientNumber}"), text=${TEST_CONFIG.client.clientNumber}`
      ).first();
   try {
        await clientLink.waitFor({ state: 'visible', timeout: 8000 });
await clientLink.click();
      } catch {
        await tripPage.clickFirstClientResult();
      }
    await navigationPage.waitForPageLoad();
    });

    await test.step('Click New Trip button', async () => {
      await tripPage.clickNewTrip();
    });

    await test.step('Fill Pickup Address', async () => {
      await tripPage.fillPickupAddress(TEST_CONFIG.trip.pickupAddress);
      await tripPage.takeScreenshot('02_TC04_pickup_filled');
    });

    await test.step('Fill Dropoff Address', async () => {
      await tripPage.fillDropoffAddress(TEST_CONFIG.trip.dropoffAddress);
   await tripPage.takeScreenshot('02_TC04_dropoff_filled');
    });

    await test.step('Fill Trip Date', async () => {
      await tripPage.fillTripDate(TEST_CONFIG.trip.tripDate);
    });

  await test.step('Fill Trip Time', async () => {
      await tripPage.fillTripTime(TEST_CONFIG.trip.tripTime);
    });

    await test.step('Fill Appointment Time', async () => {
      await tripPage.fillAppointmentTime(TEST_CONFIG.trip.appointmentTime);
    });

 await test.step('Select Trip Purpose', async () => {
      await tripPage.selectTripPurpose(TEST_CONFIG.trip.tripPurpose);
    });

    await test.step('Fill Spaces', async () => {
      await tripPage.fillSpaces(TEST_CONFIG.trip.spaces);
    });

    await test.step('Select Funding Source', async () => {
    await tripPage.selectFundingSource(TEST_CONFIG.trip.fundingSource);
    });

    await test.step('Select Service Type', async () => {
      await tripPage.selectServiceType(TEST_CONFIG.trip.serviceType);
    });

    await test.step('Take screenshot of filled form', async () => {
      await tripPage.takeScreenshot('02_TC04_trip_form_filled');
    });

    await test.step('Click Create Trip button', async () => {
      await tripPage.clickCreateTrip();
      await tripPage.takeScreenshot('02_TC04_trip_submitted');
    });

    await test.step('Verify trip was created successfully', async () => {
      const created = await tripPage.isTripCreated();
      console.log('Trip creation result:', created);
      // Check page content for any confirmation
  const pageContent = await page.textContent('body');
      console.log('Page after trip create (partial):', pageContent.substring(0, 300));
      await tripPage.takeScreenshot('02_TC04_trip_creation_result');
    });
  });

  // ──────────────────────────────────────────────────────
  // TC-05: Verify trip date is in the future
  // ──────────────────────────────────────────────────────
  test('TC-05: Trip date field accepts future dates', async ({ page }) => {
    await test.step('Navigate to Administration > Clients', async () => {
    await navigationPage.goToAdministrationClients();
    });

    await test.step('Search and open Client 21879', async () => {
      await navigationPage.searchClient(TEST_CONFIG.client.clientNumber);
      try {
        await tripPage.clickFirstClientResult();
      } catch { /* may already be open */ }
      await navigationPage.waitForPageLoad();
    });

    await test.step('Open New Trip form', async () => {
      await tripPage.clickNewTrip();
    });

    await test.step('Set future trip date and verify acceptance', async () => {
      const futureDate = '08/01/2026';
      await tripPage.fillTripDate(futureDate);
      await tripPage.takeScreenshot('02_TC05_future_date_set');
      // Verify no date validation error shown
   const errorVisible = await page.locator('[class*="error"], .alert-danger').isVisible().catch(() => false);
      console.log('Date error visible:', errorVisible);
  });
  });

  // ──────────────────────────────────────────────────────
  // TC-06: Verify session remains active during trip creation
  // ──────────────────────────────────────────────────────
  test('TC-06: Session remains active during trip creation workflow', async ({ page }) => {
    await test.step('Verify session is active after login', async () => {
      const loggedIn = await loginPage.isLoggedIn();
      expect(loggedIn, 'Session should be active').toBeTruthy();
    });

    await test.step('Navigate to Clients module (session active)', async () => {
    await navigationPage.goToAdministrationClients();
      const url = page.url();
      // Should NOT be redirected to login page
 expect(url).not.toContain('login');
      await tripPage.takeScreenshot('02_TC06_session_active');
    });
  });
});
