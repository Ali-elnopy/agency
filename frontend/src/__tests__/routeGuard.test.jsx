import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../App';
import AuthProvider from '../auth/AuthProvider';

describe('dashboard route guard', () => {
  it('redirects an unauthenticated #dashboard visit to the login screen', async () => {
    window.location.hash = '#dashboard';
    window.localStorage.clear();

    render(
      <AuthProvider>
        <App />
      </AuthProvider>,
    );

    expect(
      await screen.findByRole('heading', { name: /sign in to your workspace/i }),
    ).toBeInTheDocument();
    await waitFor(() => expect(window.location.hash).toBe('#login'));
    expect(screen.queryByText(/studio activity/i)).not.toBeInTheDocument();
  });
});
