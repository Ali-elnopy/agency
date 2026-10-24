/* ==========================================================================
   Local workspace seed data for Users and Teams.
   The backend does not expose the full member/team management surface yet,
   so this workspace is local-first (localStorage) until those endpoints land.
   ========================================================================== */

export const ACCESS_LEVELS = [
  { id: 'admin', label: 'Admin', short: 'ADMIN' },
  { id: 'team_leader', label: 'Team Leader', short: 'TEAM LEADER' },
  { id: 'account_manager', label: 'Account Manager', short: 'ACCOUNT MANAGER' },
  { id: 'employee', label: 'Employee', short: 'EMPLOYEE' },
];

export const ACCESS_LEVEL_BY_ID = ACCESS_LEVELS.reduce((levels, level) => {
  levels[level.id] = level;
  return levels;
}, {});

export const PERMISSION_OPTIONS = [
  {
    id: 'createContent',
    label: 'Create Content',
    description: 'Create Posts, Reels, Carousels and Stories.',
  },
  {
    id: 'managePlans',
    label: 'Manage Monthly Plans',
    shortLabel: 'Manage Plans',
    description: 'Create and manage monthly content plans.',
  },
  {
    id: 'reviewContent',
    label: 'Review Content',
    description: 'Review content and approve or request revisions.',
  },
  {
    id: 'publishContent',
    label: 'Publish Content',
    description: 'Handle the publishing stage.',
  },
];

export const PERMISSION_IDS = PERMISSION_OPTIONS.map((permission) => permission.id);

const ADMIN_PERMISSIONS = [...PERMISSION_IDS];
const LEADER_PERMISSIONS = ['createContent', 'managePlans', 'reviewContent'];
const MANAGER_PERMISSIONS = ['reviewContent', 'publishContent'];

export function permissionsForAccess(systemAccess, current = []) {
  if (systemAccess === 'admin') return [...ADMIN_PERMISSIONS];
  if (systemAccess === 'team_leader') return [...LEADER_PERMISSIONS];
  if (systemAccess === 'account_manager') return [...MANAGER_PERMISSIONS];
  return PERMISSION_IDS.filter((permission) => current.includes(permission));
}

export function initialsOf(name = '') {
  return String(name)
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

export function toneFor(name = '') {
  const tones = ['orange', 'purple', 'blue', 'green'];
  const seed = String(name)
    .split('')
    .reduce((total, char) => total + char.charCodeAt(0), 0);

  return tones[seed % tones.length];
}

export const SEED_TEAMS = [
  {
    id: 'team-1',
    name: 'Brand Strategy & Growth',
    description:
      'Brand positioning, market strategy and growth programs for the studio’s flagship accounts.',
    status: 'active',
    brandIds: ['brand-1', 'brand-4'],
    createdAt: '2025-01-14',
  },
  {
    id: 'team-2',
    name: 'Creative & Motion Studio',
    description:
      'Art direction, content production and motion design across every campaign channel.',
    status: 'active',
    brandIds: ['brand-3', 'brand-7'],
    createdAt: '2025-02-03',
  },
  {
    id: 'team-3',
    name: 'Performance Ops',
    description:
      'Paid social, performance creative and reporting for high-velocity acquisition accounts.',
    status: 'active',
    brandIds: ['brand-2', 'brand-5'],
    createdAt: '2025-03-22',
  },
  {
    id: 'team-4',
    name: 'Social & Community',
    description:
      'Always-on social operations, publishing and community management for retained brands.',
    status: 'active',
    brandIds: ['brand-1', 'brand-6'],
    createdAt: '2025-04-09',
  },
  {
    id: 'team-5',
    name: 'Editorial & Brand Voice',
    description:
      'Editorial systems, long-form content and brand voice guidelines for enterprise teams.',
    status: 'active',
    brandIds: ['brand-8'],
    createdAt: '2025-05-18',
  },
];

export const SEED_USERS = [
  {
    id: 'user-1',
    fullName: 'Elena Vance',
    email: 'elena.vance@orvia-creative.com',
    jobTitle: 'Studio Lead',
    systemAccess: 'admin',
    permissions: ADMIN_PERMISSIONS,
    active: true,
    teamId: 'team-1',
    createdAt: '2025-01-14',
  },
  {
    id: 'user-2',
    fullName: 'Maya Lin',
    email: 'maya.lin@orvia-creative.com',
    jobTitle: 'Brand Director',
    systemAccess: 'account_manager',
    permissions: MANAGER_PERMISSIONS,
    active: true,
    teamId: 'team-1',
    createdAt: '2025-01-20',
  },
  {
    id: 'user-3',
    fullName: 'Sofia Reyes',
    email: 'sofia.reyes@orvia-creative.com',
    jobTitle: 'Community Manager',
    systemAccess: 'employee',
    permissions: ['createContent'],
    active: true,
    teamId: 'team-1',
    createdAt: '2025-02-11',
  },
  {
    id: 'user-4',
    fullName: 'Sarah Lin',
    email: 'sarah.lin@orvia-creative.com',
    jobTitle: 'Content Creator',
    systemAccess: 'employee',
    permissions: ['createContent', 'reviewContent'],
    active: true,
    teamId: 'team-2',
    createdAt: '2025-02-18',
  },
  {
    id: 'user-5',
    fullName: 'Liam Chen',
    email: 'liam.chen@orvia-creative.com',
    jobTitle: 'Video Editor',
    systemAccess: 'employee',
    permissions: ['createContent'],
    active: true,
    teamId: 'team-2',
    createdAt: '2025-03-02',
  },
  {
    id: 'user-6',
    fullName: 'Nora Fields',
    email: 'nora.fields@orvia-creative.com',
    jobTitle: 'Art Director',
    systemAccess: 'employee',
    permissions: ['reviewContent', 'publishContent'],
    active: true,
    teamId: 'team-2',
    createdAt: '2025-03-19',
  },
  {
    id: 'user-7',
    fullName: 'Marcus Brody',
    email: 'marcus.brody@orvia-creative.com',
    jobTitle: 'Senior Account Manager',
    systemAccess: 'account_manager',
    permissions: MANAGER_PERMISSIONS,
    active: true,
    teamId: 'team-3',
    createdAt: '2025-01-28',
  },
  {
    id: 'user-8',
    fullName: 'David Kim',
    email: 'david.kim@orvia-creative.com',
    jobTitle: 'Performance Analyst',
    systemAccess: 'employee',
    permissions: ['managePlans'],
    active: true,
    teamId: 'team-3',
    createdAt: '2025-04-01',
  },
  {
    id: 'user-9',
    fullName: 'Layla Haddad',
    email: 'layla.haddad@orvia-creative.com',
    jobTitle: 'Producer',
    systemAccess: 'employee',
    permissions: ['createContent', 'managePlans'],
    active: true,
    teamId: 'team-3',
    createdAt: '2025-04-16',
  },
  {
    id: 'user-10',
    fullName: 'Nadia Fahmy',
    email: 'nadia.fahmy@orvia-creative.com',
    jobTitle: 'Social Media Manager',
    systemAccess: 'employee',
    permissions: ['createContent', 'managePlans'],
    active: true,
    teamId: 'team-4',
    createdAt: '2025-05-06',
  },
  {
    id: 'user-11',
    fullName: 'Amara Patel',
    email: 'amara.patel@orvia-creative.com',
    jobTitle: 'Copywriter',
    systemAccess: 'employee',
    permissions: ['createContent', 'reviewContent'],
    active: true,
    teamId: 'team-4',
    createdAt: '2025-05-21',
  },
  {
    id: 'user-12',
    fullName: 'Omar Hassan',
    email: 'omar.hassan@orvia-creative.com',
    jobTitle: 'Motion Designer',
    systemAccess: 'employee',
    permissions: ['createContent'],
    active: true,
    teamId: 'team-4',
    createdAt: '2025-06-02',
  },
  {
    id: 'user-13',
    fullName: 'Noah Bennett',
    email: 'noah.bennett@orvia-creative.com',
    jobTitle: 'Content Strategist',
    systemAccess: 'employee',
    permissions: ['createContent', 'managePlans'],
    active: true,
    teamId: 'team-5',
    createdAt: '2025-06-17',
  },
  {
    id: 'user-14',
    fullName: 'Tariq Nabil',
    email: 'tariq.nabil@orvia-creative.com',
    jobTitle: 'Editor',
    systemAccess: 'employee',
    permissions: ['reviewContent'],
    active: true,
    teamId: 'team-5',
    createdAt: '2025-07-04',
  },
  {
    id: 'user-15',
    fullName: 'Hana Sato',
    email: 'hana.sato@orvia-creative.com',
    jobTitle: 'Designer',
    systemAccess: 'employee',
    permissions: ['createContent'],
    active: false,
    teamId: null,
    createdAt: '2025-07-19',
  },
];

export function teamMembers(users, teamId) {
  return users.filter((user) => user.teamId === teamId);
}
