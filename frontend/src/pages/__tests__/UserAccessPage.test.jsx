import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import UserAccessPage from '../UserAccessPage';
import { WorkspaceProvider } from '../../context/WorkspaceContext';

function renderPage(props = {}) {
  return render(
    <WorkspaceProvider>
      <UserAccessPage onAddMemberViaTeam={vi.fn()} {...props} />
    </WorkspaceProvider>,
  );
}

describe('UserAccessPage directory', () => {
  beforeEach(() => {
    // These assertions exercise the local demo workspace, which is seeded from
    // fixtures instead of the API.
    vi.stubEnv('VITE_DEV_BYPASS_LOGIN', 'true');
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders the KPI summary and the seeded workspace users', () => {
    const { container } = renderPage();

    expect(screen.getByRole('heading', { name: 'Users' })).toBeInTheDocument();
    expect(screen.getByText('Elena Vance')).toBeInTheDocument();
    expect(screen.getByText('Hana Sato')).toBeInTheDocument();

    const values = [...container.querySelectorAll('.ws-kpi__value')].map(
      (node) => node.textContent,
    );
    expect(values).toEqual(['15', '14', '1']);
  });

  it('expands a user inline, saves the changes, and persists them locally', async () => {
    const user = userEvent.setup();
    renderPage();

    // Elena is admin, so Job Title field should not be present
    const elenaRow = screen.getByText('Elena Vance').closest('article');
    await user.click(within(elenaRow).getByRole('button', { name: 'Edit User' }));
    expect(screen.getByLabelText('Full Name')).toHaveValue('Elena Vance');
    expect(screen.queryByLabelText('Job Title')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close' }));

    // Maya Lin is account_manager, so Job Title is present
    const mayaRow = screen.getByText('Maya Lin').closest('article');
    await user.click(within(mayaRow).getByRole('button', { name: 'Edit User' }));

    const nameInput = screen.getByLabelText('Full Name');
    expect(nameInput).toHaveValue('Maya Lin');
    expect(screen.getByLabelText('Job Title')).toBeInTheDocument();

    await user.clear(nameInput);
    await user.type(nameInput, 'Maya L. Lin');
    await user.click(screen.getByRole('button', { name: 'Save User' }));

    expect(screen.getByText('Maya L. Lin')).toBeInTheDocument();
    expect(screen.queryByLabelText('Full Name')).not.toBeInTheDocument();

    const stored = JSON.parse(
      window.localStorage.getItem('orvia_workspace_users_v1'),
    );
    const maya = stored.find((member) => member.id === 'user-2');

    expect(maya.fullName).toBe('Maya L. Lin');
  });

  it('offers Delete instead of Reset Password and filters from global search', () => {
    renderPage({ initialQuery: { query: 'hana', nonce: 1 } });

    expect(screen.getByText('Hana Sato')).toBeInTheDocument();
    expect(screen.queryByText('Elena Vance')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /reset password/i })).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Delete' }).length).toBeGreaterThan(0);
  });
});
