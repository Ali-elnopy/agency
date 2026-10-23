import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LoginPage from '../LoginPage';
import AuthProvider from '../../auth/AuthProvider';
import { loginApi } from '../../services/api';

vi.mock('../../services/api', () => ({
  loginApi: vi.fn(),
  logout: vi.fn(),
  getMockCredentials: vi.fn(() => []),
  isMockApiEnabled: vi.fn(() => false),
  isDevBypassEnabled: vi.fn(
    () => import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_LOGIN === 'true',
  ),
}));

function renderLogin(onNavigate = vi.fn()) {
  render(
    <AuthProvider>
      <LoginPage onNavigate={onNavigate} theme="light" onToggleTheme={vi.fn()} />
    </AuthProvider>,
  );

  return onNavigate;
}

async function submitCredentials(
  email = 'elena.vance@orvia-creative.com',
  password = 'password1234',
) {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText(/work email/i), email);
  await user.type(screen.getByLabelText(/^password$/i), password);
  await user.click(screen.getByRole('button', { name: /log in to orvia/i }));
}

describe('LoginPage', () => {
  beforeEach(() => {
    loginApi.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('starts with empty credentials and hides demo shortcuts when mock mode is off', () => {
    renderLogin();

    expect(screen.getByLabelText(/work email/i)).toHaveValue('');
    expect(screen.getByLabelText(/^password$/i)).toHaveValue('');
    expect(screen.queryByRole('button', { name: /studio lead/i })).not.toBeInTheDocument();
  });

  it('navigates to the dashboard after a successful sign-in', async () => {
    loginApi.mockResolvedValue({
      success: true,
      data: {
        user: { id: 'u1', fullName: 'Elena Vance', email: 'elena.vance@orvia-creative.com' },
      },
    });

    const onNavigate = renderLogin();
    await submitCredentials();

    expect(loginApi).toHaveBeenCalledWith({
      email: 'elena.vance@orvia-creative.com',
      password: 'password1234',
    });
    expect(await screen.findByRole('button', { name: /log in to orvia/i })).toBeEnabled();
    expect(onNavigate).toHaveBeenCalledWith('dashboard', { replace: true });
  });

  it('shows the backend rejection message for invalid credentials', async () => {
    loginApi.mockResolvedValue({ success: false, message: 'Invalid email or password' });

    const onNavigate = renderLogin();
    await submitCredentials('wrong@orvia-creative.com', 'nope');

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('surfaces an unreachable backend instead of faking a session', async () => {
    loginApi.mockResolvedValue({
      success: false,
      message: 'Cannot reach the authentication service. Check your connection and try again.',
    });

    const onNavigate = renderLogin();
    await submitCredentials();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /cannot reach the authentication service/i,
    );
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('does not enter the dashboard from empty fields when the dev bypass is off', async () => {
    vi.stubEnv('VITE_DEV_BYPASS_LOGIN', 'false');

    const onNavigate = renderLogin();
    const form = screen.getByRole('button', { name: /log in to orvia/i }).closest('form');

    expect(form).not.toHaveAttribute('novalidate');
    expect(screen.getByLabelText(/work email/i)).toBeRequired();

    await userEvent.setup().click(screen.getByRole('button', { name: /log in to orvia/i }));

    expect(onNavigate).not.toHaveBeenCalled();
    expect(loginApi).not.toHaveBeenCalled();
  });

  it('enters the dashboard from empty fields when the dev bypass is on', async () => {
    vi.stubEnv('VITE_DEV_BYPASS_LOGIN', 'true');

    const onNavigate = renderLogin();
    const form = screen.getByRole('button', { name: /log in to orvia/i }).closest('form');

    expect(form).toHaveAttribute('novalidate');
    expect(screen.getByLabelText(/work email/i)).not.toBeRequired();

    await userEvent.setup().click(screen.getByRole('button', { name: /log in to orvia/i }));

    await waitFor(() => expect(onNavigate).toHaveBeenCalledWith('dashboard', { replace: true }));
    expect(loginApi).not.toHaveBeenCalled();
    expect(window.localStorage.getItem('agency_access_token')).toBe('dev-bypass-token');
    expect(JSON.parse(window.localStorage.getItem('agency_user'))).toEqual(
      expect.objectContaining({ role: 'ADMIN' }),
    );
  });

  it('still rejects wrong credentials through the real login when the dev bypass is on', async () => {
    vi.stubEnv('VITE_DEV_BYPASS_LOGIN', 'true');
    loginApi.mockResolvedValue({ success: false, message: 'Invalid email or password' });

    const onNavigate = renderLogin();
    await submitCredentials('wrong@orvia-creative.com', 'nope');

    expect(loginApi).toHaveBeenCalledWith({
      email: 'wrong@orvia-creative.com',
      password: 'nope',
    });
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
    expect(onNavigate).not.toHaveBeenCalled();
  });
});
