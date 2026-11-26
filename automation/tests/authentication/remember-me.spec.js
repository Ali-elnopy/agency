import { test, expect } from '@playwright/test';

test(
  'RV2-1066 / TC-RV2-28-01: Keep me signed in persists after reopening the browser',
  async () => {
    test.skip(true, 'The Keep me signed in option was removed from the current site.');
  }
);

test('RV2-1068 / TC-RV2-28-03: Logging out invalidates the refresh session on the server', async ({ page, request }) => {
  const email = process.env.ORVIA_TEST_CLIENT_EMAIL;
  const password = process.env.ORVIA_TEST_CLIENT_PASSWORD;

  test.skip(
    !email || !password,
    'Set ORVIA_TEST_CLIENT_EMAIL and ORVIA_TEST_CLIENT_PASSWORD to run this test.'
  );

  await page.goto('/');

  const loginResponsePromise = page.waitForResponse(response =>
    response.url().includes('/api/auth/login') &&
    response.request().method() === 'POST'
  );

  await page.locator('[data-f="email"]').fill(email);
  await page.locator('[data-f="password"]').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  const loginResponse = await loginResponsePromise;
  expect(loginResponse.status()).toBe(200);

  const loginBody = await loginResponse.json();
  const refreshToken = loginBody?.data?.refreshToken;
  expect(refreshToken).toBeTruthy();
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();

  const logoutResponsePromise = page.waitForResponse(response =>
    response.url().includes('/api/auth/logout') &&
    response.request().method() === 'POST'
  );

  await page.getByRole('button', { name: 'Log out' }).first().click();
  const logoutResponse = await logoutResponsePromise;
  expect(logoutResponse.status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'Welcome back', exact: true })).toBeVisible();

  const refreshResponse = await request.post('/api/auth/refresh', {
    data: { refreshToken },
  });
  expect(refreshResponse.status()).toBe(401);
});
