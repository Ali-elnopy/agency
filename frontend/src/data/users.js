/**
 * Workspace directory fixtures for the User & Role Access screen.
 * In production these records come from `GET /api/users`.
 */

export const DIRECTORY_USERS = [
  {
    id: 'u-001',
    initials: 'SL',
    avatarTone: 'orange',
    name: 'Sarah Lin',
    email: 's.lin@orvia-creative.com',
    type: 'Internal',
    typeTone: 'orange',
    role: 'Creator & Copywriter',
    roleHint: 'Edit & Draft • 3D & Motion Assets',
    brands: ['Aura Mobility', 'Kinetic Health'],
    status: 'active',
    editing: true,
  },
  {
    id: 'u-002',
    initials: 'MK',
    avatarTone: 'purple',
    name: 'Milo Kostas',
    email: 'm.kostas@orvia-creative.com',
    type: 'Internal',
    typeTone: 'purple',
    role: 'Art Director',
    roleHint: 'Review & Approve • Stage Gate Sign-Off',
    brands: ['Vanguard Audio', '+4 Brands'],
    status: 'active',
  },
  {
    id: 'u-003',
    initials: 'NF',
    avatarTone: 'blue',
    name: 'Nadia Fahmy',
    email: 'n.fahmy@solace-skincare.com',
    type: 'External',
    typeTone: 'amber',
    role: 'Client Reviewer',
    roleHint: 'External Sign-Off • Client Portal Only',
    brands: ['Solace Skincare'],
    status: 'active',
  },
  {
    id: 'u-004',
    initials: 'KN',
    avatarTone: 'muted',
    name: 'Karim Nabil',
    email: 'k.nabil@orvia-creative.com',
    type: 'Former',
    typeTone: 'muted',
    role: 'Creator & Copywriter (Revoked)',
    roleHint: 'Access reclaimed • Tokens invalidated',
    brands: [],
    status: 'deactivated',
  },
];

export const DIRECTORY_STATS = {
  total: 148,
  active: 130,
  suspended: 3,
};

export const DEACTIVATION_REASONS = [
  'Contract Ended / Offboard',
  'Policy Violation',
  'Role Redundancy',
  'Temporary Suspension',
];

export const REASSIGN_TARGETS = [
  'Devon Ray (Creator)',
  'Milo Kostas (Art Director)',
  'Aisha Karim (Producer)',
];
