
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('RV2-LOGIN-UI-001: Login page loads successfully', async ({ page }) => {
  await expect(page).toHaveTitle('ORVIA');
  await expect(page.getByText('Welcome back', { exact: true })).toBeVisible();
});

test('RV2-LOGIN-UI-002: Email and password fields are visible', async ({ page }) => {
  await expect(page.locator('[data-f="email"]')).toBeVisible();
  await expect(page.locator('[data-f="password"]')).toBeVisible();
});

test('RV2-LOGIN-UI-003: Forgot password is visible', async ({ page }) => {
  const forgotPassword = page.locator('a.lk').filter({
    hasText: /^Forgot password\?$/
  });

  await expect(forgotPassword).toBeVisible();
});

test('RV2-LOGIN-UI-004: Forgot password switches to recovery screen', async ({ page }) => {
  const forgotPassword = page.locator('a.lk').filter({
    hasText: /^Forgot password\?$/
  });

  await expect(forgotPassword).toBeVisible();
  await forgotPassword.click();

  await expect(
    page.getByText('Reset your password', { exact: true })
  ).toBeVisible();
});

test('RV2-1071 / TC-RV2-22-03: Shows inline validation when email is empty', async ({ page }) => {
  await page.locator('[data-f="password"]').fill('NotARealPassword123!');
  await page.getByRole('button', { name: 'Sign in' }).click();

  const emailError = page.locator('[data-f="email"]').locator('xpath=..').locator('small');
  await expect(emailError).toHaveText('Enter your email.');
});

test('RV2-1071 / TC-RV2-22-03: Shows inline validation when password is empty', async ({ page }) => {
  await page.locator('[data-f="email"]').fill('test@example.com');
  await page.getByRole('button', { name: 'Sign in' }).click();

  const passwordError = page.locator('[data-f="password"]').locator('xpath=../..').locator('small');
  await expect(passwordError).toHaveText('Enter your password.');
});

test('RV2-1071 / TC-RV2-22-03: Shows inline validation for a malformed email', async ({ page }) => {
  await page.locator('[data-f="email"]').fill('not-an-email');
  await page.locator('[data-f="password"]').fill('NotARealPassword123!');
  await page.getByRole('button', { name: 'Sign in' }).click();

  const emailError = page.locator('[data-f="email"]').locator('xpath=..').locator('small');
  await expect(emailError).toBeVisible();
});

test('RV2-1072 / TC-RV2-22-04: A deactivated account is refused with a clear message', async ({ page }) => {
  const email = process.env.ORVIA_TEST_INACTIVE_EMAIL;
  const password = process.env.ORVIA_TEST_INACTIVE_PASSWORD;

  test.skip(
    !email || !password,
    'Set ORVIA_TEST_INACTIVE_EMAIL and ORVIA_TEST_INACTIVE_PASSWORD to run this test.'
  );

  const loginResponse = page.waitForResponse(response =>
    response.url().includes('/api/auth/login') &&
    response.request().method() === 'POST'
  );

  await page.locator('[data-f="email"]').fill(email);
  await page.locator('[data-f="password"]').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  const response = await loginResponse;
  expect(response.status()).toBe(403);

  const passwordError = page.locator('[data-f="password"]').locator('xpath=../..').locator('small');
  await expect(passwordError).toHaveText('This account is inactive');
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toHaveCount(0);
});

test('RV2-1070: Invalid credentials should show an error', async ({ page }) => {
  const loginResponse = page.waitForResponse(response =>
    response.url().includes('/api/auth/login') &&
    response.request().method() === 'POST'
  );

  await page.locator('[data-f="email"]').fill('wrong@example.com');
  await page.locator('[data-f="password"]').fill('WrongPassword123!');
  await page.getByRole('button', { name: 'Sign in' }).click();

  const response = await loginResponse;

  console.log('Login API status:', response.status());

  expect(response.status()).toBe(401);
await expect(
  page.getByRole('status').getByText('Invalid email or password', { exact: true })
).toBeVisible();
});

test('RV2-1069: Client can sign in and reach the client dashboard', async ({ page }) => {
  const email = process.env.ORVIA_TEST_CLIENT_EMAIL;
  const password = process.env.ORVIA_TEST_CLIENT_PASSWORD;

  test.skip(
    !email || !password,
    'Set ORVIA_TEST_CLIENT_EMAIL and ORVIA_TEST_CLIENT_PASSWORD to run this test.'
  );

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
  await expect(page.locator('.ph .eb')).toHaveText('Client');
  await expect(page.getByText('Lumen Skincare at a glance.', { exact: true })).toBeVisible();
});

test('RV2-1042 / TC-RV2-70-01: Account Manager signs in and sees the correct dashboard role', async ({ page }) => {
  const email = process.env.ORVIA_TEST_AM_EMAIL;
  const password = process.env.ORVIA_TEST_AM_PASSWORD;

  test.skip(
    !email || !password,
    'Set ORVIA_TEST_AM_EMAIL and ORVIA_TEST_AM_PASSWORD to run this test.'
  );

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
  await expect(page.locator('.ph .eb')).toHaveText('Account Manager');
});
