import { test, expect } from '@playwright/test';

const adminEmail = process.env.ORVIA_TEST_ADMIN_EMAIL;
const adminPassword = process.env.ORVIA_TEST_ADMIN_PASSWORD;

test.describe('Client Management - Sprint 1 batch', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(
      !adminEmail || !adminPassword,
      'Set ORVIA_TEST_ADMIN_EMAIL and ORVIA_TEST_ADMIN_PASSWORD to run Client Management tests.'
    );

    await page.goto('/');
    const loginResponse = page.waitForResponse(response =>
      response.url().includes('/api/auth/login') && response.request().method() === 'POST'
    );
    await page.locator('[data-f="email"]').fill(adminEmail);
    await page.locator('[data-f="password"]').fill(adminPassword);
    await page.getByRole('button', { name: 'Sign in' }).click();
    expect((await loginResponse).status(), 'Admin test account should sign in successfully').toBe(200);
    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Brands', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Brands', exact: true })).toBeVisible();
  });

  test('RV2-177 / TC-RV2-177-01: New client form includes required brand and primary contact details', async ({ page }) => {
    await page.getByRole('button', { name: /new brand/i }).click();
    const form = page.locator('.dlg');
    await expect(form.locator('[data-f="name"]')).toBeVisible();
    await expect(form.locator('[data-f="industry"]')).toBeVisible();
    // The story requires contact name and email; these checks reveal if the form omits either field.
    await expect(form.locator('[data-f="primaryContactName"]')).toBeVisible();
    await expect(form.locator('[data-f="primaryContactEmail"]')).toBeVisible();
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  });

  test('RV2-177 / TC-RV2-177-03: Duplicate brand names are rejected', async () => {
    test.skip(true, 'Submitting a duplicate can create a real client record; use a disposable test workspace to run this safely.');
  });

  test('RV2-177 / TC-RV2-177-04: Client setup lets Admin assign an Account Manager and team', async ({ page }) => {
    await page.getByRole('button', { name: /new brand/i }).click();
    const form = page.locator('.dlg');
    await expect(form.locator('[data-f="accountManagerId"]')).toBeVisible();
    await expect(form.locator('[data-f="teamId"]')).toBeVisible();
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  });

  test('RV2-171 / TC-RV2-171-01: Client list shows brand, industry, Account Manager, team and status', async ({ page }) => {
    const table = page.getByRole('table');
    await expect(table).toBeVisible();
    for (const heading of ['Brand', 'Industry', 'Account manager', 'Team', 'Status']) {
      await expect(table.getByRole('columnheader', { name: heading, exact: true })).toBeVisible();
    }
  });

  test('RV2-171 / TC-RV2-171-02: Clients can be searched and filtered by Account Manager and team', async ({ page }) => {
    const search = page.getByRole('textbox', { name: 'Search this page' });
    await search.fill('Performance Ops');
    await expect(page.getByRole('row').filter({ hasText: 'Performance Ops' }).first()).toBeVisible();
    await search.fill('Omar Haddad');
    await expect(page.getByRole('row').filter({ hasText: 'Omar Haddad' }).first()).toBeVisible();
    // Search exists today; the CSV also asks for dedicated filter controls.
    await expect(page.getByRole('combobox', { name: /filter by team/i })).toBeVisible();
  });

  test('RV2-201 / TC-RV2-201-01: Only active Account Managers are selectable', async ({ page }) => {
    await page.getByRole('button', { name: /new brand/i }).click();
    const choices = page.locator('.dlg datalist#dl-accountManagerId option');
    const offeredNames = (await choices.evaluateAll(options => options.map(option => option.value))).sort();
    const activeManagers = await page.evaluate(() => window.D.users.rows
      .filter(user => user.isActive && user.roleId === 'Account Manager')
      .map(user => user.fullName)
      .sort());
    expect(offeredNames).toEqual(activeManagers);
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  });

  test('RV2-195 / TC-RV2-195-01: Archiving hides a client from active lists and disables portal access', async () => {
    test.skip(true, 'Requires archiving and checking a dedicated disposable client account; it changes backend state.');
  });

  test('RV2-195 / TC-RV2-195-02: Hard delete is blocked when client work is linked', async () => {
    test.skip(true, 'Requires deleting a disposable client and linked content; run only in an isolated test workspace.');
  });

  test('RV2-189 / TC-RV2-189-01: Client edits validate fields and create an audit entry', async () => {
    test.skip(true, 'Needs a disposable client; current client edit UI has no visible audit history.');
  });

  test('RV2-189 / TC-RV2-189-02: Renaming a client updates all references', async () => {
    test.skip(true, 'Needs a disposable client with linked data and a safe way to restore its original name.');
  });

  test('RV2-207 / TC-RV2-207-03: Changing Account Manager notifies both people and records an audit entry', async () => {
    test.skip(true, 'Needs disposable active Account Managers and a test client; notification/audit changes are persistent.');
  });

  test('RV2-183 / TC-RV2-183-02: Unavailable client modules show a clear empty state', async () => {
    test.skip(true, 'Needs a dedicated client profile with known-empty modules to avoid depending on shared seeded data.');
  });
});
