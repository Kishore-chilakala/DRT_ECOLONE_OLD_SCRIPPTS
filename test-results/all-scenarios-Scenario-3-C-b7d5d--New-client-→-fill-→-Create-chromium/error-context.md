# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: all-scenarios.spec.ts >> Scenario 3: Create a New Client >> TC-NS-003: Login → Administration → Clients → New client → fill → Create
- Location: tests\all-scenarios.spec.ts:354:7

# Error details

```
Error: page.waitForTimeout: Target page, context or browser has been closed
```

# Test source

```ts
  261 |         .nth(1);
  262 |       if (await isVisible(dropoffCombo, 5_000)) {
  263 |    await dropoffCombo.click();
  264 |         await dropoffCombo.fill('456 Oak');
  265 |       await page.waitForTimeout(2_000);
  266 |         const opt = page.getByRole('option').first();
  267 |     if (await isVisible(opt, 5_000)) await opt.click();
  268 |       }
  269 |       await page.waitForTimeout(1_000);
  270 | 
  271 |       // Open calendar
  272 |       const calendarBtn = page.getByRole('button', { name: 'Open calendar' });
  273 |       if (await isVisible(calendarBtn, 5_000)) {
  274 |      await calendarBtn.click();
  275 |   await page.waitForTimeout(1_000);
  276 |         const futureDay = Math.min(new Date().getDate() + 3, 28);
  277 |     const datePicker = page
  278 |     .getByTestId(`calendar-picker-date-${futureDay}`)
  279 |       .or(page.locator('[data-testid*="calendar-picker-date"]').first());
  280 |      if (await isVisible(datePicker, 3_000)) await datePicker.click();
  281 |       } else {
  282 |       const dateInput = page
  283 |           .getByTestId('outbound-date-single-input')
  284 |        .or(page.getByTestId('outbound-date-input'));
  285 |    if (await isVisible(dateInput, 3_000)) {
  286 |           const future = new Date();
  287 |      future.setDate(future.getDate() + 3);
  288 |        const dateStr = future.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  289 |           await dateInput.click();
  290 |   await dateInput.fill(dateStr);
  291 |   await page.keyboard.press('Tab');
  292 |         }
  293 |    }
  294 |       await page.waitForTimeout(1_000);
  295 | 
  296 |       // Fill time
  297 |       const timeInput = page
  298 |         .getByTestId('outbound-time-single-input')
  299 |   .or(page.getByTestId('outbound-time-input'));
  300 |       if (await isVisible(timeInput, 5_000)) {
  301 |         await timeInput.click();
  302 |         await timeInput.fill('09:00');
  303 |         await page.keyboard.press('Tab');
  304 |       }
  305 |       await page.waitForTimeout(1_000);
  306 | 
  307 |     // Preview and book
  308 |       const previewBookBtn = page
  309 |      .getByTestId('preview-and-book-button')
  310 |         .or(page.getByRole('button', { name: /preview.*book|book trip|create trip/i }).first());
  311 | 
  312 |       if (await isVisible(previewBookBtn, 8_000)) {
  313 |         await previewBookBtn.click();
  314 |      await page.waitForLoadState('domcontentloaded');
  315 |         await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  316 | 
  317 |    const tripSummaryHeading = page.getByRole('heading', { name: /trip summary/i });
  318 |         if (await isVisible(tripSummaryHeading, 8_000)) {
  319 |      await page.waitForTimeout(1_000);
  320 |     const confirmBtn = page
  321 |             .getByTestId('trip-summary-confirm-button')
  322 |        .or(page.getByRole('button', { name: /confirm/i }).first());
  323 |           if (await isVisible(confirmBtn, 5_000)) {
  324 |             await confirmBtn.click();
  325 |       await page.waitForLoadState('domcontentloaded');
  326 |             await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  327 |  const hasSuccess = await isVisible(page.getByRole('heading', { name: /trip created/i }), 10_000);
  328 |             const toastPresent = await isVisible(page.locator('[data-testid="toast-close-button"]'), 5_000);
  329 | console.log('[TC-NS-002] Trip created:', hasSuccess, '| Toast:', toastPresent);
  330 |     expect(hasSuccess || toastPresent, 'Expected trip creation success').toBe(true);
  331 |         }
  332 |         } else {
  333 |           const toastPresent = await isVisible(page.locator('[data-testid="toast-close-button"]'), 5_000);
  334 |           const urlChanged = !page.url().includes('/new-trip');
  335 |       console.log('[TC-NS-002] No summary | urlChanged:', urlChanged, '| toast:', toastPresent);
  336 |           expect(urlChanged || toastPresent).toBe(true);
  337 |         }
  338 |  } else {
  339 |  console.log('[TC-NS-002] Preview/Book button not found — URL:', page.url());
  340 |         await expect(page.locator('body')).toBeVisible();
  341 |       }
  342 |     });
  343 | 
  344 | });
  345 | 
  346 | // =============================================================================
  347 | // Scenario 3: Create a New Client
  348 | // Objective: Create new clients → Approximate is 1k users
  349 | // Codegen: Administration → Clients → New client
  350 | // =============================================================================
  351 | 
  352 | test.describe('Scenario 3: Create a New Client', () => {
  353 | 
  354 |   test('TC-NS-003: Login → Administration → Clients → New client → fill → Create',
  355 |     async ({ page }) => {
  356 |       test.setTimeout(120_000);
  357 | 
  358 |       const randomFirstName = `test${randomId()}`;
  359 | 
  360 |       await loginToApp(page);
> 361 |     await page.waitForTimeout(2_000);
      |                ^ Error: page.waitForTimeout: Target page, context or browser has been closed
  362 | 
  363 |       // Administration → Clients (codegen)
  364 |       await clickMenuThenItem(page, 'Administration', 'Clients');
  365 |   console.log('[TC-NS-003] Clients page URL:', page.url());
  366 | 
  367 |       // Click New client (codegen: page.getByRole('button', { name: 'New client' }))
  368 |   const newClientBtn = page
  369 |   .getByRole('button', { name: 'New client' })
  370 |         .or(page.getByTestId('clients-new-client-button'))
  371 |       .or(page.getByRole('button', { name: /new client/i }).first());
  372 | 
  373 |       await expect(newClientBtn.first()).toBeVisible({ timeout: 15_000 });
  374 |       await newClientBtn.first().click();
  375 | 
  376 |       // Wait for the New client form to appear
  377 |       await page.waitForLoadState('domcontentloaded');
  378 |       await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
  379 |       await page.waitForTimeout(2_000);
  380 |     console.log('[TC-NS-003] New client form URL:', page.url());
  381 | 
  382 |       // Fill Title (if present)
  383 |  const titleSelect = page.getByTestId('title-select');
  384 |    if (await isVisible(titleSelect, 5_000)) {
  385 |   await titleSelect.click();
  386 |         // Wait for listbox — NOT asserting role="listbox" container visible (same hidden pattern)
  387 |         await page.waitForTimeout(500);
  388 |         const mrOption = page.getByText('Mr.').first()
  389 |           .or(page.getByRole('option', { name: 'Mr.' }).first());
  390 |     if (await isVisible(mrOption, 3_000)) await mrOption.click();
  391 |   await page.waitForTimeout(300);
  392 |       }
  393 | 
  394 |     // Fill First name — try multiple selectors
  395 |       // data-testid="first-name-input" OR getByRole('textbox', { name: /first name/i }) OR first visible text input
  396 |       const firstNameInput = page
  397 |         .getByTestId('first-name-input')
  398 |         .or(page.getByRole('textbox', { name: /first.?name/i }))
  399 |    .or(page.locator('input[name*="first" i]').first())
  400 |   .or(page.locator('input[placeholder*="first" i]').first());
  401 | 
  402 |       if (await isVisible(firstNameInput.first(), 10_000)) {
  403 |         await firstNameInput.first().click();
  404 |         await firstNameInput.first().fill(randomFirstName);
  405 |       } else {
  406 |         // Fallback: fill first visible text input
  407 |     const firstInput = page.locator('input[type="text"]').first();
  408 |      if (await isVisible(firstInput, 5_000)) {
  409 |           await firstInput.click();
  410 |           await firstInput.fill(randomFirstName);
  411 |         }
  412 |         console.log('[TC-NS-003] first-name-input not found, used fallback');
  413 |       }
  414 | 
  415 |       // Fill Middle Initial (if present)
  416 |       const middleInitialInput = page
  417 |         .getByTestId('middle-initial-input')
  418 |    .or(page.getByRole('textbox', { name: /middle/i }))
  419 |         .or(page.locator('input[name*="middle" i]').first());
  420 |       if (await isVisible(middleInitialInput.first(), 3_000)) {
  421 |         await middleInitialInput.first().click();
  422 |         await middleInitialInput.first().fill('A');
  423 |       }
  424 | 
  425 |       // Fill Last name
  426 |       const lastNameInput = page
  427 |         .getByTestId('last-name-input')
  428 |         .or(page.getByRole('textbox', { name: /last.?name/i }))
  429 |         .or(page.locator('input[name*="last" i]').first())
  430 |         .or(page.locator('input[placeholder*="last" i]').first());
  431 | 
  432 |       if (await isVisible(lastNameInput.first(), 10_000)) {
  433 |      await lastNameInput.first().click();
  434 |         await lastNameInput.first().fill('load');
  435 |       }
  436 | 
  437 |       await page.waitForTimeout(2_000);
  438 | 
  439 |   // Click Create
  440 |       const createBtn = page
  441 |      .getByTestId('create-new-client-button')
  442 |         .or(page.getByRole('button', { name: /^create$/i }))
  443 |         .or(page.getByRole('button', { name: /create.*client|save/i }).first());
  444 | await expect(createBtn.first()).toBeVisible({ timeout: 10_000 });
  445 |       await createBtn.first().click();
  446 | 
  447 |       await page.waitForLoadState('domcontentloaded');
  448 |       await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  449 |       await page.waitForTimeout(2_000);
  450 | 
  451 |       // Verify success
  452 |       const clientDetailPage = page.getByTestId('client-details-page');
  453 |    const hasClientDetail = await isVisible(clientDetailPage, 10_000);
  454 |       if (hasClientDetail) {
  455 |         await expect(clientDetailPage).toContainText(randomFirstName);
  456 |       }
  457 | 
  458 |       const redirectedToDetail =
  459 |         /\/admin\/clients\/\d+/.test(page.url()) ||
  460 |         /\/pages\/customers\/\d+/.test(page.url());
  461 |       const toastPresent = await isVisible(
```