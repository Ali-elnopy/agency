import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from '../App';
import AuthProvider from '../auth/AuthProvider';
import { setSession } from '../services/tokenStorage';

vi.mock('../pages/DashboardPage', () => ({
  default: ({ onSignOut }) => (
    <div>
      Dashboard screen
      <button type="button" onClick={onSignOut}>
        Sign out
      </button>
    </div>
  ),
}));

const admin = {
  id: 'usr_test_admin',
  fullName: 'System Admin',
  email: 'admin@agency.local',
  role: 'ADMIN',
};

function signInForTest() {
  window.localStorage.clear();
  setSession({
    accessToken: 'test-access-token',
    refreshToken: 'test-refresh-token',
    user: admin,
  });
}

function renderApp() {
  return render(
    <AuthProvider>
      <App />
    </AuthProvider>,
  );
}

describe('dashboard route guard', () => {
  it('redirects an unauthenticated #dashboard visit to the login screen', async () => {
    window.location.hash = '#dashboard';
    window.localStorage.clear();

    renderApp();

    expect(
      await screen.findByRole('heading', { name: /sign in to your workspace/i }),
    ).toBeInTheDocument();
    await waitFor(() => expect(window.location.hash).toBe('#login'));
    expect(screen.queryByText(/studio activity/i)).not.toBeInTheDocument();
  });

  it('keeps a signed-in user on the dashboard when the URL points at sign-in', async () => {
    signInForTest();
    window.location.hash = '#login';

    renderApp();

    expect(await screen.findByText('Dashboard screen')).toBeInTheDocument();
    await waitFor(() => expect(window.location.hash).toBe('#dashboard'));
    expect(
      screen.queryByRole('heading', { name: /sign in to your workspace/i }),
    ).not.toBeInTheDocument();
  });

  it('replaces a Back navigation to sign-in while the session is active', async () => {
    signInForTest();
    window.location.hash = '#dashboard';

    renderApp();
    expect(await screen.findByText('Dashboard screen')).toBeInTheDocument();

    // Simulate the browser Back button landing on the old #login entry.
    window.location.hash = '#login';

    await waitFor(() => expect(window.location.hash).toBe('#dashboard'));
    expect(screen.getByText('Dashboard screen')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /sign in to your workspace/i }),
    ).not.toBeInTheDocument();
  });

  it('shows sign-in again only after an explicit sign-out', async () => {
    signInForTest();
    window.location.hash = '#dashboard';

    renderApp();
    expect(await screen.findByText('Dashboard screen')).toBeInTheDocument();

    await userEvent.setup().click(screen.getByRole('button', { name: /sign out/i }));

    expect(
      await screen.findByRole('heading', { name: /sign in to your workspace/i }),
    ).toBeInTheDocument();
    await waitFor(() => expect(window.location.hash).toBe('#login'));

    // With no stored session, a dashboard URL still falls back to sign-in.
    window.location.hash = '#dashboard';
    await waitFor(() => expect(window.location.hash).toBe('#login'));
  });
});
