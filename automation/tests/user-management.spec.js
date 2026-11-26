import { test, expect } from '@playwright/test';

const adminEmail = process.env.ORVIA_TEST_ADMIN_EMAIL;
const adminPassword = process.env.ORVIA_TEST_ADMIN_PASSWORD;
const editableUserEmail = process.env.ORVIA_TEST_MUTABLE_USER_EMAIL;
const mutableUserPassword = process.env.ORVIA_TEST_MUTABLE_USER_PASSWORD;
const linkedUserEmail = process.env.ORVIA_TEST_LINKED_USER_EMAIL;
const deletableUserEmail = process.env.ORVIA_TEST_DELETABLE_USER_EMAIL;
const lastAdminEmail = process.env.ORVIA_TEST_LAST_ADMIN_EMAIL;
const allowDestructiveTests = process.env.ORVIA_TEST_ALLOW_DESTRUCTIVE_USER_TESTS === 'YES';
const allowLastAdminCheck = process.env.ORVIA_TEST_ALLOW_LAST_ADMIN_CHECK === 'YES';

async function callUsersApiAsSignedInAdmin(page, email, method, body) {
  return page.evaluate(async ({ email, method, body }) => {
    const target = window.D.users.rows.find(
      user => String(user.email).toLowerCase() === String(email).toLowerCase()
    );
    if (!target?._id) throw new Error(`Could not resolve a backend id for ${email}`);

    const base = (window.__ORVIA_API_BASE__ || '/api').replace(/\/+$/, '');
    const response = await fetch(`${base}/users/${encodeURIComponent(target._id)}`, {
      method,
      headers: {
        Authorization: `Bearer ${window.getApiToken()}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { status: response.status, body: await response.json().catch(() => null) };
  }, { email, method, body });
}

async function listUsersApiAsSignedInAdmin(page) {
  return page.evaluate(async () => {
    const base = (window.__ORVIA_API_BASE__ || '/api').replace(/\/+$/, '');
    const response = await fetch(`${base}/users`, {
      headers: { Authorization: `Bearer ${window.getApiToken()}` },
    });
    return { status: response.status, body: await response.json().catch(() => null) };
  });
}

test.describe('User Management - Sprint 1 batch', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(
      !adminEmail || !adminPassword,
      'Set ORVIA_TEST_ADMIN_EMAIL and ORVIA_TEST_ADMIN_PASSWORD to run User Management tests.'
    );

    await page.goto('/');

    const loginResponse = page.waitForResponse(response =>
      response.url().includes('/api/auth/login') &&
      response.request().method() === 'POST'
    );

    await page.locator('[data-f="email"]').fill(adminEmail);
    await page.locator('[data-f="password"]').fill(adminPassword);
    await page.getByRole('button', { name: 'Sign in' }).click();

    const response = await loginResponse;
    expect(response.status(), 'Admin test account should sign in successfully').toBe(200);
    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Users', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Users', exact: true })).toBeVisible();
  });

  test('RV2-1039 / TC-RV2-81-01: User list shows identity, role, team and status', async ({ page }) => {
    const table = page.getByRole('table');
    await expect(table).toBeVisible();

    for (const heading of ['Name', 'Email', 'System role', 'Job title', 'Team', 'Status']) {
      await expect(table.getByRole('columnheader', { name: heading, exact: true })).toBeVisible();
    }

    await expect(page.getByText('Active', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Inactive', { exact: true }).first()).toBeVisible();
    const userRows = table.getByRole('row').filter({ has: page.locator('td') });
    test.skip((await userRows.count()) <= 10, 'Seed more than 10 users to exercise list pagination.');
    await expect(page.getByRole('button', { name: /next page/i })).toBeVisible();
  });

  test('RV2-1040 / TC-RV2-81-02: User list search finds users by email and name', async ({ page }) => {
    const search = page.getByRole('textbox', { name: 'Search this page' });
    await search.fill('omar@agency-clean.co');
    await expect(page.getByRole('row').filter({ hasText: 'omar@agency-clean.co' })).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: 'Lina Aziz' })).toHaveCount(0);

    await search.fill('Lina Aziz');
    await expect(page.getByRole('row').filter({ hasText: 'Lina Aziz' })).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: 'omar@agency-clean.co' })).toHaveCount(0);
  });

  test('RV2-1041 / TC-RV2-81-03: Empty state appears when no user matches search', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Search this page' }).fill('no-such-user-qa-987654');
    await expect(page.getByText('No results match your search. Try a different keyword.', { exact: true })).toBeVisible();
  });

  test('RV2-1035 / TC-RV2-87-01: Required fields are validated when creating a user', async ({ page }) => {
    await page.getByRole('button', { name: /add user/i }).click();
    await expect(page.getByRole('heading', { name: 'Add user', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Add user', exact: true }).last().click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('This field is required.', { exact: true })).toHaveCount(4);
    await expect(dialog.getByText('Password is required.', { exact: true })).toBeVisible();
  });

  test('RV2-1036 / TC-RV2-87-02: Invitation option and its onboarding explanation are shown before creation', async ({ page }) => {
    await page.getByRole('button', { name: /add user/i }).click();
    const dialog = page.getByRole('dialog');
    const invitation = dialog.getByRole('checkbox');

    await expect(invitation).toBeChecked();
    await expect(dialog.getByText('Send onboarding invitation email immediately', { exact: true })).toBeVisible();
    await expect(dialog.getByText(/secure link, valid for 48 hours/i)).toBeVisible();
  });

  test('RV2-1028 / TC-RV2-99-01: Add User offers the current system roles', async ({ page }) => {
    await page.getByRole('button', { name: /add user/i }).click();
    const roleSelect = page.locator('.dlg [data-f="roleId"]');
    const roles = await roleSelect.locator('option').allTextContents();
    expect(roles).toEqual([
      'Select a role',
      'Account Manager',
      'Content Creator',
      'Creative',
      'Team Leader',
      'Client',
    ]);
  });

  test('RV2-1031 / TC-RV2-99-04: Selecting a role explains its permission impact', async ({ page }) => {
    await page.getByRole('button', { name: /add user/i }).click();
    const roleSelect = page.locator('.dlg [data-f="roleId"]');

    await roleSelect.selectOption({ label: 'Account Manager' });
    await expect(page.locator('.dlg #rd')).toContainText(
      'Own the client relationship, send strategies to the client and assign content work.'
    );
  });

  test('RV2-1016 / TC-RV2-123-01: Profile lets the user edit name, phone and photo while email and role stay read-only', async ({ page }) => {
    await page.getByRole('button', { name: 'Profile & Password', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Profile & password', exact: true })).toBeVisible();

    await expect(page.getByRole('textbox', { name: 'Full Name' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Phone Number' })).toBeVisible();
    await expect(page.getByRole('button', { name: /upload profile photo/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Email' })).toHaveAttribute('readonly', '');
    await expect(page.getByRole('textbox', { name: 'Role' })).toHaveAttribute('readonly', '');
  });

  test('RV2-1018 / TC-RV2-123-03: Profile changes are visible immediately after saving', async ({ browser }) => {
    test.skip(
      !editableUserEmail || !mutableUserPassword,
      'Set ORVIA_TEST_MUTABLE_USER_EMAIL and ORVIA_TEST_MUTABLE_USER_PASSWORD to a disposable profile test user.'
    );

    const profileContext = await browser.newContext();
    const profilePage = await profileContext.newPage();
    const signInResponse = profilePage.waitForResponse(response =>
      response.url().includes('/api/auth/login') && response.request().method() === 'POST'
    );
    await profilePage.goto('/');
    await profilePage.locator('[data-f="email"]').fill(editableUserEmail);
    await profilePage.locator('[data-f="password"]').fill(mutableUserPassword);
    await profilePage.getByRole('button', { name: 'Sign in' }).click();
    expect((await signInResponse).status()).toBe(200);
    await profilePage.getByRole('button', { name: 'Profile & Password', exact: true }).click();

    const nameField = profilePage.locator('#profile-name');
    const phoneField = profilePage.locator('#profile-phone');
    let originalName;
    let originalPhone;

    try {
      await expect(nameField).toBeVisible();
      await expect(phoneField).toBeVisible();
      originalName = await nameField.inputValue();
      originalPhone = await phoneField.inputValue();

      const updatedName = `${originalName} QA`;
      const updatedPhone = '+1 (555) 010-2026';
      const profileUpdate = profilePage.waitForResponse(response =>
        response.url().includes('/api/users/') && response.request().method() === 'PATCH'
      );
      await nameField.fill(updatedName);
      await phoneField.fill(updatedPhone);
      await profilePage.getByRole('button', { name: 'Save changes', exact: true }).click();
      expect((await profileUpdate).ok()).toBeTruthy();
      await expect(nameField).toHaveValue(updatedName);
      await expect(phoneField).toHaveValue(updatedPhone);
      await expect(profilePage.getByText('Profile changes saved successfully.', { exact: true })).toBeVisible();
    } finally {
      if (originalName !== undefined && originalPhone !== undefined && await nameField.count()) {
        const restoreResponse = profilePage.waitForResponse(response =>
          response.url().includes('/api/users/') && response.request().method() === 'PATCH'
        );
        await nameField.fill(originalName);
        await phoneField.fill(originalPhone);
        await profilePage.getByRole('button', { name: 'Save changes', exact: true }).click();
        await restoreResponse;
      }
      await profileContext.close();
    }
  });

  test('RV2-1032 / TC-RV2-93-01: Editing a test user updates its name and team in the list', async ({ page }) => {
    test.skip(
      !editableUserEmail,
      'Set ORVIA_TEST_MUTABLE_USER_EMAIL to a disposable test user. Do not use a real staff account.'
    );

    const rowFor = email => page.getByRole('row').filter({ hasText: email });
    const originalRow = rowFor(editableUserEmail);
    await expect(originalRow).toBeVisible();

    await originalRow.getByRole('button', { name: 'Edit', exact: true }).click();
    const originalName = await page.locator('.dlg [data-f="fullName"]').inputValue();
    const originalTeam = await page.locator('.dlg [data-f="teamId"]').inputValue();
    const changedName = `${originalName} QA`;
    const availableTeams = await page.locator('.dlg [data-f="teamId"] option').allTextContents();
    const changedTeam = availableTeams.find(team => team && team !== originalTeam && team !== '—');

    test.skip(!changedTeam, 'A second team is needed to verify team reassignment.');

    const saveEdit = async (name, team) => {
      const updateResponse = page.waitForResponse(response =>
        response.url().includes('/api/users/') && response.request().method() === 'PATCH'
      );
      await page.locator('.dlg [data-f="fullName"]').fill(name);
      await page.locator('.dlg [data-f="teamId"]').selectOption({ label: team });
      await page.getByRole('button', { name: 'Save changes', exact: true }).click();
      const response = await updateResponse;
      expect(response.ok(), 'User update API should succeed').toBeTruthy();
    };

    try {
      await saveEdit(changedName, changedTeam);
      const updatedRow = rowFor(editableUserEmail);
      await expect(updatedRow).toContainText(changedName);
      await expect(updatedRow).toContainText(changedTeam);
    } finally {
      const currentRow = rowFor(editableUserEmail);
      if (await currentRow.count()) {
        await currentRow.getByRole('button', { name: 'Edit', exact: true }).click();
        await saveEdit(originalName, originalTeam);
      }
    }
  });

  test('RV2-1024 / TC-RV2-105-01 + RV2-1022 / TC-RV2-111-01: Deactivated test user is refused, then can sign in after reactivation', async ({ page, browser }) => {
    test.skip(
      !editableUserEmail || !mutableUserPassword,
      'Set ORVIA_TEST_MUTABLE_USER_EMAIL and ORVIA_TEST_MUTABLE_USER_PASSWORD to a dedicated, disposable non-admin test user.'
    );

    const row = page.getByRole('row').filter({ hasText: editableUserEmail });
    await expect(row).toBeVisible();
    const roleBefore = (await row.getByRole('cell').nth(2).innerText()).trim();
    const deactivateButton = row.getByRole('button', { name: 'Deactivate', exact: true });
    test.skip(!(await deactivateButton.count()), 'The disposable user must be active at the start of the test.');

    const userContext = await browser.newContext();
    const userPage = await userContext.newPage();
    const signIn = async () => {
      await userPage.goto('/');
      const responsePromise = userPage.waitForResponse(response =>
        response.url().includes('/api/auth/login') && response.request().method() === 'POST'
      );
      await userPage.locator('[data-f="email"]').fill(editableUserEmail);
      await userPage.locator('[data-f="password"]').fill(mutableUserPassword);
      await userPage.getByRole('button', { name: 'Sign in' }).click();
      return responsePromise;
    };

    let deactivated = false;
    try {
      const initialLogin = await signIn();
      expect(initialLogin.status(), 'Test user should be active before the check').toBe(200);
      await expect(userPage.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();

      const deactivateResponsePromise = page.waitForResponse(response =>
        response.url().includes('/api/users/') &&
        response.url().endsWith('/deactivate') &&
        response.request().method() === 'PATCH'
      );
      await deactivateButton.click();
      const deactivateResponse = await deactivateResponsePromise;
      expect(deactivateResponse.ok(), 'Deactivation request should succeed').toBeTruthy();
      deactivated = true;
      await expect(row.getByText('Inactive', { exact: true })).toBeVisible();

      const deniedLogin = await signIn();
      expect(deniedLogin.status(), 'Inactive test user should not be allowed to sign in').toBe(403);
      await expect(userPage.getByRole('heading', { name: 'Dashboard', exact: true })).toHaveCount(0);

      const reactivateResponsePromise = page.waitForResponse(response =>
        response.url().includes('/api/users/') &&
        response.url().endsWith('/activate') &&
        response.request().method() === 'PATCH'
      );
      await row.getByRole('button', { name: 'Reactivate', exact: true }).click();
      const reactivateResponse = await reactivateResponsePromise;
      expect(reactivateResponse.ok(), 'Reactivation request should succeed').toBeTruthy();
      deactivated = false;
      await expect(row.getByText('Active', { exact: true })).toBeVisible();

      const reactivatedLogin = await signIn();
      expect(reactivatedLogin.status(), 'Reactivated test user should be able to sign in').toBe(200);
      await expect(userPage.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
      await expect(userPage.locator('.ph .eb')).toHaveText(roleBefore);
    } finally {
      if (deactivated) {
        const reactivateResponsePromise = page.waitForResponse(response =>
          response.url().includes('/api/users/') &&
          response.url().endsWith('/activate') &&
          response.request().method() === 'PATCH'
        );
        await row.getByRole('button', { name: 'Reactivate', exact: true }).click();
        await reactivateResponsePromise;
      }
      await userContext.close();
    }
  });

  test('RV2-1029 / TC-RV2-99-02: A test user receives the changed role after signing in again', async ({ page, browser }) => {
    test.skip(
      !editableUserEmail || !mutableUserPassword,
      'Set ORVIA_TEST_MUTABLE_USER_EMAIL and ORVIA_TEST_MUTABLE_USER_PASSWORD to a dedicated, disposable non-admin test user.'
    );

    const rowForTestUser = () => page.getByRole('row').filter({ hasText: editableUserEmail });
    let row = rowForTestUser();
    await expect(row).toBeVisible();
    const originalRole = (await row.getByRole('cell').nth(2).innerText()).trim();
    test.skip(originalRole === 'Admin', 'Use a disposable non-admin user; never change the only Admin account.');
    const originalJobTitle = (await row.getByRole('cell').nth(3).innerText()).trim();
    const changedRole = originalRole === 'Account Manager' ? 'Creative' : 'Account Manager';

    const saveRole = async role => {
      const updateResponsePromise = page.waitForResponse(response =>
        response.url().includes('/api/users/') && response.request().method() === 'PATCH'
      );
      await page.locator('.dlg [data-f="roleId"]').selectOption({ label: role });
      const titleSelect = page.locator('.dlg [data-f="jobTitleId"]');
      const titleOptions = await titleSelect.locator('option').allTextContents();
      if (role === originalRole && titleOptions.includes(originalJobTitle)) {
        await titleSelect.selectOption({ label: originalJobTitle });
      }
      await page.getByRole('button', { name: 'Save changes', exact: true }).click();
      const response = await updateResponsePromise;
      expect(response.ok(), 'Role update API should succeed').toBeTruthy();
    };

    let changed = false;
    const userContext = await browser.newContext();
    const userPage = await userContext.newPage();
    const verifyRoleAfterLogin = async expectedRole => {
      await userPage.goto('/');
      const loginResponsePromise = userPage.waitForResponse(response =>
        response.url().includes('/api/auth/login') && response.request().method() === 'POST'
      );
      await userPage.locator('[data-f="email"]').fill(editableUserEmail);
      await userPage.locator('[data-f="password"]').fill(mutableUserPassword);
      await userPage.getByRole('button', { name: 'Sign in' }).click();
      const response = await loginResponsePromise;
      expect(response.status()).toBe(200);
      await expect(userPage.locator('.ph .eb')).toHaveText(expectedRole);
    };

    try {
      await row.getByRole('button', { name: 'Edit', exact: true }).click();
      await saveRole(changedRole);
      changed = true;
      row = rowForTestUser();
      await expect(row.getByRole('cell').nth(2)).toHaveText(changedRole);
      await verifyRoleAfterLogin(changedRole);
    } finally {
      await userContext.close();
      if (changed) {
        row = rowForTestUser();
        await row.getByRole('button', { name: 'Edit', exact: true }).click();
        await saveRole(originalRole);
      }
    }
  });

  test('RV2-1033 / TC-RV2-93-02: Editing a user rejects an email already assigned to someone else', async ({ page }) => {
    const row = page.getByRole('row').filter({ hasText: 'Lina Aziz' });
    await row.getByRole('button', { name: 'Edit', exact: true }).click();

    await page.locator('.dlg [data-f="email"]').fill('omar@agency-clean.co');
    await page.getByRole('button', { name: 'Save changes', exact: true }).click();

    await expect(page.getByText('This email is already assigned to another user. Each email can only have one role.', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Edit user', exact: true })).toBeVisible();
  });

  test('RV2-1034 / TC-RV2-93-03: User edit details expose an audit/history entry', async ({ page }) => {
    const row = page.getByRole('row').filter({ hasText: 'Lina Aziz' });
    await row.getByRole('button', { name: 'View', exact: true }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText(/activity|audit|history/i).first()).toBeVisible();
  });

  test('RV2-1021 / TC-RV2-117-03: Delete action asks for confirmation before removing a user', async ({ page }) => {
    const row = page.getByRole('row').filter({ hasText: 'Lina Aziz' });
    await row.getByRole('button', { name: 'Delete', exact: true }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Delete this user?', exact: true })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Keep it', exact: true })).toBeVisible();
    const nameConfirmation = dialog.getByRole('textbox', { name: /type.*name/i });
    await expect(nameConfirmation).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Delete user', exact: true })).toBeDisabled();
    await nameConfirmation.fill('Lina Aziz');
    await expect(dialog.getByRole('button', { name: 'Delete user', exact: true })).toBeEnabled();
    await dialog.getByRole('button', { name: 'Keep it', exact: true }).click();
    await expect(row).toBeVisible();
  });

  test('RV2-1019 / TC-RV2-117-01: User with linked records cannot be deleted', async ({ page }) => {
    test.skip(
      !allowDestructiveTests || !linkedUserEmail,
      'Requires ORVIA_TEST_ALLOW_DESTRUCTIVE_USER_TESTS=YES and a disposable user with linked records in a test database.'
    );

    const row = page.getByRole('row').filter({ hasText: linkedUserEmail });
    await expect(row).toBeVisible();
    const result = await callUsersApiAsSignedInAdmin(page, linkedUserEmail, 'DELETE');

    expect(result.status).toBe(409);
    expect(result.body?.message).toMatch(/still referenced by other records/i);
    await expect(row).toBeVisible();
  });

  test('RV2-1020 / TC-RV2-117-02: Deleted disposable user disappears from the user list', async ({ page }) => {
    test.skip(
      !allowDestructiveTests || !deletableUserEmail,
      'Requires ORVIA_TEST_ALLOW_DESTRUCTIVE_USER_TESTS=YES and an unlinked disposable user that may be permanently deleted.'
    );

    const row = page.getByRole('row').filter({ hasText: deletableUserEmail });
    await expect(row).toBeVisible();
    const result = await callUsersApiAsSignedInAdmin(page, deletableUserEmail, 'DELETE');

    expect(result.status).toBe(200);
    const listResult = await listUsersApiAsSignedInAdmin(page);
    expect(listResult.status).toBe(200);
    const users = Array.isArray(listResult.body?.data) ? listResult.body.data : listResult.body?.data?.users;
    expect(users?.some(user => user.email.toLowerCase() === deletableUserEmail.toLowerCase())).toBe(false);
  });

  test('RV2-1030 / TC-RV2-99-03: The last active Admin cannot be demoted', async ({ page }) => {
    test.skip(
      !allowLastAdminCheck || !lastAdminEmail,
      'Requires ORVIA_TEST_ALLOW_LAST_ADMIN_CHECK=YES and a designated last-Admin fixture in a test database.'
    );

    const targetRow = page.getByRole('row').filter({ hasText: lastAdminEmail });
    await expect(targetRow).toBeVisible();
    const result = await callUsersApiAsSignedInAdmin(page, lastAdminEmail, 'PATCH', {
      roleName: 'EMPLOYEE',
    });

    expect(result.status).toBe(409);
    expect(result.body?.message).toMatch(/keep at least one active administrator/i);
    const listResult = await listUsersApiAsSignedInAdmin(page);
    expect(listResult.status).toBe(200);
    const users = Array.isArray(listResult.body?.data) ? listResult.body.data : listResult.body?.data?.users;
    const admin = users?.find(user => user.email.toLowerCase() === lastAdminEmail.toLowerCase());
    expect(admin?.role?.name).toBe('ADMIN');
  });
});
