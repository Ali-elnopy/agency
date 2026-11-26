import { test, expect } from '@playwright/test';

test('RV2-1063 / TC-RV2-34-01: Logging out ends the session and returns to Login', async ({ page }) => {
  const email = process.env.ORVIA_TEST_CLIENT_EMAIL;
  const password = process.env.ORVIA_TEST_CLIENT_PASSWORD;

  test.skip(
    !email || !password,
    'Set ORVIA_TEST_CLIENT_EMAIL and ORVIA_TEST_CLIENT_PASSWORD to run this test.'
  );

  await page.goto('/');

  const loginResponse = page.waitForResponse(response =>
    response.url().includes('/api/auth/login') &&
    response.request().method() === 'POST'
  );

  await page.locator('[data-f="email"]').fill(email);
  await page.locator('[data-f="password"]').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  const response = await loginResponse;
  expect(response.status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();

  const logoutRequest = page.waitForRequest(request =>
    request.url().includes('/api/auth/logout') &&
    request.method() === 'POST'
  );

  await page.getByRole('button', { name: 'Log out' }).first().click();
  await logoutRequest;

  await expect(page.getByRole('heading', { name: 'Welcome back', exact: true })).toBeVisible();

  const storedAccessToken = await page.evaluate(() =>
    sessionStorage.getItem('orvia_access_token') || localStorage.getItem('orvia_access_token')
  );
  expect(storedAccessToken).toBeNull();
});
