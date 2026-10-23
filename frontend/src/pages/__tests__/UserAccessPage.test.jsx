import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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
    window.localStorage.clear();
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

    const row = screen.getByText('Elena Vance').closest('article');
    await user.click(within(row).getByRole('button', { name: 'Edit User' }));

    const nameInput = screen.getByLabelText('Full Name');
    const jobInput = screen.getByLabelText('Job Title');

    expect(nameInput).toHaveValue('Elena Vance');
    expect(jobInput).toHaveValue('Studio Lead');

    await user.clear(nameInput);
    await user.type(nameInput, 'Elena V. Vance');
    await user.clear(jobInput);
    await user.type(jobInput, 'Managing Partner');
    await user.click(screen.getByRole('button', { name: 'Save User' }));

    expect(screen.getByText('Elena V. Vance')).toBeInTheDocument();
    expect(screen.getByText(/Managing Partner/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Full Name')).not.toBeInTheDocument();

    const stored = JSON.parse(
      window.localStorage.getItem('orvia_workspace_users_v1'),
    );
    const elena = stored.find((member) => member.id === 'user-1');

    expect(elena.fullName).toBe('Elena V. Vance');
    expect(elena.jobTitle).toBe('Managing Partner');
  });

  it('offers Delete instead of Reset Password and filters from global search', () => {
    renderPage({ initialQuery: { query: 'hana', nonce: 1 } });

    expect(screen.getByText('Hana Sato')).toBeInTheDocument();
    expect(screen.queryByText('Elena Vance')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /reset password/i })).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Delete' }).length).toBeGreaterThan(0);
  });
});
