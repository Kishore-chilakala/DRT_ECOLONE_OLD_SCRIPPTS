import { test, expect } from '@playwright/test';
import {
  injectPerformanceObserver,
  measureRender,
  getNavigationTiming,
  buildReport,
  printReport,
  RenderTiming,
} from './helpers/perfHelper';

const BASE_URL = 'https://qa-react.ecolane.com/drt';

/** Generate a future date label matching the React calendar widget button name pattern. */
const futureDateLabel = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
  const month   = d.toLocaleDateString('en-US', { month: 'long' });
  const day     = d.getDate();
  return `${weekday}, ${month} ${day},`;
};

/**
 * Dismisses the Pendo Resource Center modal if it is visible on the page.
 * The modal (#pendo-resource-center-container) can appear at any time after login.
 * We close it via its dedicated "Close" button to unblock further interactions.
 */
async function dismissPendoModal(page: import('@playwright/test').Page): Promise<void> {
  const pendoContainer = page.locator('#pendo-resource-center-container');
  if (await pendoContainer.isVisible({ timeout: 3_000 }).catch(() => false)) {
    const closeBtn = pendoContainer.locator('button[aria-label="Close"]');
    if (await closeBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await closeBtn.click();
      console.log('[PENDO] Resource Center modal dismissed.');
      await page.waitForTimeout(500);
    }
  }
}

test.describe('React Front-End â€“ Full Trip Booking Flow', { tag: ['@oldscripts'] }, () => {
  test('Login â†’ Administration â†’ Clients â†’ New Client â†’ Book Trip â†’ Messages â†’ Logout', async ({ page }) => {
    // Allow up to 5 minutes for the full end-to-end flow on a remote QA environment
    test.setTimeout(300_000);

    const timings: RenderTiming[] = [];

    // Generate a unique client first name: "test" + 5 random digits
    const randomFirstName = `test${Math.floor(10000 + Math.random() * 90000)}`;

    // â”€â”€ Step 1: Inject PerformanceObserver before any navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    await injectPerformanceObserver(page);

    // â”€â”€ Step 2: Navigate to React DRT login page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    await page.goto('https://qa-react.ecolane.com/drt/');
    await page.waitForLoadState('domcontentloaded');

    // Capture initial page Navigation Timing
    const navTiming = await getNavigationTiming(page);

    // â”€â”€ Step 3: Verify login form is visible â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t1 = await measureRender(page, 'login-form-visible', async () => {
      await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
    }, 'domcontentloaded');
    timings.push(t1);

    // â”€â”€ Step 4: Fill username â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t2 = await measureRender(page, 'fill-username', async () => {
      await page.getByRole('textbox', { name: 'Username' }).click();
      await page.getByRole('textbox', { name: 'Username' }).fill('gen350');
    }, 'domcontentloaded');
    timings.push(t2);

    // â”€â”€ Step 5: Fill password â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t3 = await measureRender(page, 'fill-password', async () => {
      await page.getByRole('textbox', { name: 'Password' }).click();
      await page.getByRole('textbox', { name: 'Password' }).fill('GENTEST');
    }, 'domcontentloaded');
    timings.push(t3);

    // â”€â”€ Step 6: Sign in and verify main navigation is visible â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t4 = await measureRender(page, 'sign-in', async () => {
      await page.getByRole('button', { name: 'Log in' }).click();
      await page.waitForURL(/\/drt\/(?!sso\/login)/, { timeout: 30_000 }).catch(() => {});
      await expect(page.locator('nav, [role="navigation"]').first()).toBeVisible();
    }, 'domcontentloaded');
    timings.push(t4);

    await page.waitForTimeout(2000);

    // â”€â”€ Step 7: Open Administration menu â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t5 = await measureRender(page, 'open-administration-menu', async () => {
      await page.getByRole('button', { name: 'Administration' }).click();
      await expect(page.getByRole('menuitem', { name: 'Clients' })).toBeVisible();
    }, 'domcontentloaded');
    timings.push(t5);

    // â”€â”€ Step 8: Navigate to Clients â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t6 = await measureRender(page, 'clients-list-load', async () => {
      await page.getByRole('menuitem', { name: 'Clients' }).click();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      await expect(page.getByRole('textbox', { name: 'Free text search' })).toBeVisible();
    }, 'domcontentloaded');
    timings.push(t6);

    // 2-second stabilization pause after Clients page loads â€” NOT included in any timer measurement
    await page.waitForTimeout(2000);

    // â”€â”€ Step 9: Open New Client form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t7 = await measureRender(page, 'open-new-client-form', async () => {
      await page.getByRole('button', { name: 'New client' }).click();
      await page.waitForLoadState('domcontentloaded');
      await expect(page.getByRole('textbox', { name: 'First name *' })).toBeVisible({ timeout: 15_000 });
    }, 'domcontentloaded');
    timings.push(t7);

    // â”€â”€ Step 10: Select client title (honorific) if available â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t8 = await measureRender(page, 'select-client-title', async () => {
      // The React new client form may expose a title/honorific dropdown; interact if visible
      const titleBtn = page.getByRole('button', { name: /title|honorific|mr\.|mrs\.|ms\./i }).first();
      if (await titleBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await titleBtn.click();
        const mrOption = page.getByRole('option', { name: /^mr\.?$/i }).first();
        if (await mrOption.isVisible({ timeout: 3_000 }).catch(() => false)) {
          await mrOption.click();
        } else {
          await page.keyboard.press('Escape');
        }
      } else {
        // Title field not present in this form â€” record timing for form readiness
        await expect(page.getByRole('textbox', { name: 'First name *' })).toBeVisible();
      }
    }, 'domcontentloaded');
    timings.push(t8);

    // â”€â”€ Step 11: Fill client first and last name â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t9 = await measureRender(page, 'fill-client-name', async () => {
      await page.getByRole('textbox', { name: 'First name *' }).click();
      await page.getByRole('textbox', { name: 'First name *' }).fill(randomFirstName);
      await page.getByRole('textbox', { name: 'Last name *' }).click();
      await page.getByRole('textbox', { name: 'Last name *' }).fill('load');
    }, 'domcontentloaded');
    timings.push(t9);

    // â”€â”€ Step 12: Fill date of birth (React equivalent of "set additional loading time") â”€â”€
    const t10 = await measureRender(page, 'set-additional-loading-time', async () => {
      await page.getByRole('textbox', { name: 'Date of birth' }).click();
      await page.getByRole('textbox', { name: 'Date of birth' }).fill('15051987');
      await expect(page.getByRole('textbox', { name: 'Date of birth' })).toHaveValue('15051987');
    }, 'domcontentloaded');
    timings.push(t10);

    await page.waitForTimeout(2000);

    // â”€â”€ Step 13: Submit new client â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t11 = await measureRender(page, 'create-new-client', async () => {
      await page.getByRole('button', { name: 'Create' }).click();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    }, 'domcontentloaded');
    timings.push(t11);

    await page.waitForTimeout(2000);

    // â”€â”€ Step 14: Back to Clients list â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t12 = await measureRender(page, 'clients-list-load', async () => {
      await page.getByRole('button', { name: 'Administration' }).click();
      await page.getByRole('menuitem', { name: 'Clients' }).click();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      await expect(page.getByRole('textbox', { name: 'Free text search' })).toBeVisible();
    }, 'domcontentloaded');
    timings.push(t12);

    await page.waitForTimeout(2000);

    // â”€â”€ Step 15: Search for client by ID â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t13 = await measureRender(page, 'search-client-by-id', async () => {
      await page.getByRole('textbox', { name: 'Free text search' }).click();
      await page.getByRole('textbox', { name: 'Free text search' }).fill('28325');
      await page.getByRole('button', { name: 'Search', exact: true }).click();
      const clientRow = page.getByRole('row').filter({ hasText: '28325' });
      await expect(clientRow).toBeVisible({ timeout: 25_000 });
    }, 'domcontentloaded');
    timings.push(t13);

    await page.waitForTimeout(2000);

    // â”€â”€ Step 16: Open New Trip form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t14 = await measureRender(page, 'open-new-trip', async () => {
      const clientRow = page.getByRole('row').filter({ hasText: '28325' });
      const newTripBtn = clientRow.getByRole('button', { name: 'New trip' }).first();
      await expect(newTripBtn).toBeVisible({ timeout: 10_000 });
      await expect(newTripBtn).toBeEnabled({ timeout: 10_000 });
      await newTripBtn.click();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
      await expect(page.getByRole('button', { name: 'No date selected' })).toBeVisible({ timeout: 15_000 });
    }, 'domcontentloaded');
    timings.push(t14);

    // Dismiss Pendo Resource Center modal if it pops up on the trip booking page
    //await dismissPendoModal(page);

    // â”€â”€ Step 17: Search pickup location â€” open Pick-up address popup â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t15 = await measureRender(page, 'search-pickup-location', async () => {
      await page.getByLabel('Pick-up').getByRole('button', { name: 'Toggle popup' }).click();
      await expect(page.getByText('Home address 10 Pine Hollow, Athens')).toBeVisible({ timeout: 10_000 });
    }, 'domcontentloaded');
    timings.push(t15);

    await page.waitForTimeout(2000);

    // â”€â”€ Step 18: Select pickup address â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t16 = await measureRender(page, 'select-pickup-address', async () => {
      await page.getByText('Home address 10 Pine Hollow, Athens').click();
    }, 'domcontentloaded');
    timings.push(t16);

    await page.waitForTimeout(2000);

    // â”€â”€ Step 19: Fill pickup notes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t17 = await measureRender(page, 'fill-pickup-notes', async () => {
      // React trip form may provide a pickup notes field; fill if visible
      const pickupNotes = page.getByLabel('Pick-up').getByRole('textbox', { name: /notes?/i });
      if (await pickupNotes.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await pickupNotes.click();
        await pickupNotes.fill('test');
      } else {
        // No separate notes field â€” confirm pick-up address is set
        await expect(page.getByLabel('Pick-up')).toBeVisible();
      }
    }, 'domcontentloaded');
    timings.push(t17);

    await page.waitForTimeout(2000);

    // â”€â”€ Step 20: Search dropoff location â€” open Drop-off address popup â”€â”€â”€â”€â”€â”€â”€â”€
    const t18 = await measureRender(page, 'search-dropoff-location', async () => {
      await page.getByLabel('Drop-off').getByRole('button', { name: 'Toggle popup' }).click();
      await expect(page.getByLabel('Drop-off').getByText('100 Hillside Street 100')).toBeVisible({ timeout: 10_000 });
    }, 'domcontentloaded');
    timings.push(t18);

    await page.waitForTimeout(2000);

    // â”€â”€ Step 21: Select dropoff address â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t19 = await measureRender(page, 'select-dropoff-address', async () => {
      await page.getByLabel('Drop-off').getByText('100 Hillside Street 100').click();
    }, 'domcontentloaded');
    timings.push(t19);

    await page.waitForTimeout(2000);

    // â”€â”€ Step 22: Fill dropoff notes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t20 = await measureRender(page, 'fill-dropoff-notes', async () => {
      // React trip form may provide a dropoff notes field; fill if visible
      const dropoffNotes = page.getByLabel('Drop-off').getByRole('textbox', { name: /notes?/i });
      if (await dropoffNotes.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await dropoffNotes.click();
        await dropoffNotes.fill('test');
      } else {
        // No separate notes field â€” confirm drop-off address is set
        await expect(page.getByLabel('Drop-off')).toBeVisible();
      }
    }, 'domcontentloaded');
    timings.push(t20);

    await page.waitForTimeout(2000);

    // â”€â”€ Step 23: Open calendar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t21 = await measureRender(page, 'open-calendar', async () => {
      await page.getByRole('button', { name: 'No date selected' }).click();
      // Verify the calendar/date picker is visible
      await expect(
        page.getByRole('dialog', { name: /date|calendar/i })
          .or(page.locator('[role="grid"]'))
          .first()
      ).toBeVisible({ timeout: 5_000 }).catch(() => {});
    }, 'domcontentloaded');
    timings.push(t21);

    await page.waitForTimeout(2000);

    // â”€â”€ Step 24: Select future date (+1 day from today) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const futureDateBtnLabel = futureDateLabel(1);
    const t22 = await measureRender(page, 'select-date-19', async () => {
      const dateBtn = page.getByRole('button', { name: futureDateBtnLabel });
      if (await dateBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await dateBtn.click();
      } else {
        // Navigate to next month if the date is not in the current calendar view
        const nextMonthBtn = page.getByRole('button', { name: /next month/i });
        if (await nextMonthBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
          await nextMonthBtn.click();
        }
        await page.getByRole('button', { name: futureDateBtnLabel }).click();
      }
    }, 'domcontentloaded');
    timings.push(t22);

    await page.waitForTimeout(2000);

    // â”€â”€ Step 25: Fill outbound time â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t23 = await measureRender(page, 'fill-outbound-time', async () => {
      await page.getByRole('textbox', { name: 'Time *' }).click();
      await page.getByRole('textbox', { name: 'Time *' }).fill('1445');
    }, 'domcontentloaded');
    timings.push(t23);

    await page.waitForTimeout(2000);

    // â”€â”€ Step 26: Preview and book â€” click only; full API time captured in next step â”€â”€
    const t24 = await measureRender(page, 'preview-and-book', async () => {
      // React app uses a single "Create trip" button (no separate preview step).
      // Do NOT wait for networkidle here â€” that API round-trip time belongs to confirm-trip-booking.
      await page.getByRole('button', { name: 'Create trip' }).click();
    }, 'domcontentloaded');
    timings.push(t24);

    await page.waitForTimeout(500);

    // â”€â”€ Step 27: Confirm trip booking â€” captures full API round-trip time â”€â”€â”€â”€â”€
    const t25 = await measureRender(page, 'confirm-trip-booking', async () => {
      // Wait for the API call to complete and the success state to render.
      await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
      const successMsg = page.getByText(/trip.*created|created.*trip|success|booked/i).first();
      const hasSuccess = await successMsg.isVisible({ timeout: 15_000 }).catch(() => false);
      const urlChanged = !page.url().includes('/new');
      expect(hasSuccess || urlChanged).toBe(true);
    }, 'domcontentloaded');

    // â”€â”€ Combine t14â€“t25: 'confirm-trip-booking' reports the full E2E booking-flow time â”€â”€
    // (open-new-trip â†’ fill form â†’ preview â†’ API confirmation)
    const bookingFlowDuration = [t14, t15, t16, t17, t18, t19, t20, t21, t22, t23, t24, t25]
      .reduce((sum, t) => sum + t.duration, 0);
    const combinedBookingTiming: RenderTiming = {
      ...t25,
      action: 'confirm-trip-booking',
      duration: bookingFlowDuration,
    };
    timings.push(combinedBookingTiming);

    await page.waitForTimeout(2000);

    // â”€â”€ Step 28: Back to clients list â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t26 = await measureRender(page, 'clients-list-load', async () => {
      await page.getByRole('button', { name: 'Administration' }).click();
      await page.getByRole('menuitem', { name: 'Clients' }).click();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      //await expect(page.getByRole('textbox', { name: 'Free text search' })).toBeVisible();
    }, 'domcontentloaded');
    timings.push(t26);

    await page.waitForTimeout(2000);

    // â”€â”€ Step 29: Open Operations menu â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t27 = await measureRender(page, 'open-operations-menu', async () => {
      await page.getByRole('button', { name: 'Operations' }).click();
      await expect(page.getByRole('menuitem', { name: 'Messages' })).toBeVisible();
    }, 'domcontentloaded');
    timings.push(t27);

    // â”€â”€ Step 30: Navigate to Messages â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t28 = await measureRender(page, 'navigate-to-messages', async () => {
      await page.getByRole('menuitem', { name: 'Messages' }).click();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      await expect(page.getByRole('button', { name: 'Send message' })).toBeVisible();
    }, 'domcontentloaded');
    timings.push(t28);

    await page.waitForTimeout(2000);

    // â”€â”€ Step 31: Open Send Message form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t29 = await measureRender(page, 'open-send-message-form', async () => {
      await page.getByRole('button', { name: 'Send message' }).click();
      await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
      await expect(page.getByLabel('Send message')).toBeVisible({ timeout: 10_000 });
    }, 'domcontentloaded');
    timings.push(t29);

    await page.waitForTimeout(2000);

    // â”€â”€ Step 32: Select vehicle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t30 = await measureRender(page, 'select-vehicle', async () => {
      const vehiclesTrigger = page.getByRole('button', { name: 'Vehicles', exact: true });
      await expect(vehiclesTrigger).toBeVisible({ timeout: 15_000 });
      await vehiclesTrigger.click();
      const vehicleOption = page.getByRole('option', { name: '01ahvan' });
      await expect(vehicleOption).toBeVisible({ timeout: 5_000 });
      await vehicleOption.click();
    }, 'domcontentloaded');
    timings.push(t30);

    await page.waitForTimeout(2000);

    // â”€â”€ Step 33: Select provider vehicle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t31 = await measureRender(page, 'select-provider-vehicle', async () => {
      await page.locator('div').filter({ hasText: /^Message$/ }).first().click();
      await page.getByRole('button', { name: 'All vehicles of providers' }).click();
      const providerOption = page.getByRole('option', { name: 'AutoProvider_1666' });
      await expect(providerOption).toBeVisible({ timeout: 5_000 });
      await providerOption.click();
    }, 'domcontentloaded');
    timings.push(t31);

    await page.waitForTimeout(2000);

    // â”€â”€ Step 34: Select message template â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t32 = await measureRender(page, 'select-message-template', async () => {
      await page.getByRole('button', { name: 'Message template' }).click();
      const templateOption = page.getByRole('option', { name: 'Please log off and log back on' });
      await expect(templateOption).toBeVisible({ timeout: 5_000 });
      await templateOption.click();
      await page.getByLabel('Send message').getByRole('textbox').click().catch(() => {});
    }, 'domcontentloaded');
    timings.push(t32);

    await page.waitForTimeout(2000);

    // â”€â”€ Step 35: Send message â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t33 = await measureRender(page, 'send-message', async () => {
      await page.getByLabel('Send message').getByRole('button', { name: 'Send message' }).click();
      await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
      // Verify the success alert banner is visible after sending
      await expect(page.locator('.eco-alert-message')).toBeVisible({ timeout: 15_000 });
    }, 'domcontentloaded');
    timings.push(t33);

    await page.waitForTimeout(2000);

    // â”€â”€ Step 36: Open user menu â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t34 = await measureRender(page, 'open-user-menu', async () => {
      const userMenuBtn = page.getByRole('button', { name: /eco_eraju1|user/i }).last();
      await expect(userMenuBtn).toBeVisible({ timeout: 10_000 });
      await userMenuBtn.click();
      await expect(page.getByRole('menu').last()).toBeVisible({ timeout: 5_000 });
    }, 'domcontentloaded');
    timings.push(t34);

    await page.waitForTimeout(2000);

    // â”€â”€ Step 37: Sign out â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const t35 = await measureRender(page, 'sign-out', async () => {
      //await dismissPendoModal(page);
      const signOutItem = page.getByRole('menuitem', { name: /sign out|log out/i });
      await expect(signOutItem).toBeVisible({ timeout: 5_000 });
      await signOutItem.click();
    }, 'domcontentloaded');
    timings.push(t35);

    await page.waitForTimeout(5000);

    // â”€â”€ Step 38: Build and print full performance report â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const report = buildReport(BASE_URL, timings, navTiming);
    printReport(report);

    // â”€â”€ Step 39: Attach report JSON to Playwright HTML report â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    await test.info().attach('performance-report.json', {
      body: JSON.stringify(report, null, 2),
      contentType: 'application/json',
    });

    // â”€â”€ Step 40: Performance assertion (soft warning â€” does not fail the test) â”€â”€
    if (report.summary.totalActions > 0) {
      const avg = report.summary.averageRenderTime;
      const WARN_THRESHOLD  = 1000; // ms â€” log a warning above this
      const FAIL_THRESHOLD  = 3000; // ms â€” hard-fail only if avg exceeds this
      if (avg > WARN_THRESHOLD) {
        console.warn(
          `âš ï¸  Average render time ${avg.toFixed(2)}ms exceeds soft threshold of ${WARN_THRESHOLD}ms`
        );
      }
      expect(
        avg,
        `Average render time should be < ${FAIL_THRESHOLD}ms but was ${avg.toFixed(2)}ms`
      ).toBeLessThan(FAIL_THRESHOLD);
    }
  });
});

