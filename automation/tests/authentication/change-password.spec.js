import { test, expect } from '@playwright/test';

test('RV2-1052 / TC-RV2-52-01: A valid current password can be changed to a compliant new password', async ({ page }) => {
  const email = process.env.ORVIA_TEST_PASSWORD_EMAIL;
  const currentPassword = process.env.ORVIA_TEST_PASSWORD_CURRENT;
  const newPassword = process.env.ORVIA_TEST_PASSWORD_NEW;

  test.skip(
    !email || !currentPassword || !newPassword,
    'Set ORVIA_TEST_PASSWORD_EMAIL, ORVIA_TEST_PASSWORD_CURRENT, and ORVIA_TEST_PASSWORD_NEW to run this test.'
  );

  await page.goto('/');

  const loginResponsePromise = page.waitForResponse(response =>
    response.url().includes('/api/auth/login') &&
    response.request().method() === 'POST'
  );

  await page.locator('[data-f="email"]').fill(email);
  await page.locator('[data-f="password"]').fill(currentPassword);
  await page.getByRole('button', { name: 'Sign in' }).click();

  const loginResponse = await loginResponsePromise;
  expect(loginResponse.status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Profile & Password' }).click();
  await expect(page.getByRole('heading', { name: 'Profile & password', exact: true })).toBeVisible();

  const changePasswordResponsePromise = page.waitForResponse(response =>
    response.url().includes('/api/auth/change-password') &&
    response.request().method() === 'POST'
  );

  await page.locator('[data-f="currentPassword"]').fill(currentPassword);
  await page.locator('[data-f="newPassword"]').fill(newPassword);
  await page.getByRole('button', { name: 'Update password' }).click();

  const passwordUpdatedToast = page
    .getByRole('status')
    .getByText('Password updated', { exact: true });
  const [changePasswordResponse] = await Promise.all([
    changePasswordResponsePromise,
    passwordUpdatedToast.waitFor({ state: 'visible' }),
  ]);
  expect(changePasswordResponse.status()).toBe(200);
});

test('RV2-1053 / TC-RV2-52-02: A wrong current password is rejected', async ({ page }) => {
  const email = process.env.ORVIA_TEST_PASSWORD_EMAIL;
  const currentPassword = process.env.ORVIA_TEST_PASSWORD_CURRENT;
  const newPassword = process.env.ORVIA_TEST_PASSWORD_NEW;

  test.skip(
    !email || !currentPassword || !newPassword,
    'Set ORVIA_TEST_PASSWORD_EMAIL, ORVIA_TEST_PASSWORD_CURRENT, and ORVIA_TEST_PASSWORD_NEW to run this test.'
  );

  await page.goto('/');

  const loginResponsePromise = page.waitForResponse(response =>
    response.url().includes('/api/auth/login') &&
    response.request().method() === 'POST'
  );

  await page.locator('[data-f="email"]').fill(email);
  await page.locator('[data-f="password"]').fill(currentPassword);
  await page.getByRole('button', { name: 'Sign in' }).click();

  const loginResponse = await loginResponsePromise;
  expect(loginResponse.status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Profile & Password' }).click();
  await expect(page.getByRole('heading', { name: 'Profile & password', exact: true })).toBeVisible();

  const changePasswordResponsePromise = page.waitForResponse(response =>
    response.url().includes('/api/auth/change-password') &&
    response.request().method() === 'POST'
  );

  await page.locator('[data-f="currentPassword"]').fill('WrongCurrentPassword!2026');
  await page.locator('[data-f="newPassword"]').fill(newPassword);
  await page.getByRole('button', { name: 'Update password' }).click();

  const successToast = page.getByRole('status').getByText('Password updated', { exact: true });
  const [changePasswordResponse, successToastVisible] = await Promise.all([
    changePasswordResponsePromise,
    successToast.isVisible(),
  ]);

  expect(changePasswordResponse.status()).toBe(400);
  const responseBody = await changePasswordResponse.json();
  expect(responseBody.message).toBe('Current password is incorrect');
  expect(successToastVisible).toBe(false);
});
