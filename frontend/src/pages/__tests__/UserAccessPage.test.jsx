import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import UserAccessPage from '../UserAccessPage';
import { getUsers } from '../../services/users';

vi.mock('../../services/users', () => ({
  getUsers: vi.fn(),
  updateUser: vi.fn(),
  deactivateUser: vi.fn(),
  changePassword: vi.fn(),
}));

const USERS = [
  {
    id: 'u-001',
    initials: 'SL',
    avatarTone: 'orange',
    name: 'Sarah Lin',
    email: 's.lin@orvia-creative.com',
    type: 'Internal',
    typeTone: 'orange',
    role: 'Creator & Copywriter',
    roleId: 'creator',
    roleHint: 'Edit & Draft',
    brands: ['Aura Mobility'],
    status: 'active',
  },
  {
    id: 'u-002',
    initials: 'NF',
    avatarTone: 'blue',
    name: 'Nadia Fahmy',
    email: 'n.fahmy@solace-skincare.com',
    type: 'External',
    typeTone: 'amber',
    role: 'Client Reviewer',
    roleId: 'client',
    roleHint: 'External Sign-Off',
    brands: ['Solace Skincare'],
    status: 'active',
  },
  {
    id: 'u-003',
    initials: 'KN',
    avatarTone: 'muted',
    name: 'Karim Nabil',
    email: 'k.nabil@orvia-creative.com',
    type: 'Former',
    typeTone: 'muted',
    role: 'Creator & Copywriter (Revoked)',
    roleId: 'creator',
    roleHint: 'Access reclaimed',
    brands: [],
    status: 'deactivated',
  },
];

const STATS = { total: 148, active: 130, suspended: 3 };

describe('UserAccessPage directory', () => {
  beforeEach(() => {
    getUsers.mockReset();
    getUsers.mockResolvedValue({ users: USERS, stats: STATS });
  });

  it('filters the directory by name or email', async () => {
    const user = userEvent.setup();
    render(<UserAccessPage />);

    await screen.findAllByText('Sarah Lin');
    const table = screen.getByRole('table');

    await user.type(screen.getByPlaceholderText(/filter by name or email/i), 'nadia');

    expect(within(table).getByText('Nadia Fahmy')).toBeInTheDocument();
    expect(within(table).queryByText('Sarah Lin')).not.toBeInTheDocument();
    expect(within(table).queryByText('Karim Nabil')).not.toBeInTheDocument();

    await user.clear(screen.getByPlaceholderText(/filter by name or email/i));
    await user.type(screen.getByPlaceholderText(/filter by name or email/i), 'k.nabil@');

    expect(within(table).getByText('Karim Nabil')).toBeInTheDocument();
    expect(within(table).queryByText('Nadia Fahmy')).not.toBeInTheDocument();
  });

  it('loads the selected row into the edit form', async () => {
    const user = userEvent.setup();
    render(<UserAccessPage />);

    await screen.findAllByText('Sarah Lin');

    const nadiaRow = screen.getByText('Nadia Fahmy').closest('tr');
    await user.click(within(nadiaRow).getByRole('button', { name: /edit user/i }));

    expect(screen.getByLabelText(/full name/i)).toHaveValue('Nadia Fahmy');
    expect(screen.getByLabelText(/work email/i)).toHaveValue('n.fahmy@solace-skincare.com');
  });
});
