import { ApiError, apiRequest } from './http';
import { getAccessToken } from './tokenStorage';
import { isMockApiEnabled } from './api';

/**
 * Teams service.
 *
 *   GET    /teams                          -> [{ id, name, description, memberships, ... }]
 *   GET    /teams/:id                      -> team
 *   POST   /teams                          -> team
 *   PATCH  /teams/:id                      -> team
 *   POST   /teams/:id/members              -> team
 *   DELETE /teams/:id/members/:userId      -> team
 *   POST   /teams/:id/members/:userId/move -> team
 *
 * The cards also show brand ecosystem + capacity decorations that the API does
 * not expose yet (brands only have a create endpoint). Those stay as display
 * decoration keyed by team name so the screen keeps its current look.
 */

const MOCK_LATENCY = 350;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isDevSession() {
  return (
    import.meta.env.DEV &&
    import.meta.env.VITE_DEV_BYPASS_LOGIN === 'true' &&
    getAccessToken() === 'dev-bypass-token'
  );
}

function canUseMock(error) {
  if (isDevSession()) return true;

  return (
    isMockApiEnabled() && error instanceof ApiError && (error.status === 0 || error.status >= 500)
  );
}

/**
 * The single-file demo build has no server. Resolve straight from fixtures so
 * the bundle never fires failing requests (which would clutter the console).
 */
async function request(path, options) {
  if (isDevSession()) throw new ApiError('Local demo mode', 0);

  return apiRequest(path, options);
}

function unwrap(body) {
  return body?.data ?? body;
}

const TEAM_DECOR = {
  'Brand Strategy & Growth': {
    category: 'Strategy',
    tone: 'is-purple',
    clients: 5,
    capacity: 94,
    capacityLabel: '94% Capacity',
    capacityState: 'is-high',
    leadRole: 'Lead',
    ecosystem: ['Aurora Skincare', 'HyperPulse', 'Nordic Living'],
  },
  'Creative & Motion Studio': {
    category: 'Creative',
    tone: 'is-orange',
    clients: 7,
    capacity: 88,
    capacityLabel: '⚡ High Velocity',
    capacityState: 'is-high',
    leadRole: 'Art Director',
    ecosystem: ['Zenith Watches', 'Solaris Energy', 'Voice Apparel'],
  },
  'Performance Content Squad': {
    category: 'Performance',
    tone: 'is-green',
    clients: 4,
    capacity: 72,
    capacityLabel: '◎ ROAS Focus',
    capacityState: 'is-ok',
    leadRole: 'Squad Lead',
    ecosystem: ['Volt Beverage', 'Luna Sleep'],
  },
  'Editorial & Brand Voice': {
    category: 'Creative',
    tone: 'is-amber',
    clients: 5,
    capacity: 64,
    capacityLabel: '◎ Editorial Pace',
    capacityState: 'is-space',
    leadRole: 'Editorial Lead',
    ecosystem: ['Bloom Care Group', 'Kinetic Motors'],
  },
  'Social Operations & Community': {
    category: 'Performance',
    tone: 'is-green',
    clients: 6,
    capacity: 81,
    capacityLabel: '⚡ Always-On',
    capacityState: 'is-ok',
    leadRole: 'Community Lead',
    ecosystem: ['Vertex AI', 'Nova Robotics'],
  },
  'Digital Product Design': {
    category: 'Creative',
    tone: 'is-purple',
    clients: 2,
    capacity: 46,
    capacityLabel: '◎ Studio Ready',
    capacityState: 'is-ready',
    leadRole: 'Product Lead',
    ecosystem: ['Kinetic Motors', 'HyperPulse'],
  },
};

const FALLBACK_TONES = ['is-purple', 'is-orange', 'is-green', 'is-amber'];

function guessCategory(name = '') {
  if (/strategy|growth/i.test(name)) return 'Strategy';
  if (/performance|social/i.test(name)) return 'Performance';
  return 'Creative';
}

const MEMBER_TONES = ['is-a', 'is-b', 'is-c', 'is-d'];
const ROLE_TONES = ['is-orange', 'is-gray', 'is-green', 'is-purple'];

function monthsBetween(value) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function mapMember(membership, index) {
  const user = membership?.user ?? {};
  const roleName = user.role?.name ?? 'EMPLOYEE';
  const jobTitle = user.jobTitle?.name ?? '';

  return {
    id: user.id,
    name: user.fullName,
    email: user.email,
    role:
      roleName === 'ADMIN'
        ? 'Admin / Lead'
        : roleName === 'ACCOUNT_MANAGER'
          ? 'Account Manager'
          : jobTitle || 'Content Creator',
    roleTone: ROLE_TONES[index % ROLE_TONES.length],
    discipline: jobTitle || (roleName === 'ACCOUNT_MANAGER' ? 'Account Manager' : 'Production'),
    joined: monthsBetween(membership?.joinedAt),
    joinedAt: membership?.joinedAt ?? null,
    briefs: 0,
    briefTags: [],
    tone: MEMBER_TONES[index % MEMBER_TONES.length],
    verified: roleName === 'ADMIN' || roleName === 'ACCOUNT_MANAGER',
    isActive: user.isActive !== false,
  };
}

export function mapTeam(team, index = 0) {
  const memberships = Array.isArray(team?.memberships) ? team.memberships : [];
  const decor = TEAM_DECOR[team?.name] ?? {};
  const memberCount = team?._count?.memberships ?? memberships.length;
  const capacity = decor.capacity ?? Math.min(96, 36 + memberCount * 7);
  const members = memberships.map(mapMember);
  const lead = members[0]?.name ?? team?.creator?.fullName ?? 'Unassigned';

  return {
    id: team.id,
    name: team.name,
    description: team.description ?? '',
    blurb: team.description ?? '',
    isActive: team.isActive !== false,
    category: decor.category ?? guessCategory(team.name),
    tone: decor.tone ?? FALLBACK_TONES[index % FALLBACK_TONES.length],
    members: memberCount,
    memberList: members,
    clients: decor.clients ?? 0,
    lead,
    leadRole: decor.leadRole ?? 'Lead',
    ecosystem: decor.ecosystem ?? [],
    extra: Math.max(0, memberCount - 3),
    capacity,
    capacityLabel: decor.capacityLabel ?? `${capacity}% Capacity`,
    capacityState: decor.capacityState ?? (capacity >= 85 ? 'is-high' : 'is-ok'),
    createdAt: team.createdAt ?? null,
    creator: team.creator ?? null,
  };
}

/* -------------------------------------------------------------- fixtures */

const MOCK_TEAM_META = {
  'Brand Strategy & Growth': {
    members: 8,
    lead: 'Elena Vance',
    description:
      'Specialized squad leading multi-platform brand strategy, market positioning, and high-velocity launch campaigns.',
  },
  'Creative & Motion Studio': {
    members: 12,
    lead: 'Marcus Brody',
    description:
      'End-to-end art direction, visual identity systems, motion graphics and 3D renderings for enterprise launches.',
  },
  'Performance Content Squad': {
    members: 4,
    lead: 'Sarah Lin',
    description:
      'Performance-led content engine optimizing paid social, search and creator partnerships across every channel.',
  },
  'Editorial & Brand Voice': {
    members: 5,
    lead: 'Nadia Fahmy',
    description:
      'Long-form editorial, brand voice systems and thought-leadership programs for enterprise accounts.',
  },
  'Social Operations & Community': {
    members: 6,
    lead: 'Ava Stone',
    description:
      'Always-on community management, social operations and platform governance for high-volume brands.',
  },
  'Digital Product Design': {
    members: 3,
    lead: 'Liam Chen',
    description:
      'Product design, UX systems and interactive prototypes that turn launches into measurable experiences.',
  },
};

const MOCK_TEAMS = Object.entries(TEAM_DECOR).map(([name, decor], index) => {
  const meta = MOCK_TEAM_META[name] ?? {};

  return {
    id: index + 1,
    name,
    description: meta.description ?? '',
    blurb: meta.description ?? '',
    isActive: true,
    members: meta.members ?? 0,
    lead: meta.lead ?? 'Unassigned',
    memberList: [],
    ...decor,
  };
});

/* ------------------------------------------------------------- endpoints */

export async function getTeams() {
  try {
    const data = unwrap(await request('/teams'));

    return (Array.isArray(data) ? data : []).map((team, index) => mapTeam(team, index));
  } catch (error) {
    if (!canUseMock(error)) throw error;

    await sleep(MOCK_LATENCY);
    return MOCK_TEAMS.map((team) => ({ ...team, memberList: [...team.memberList] }));
  }
}

export async function getTeam(id) {
  try {
    const data = unwrap(await request(`/teams/${encodeURIComponent(id)}`));

    return mapTeam(data);
  } catch (error) {
    if (!canUseMock(error)) throw error;

    const fallback = MOCK_TEAMS.find((team) => String(team.id) === String(id));

    if (!fallback) throw error;

    return { ...fallback };
  }
}

export async function getTeamByName(name) {
  const teams = await getTeams();
  const match = teams.find((team) => team.name === name);

  if (!match) throw new ApiError('Team not found.', 404);

  return match;
}

export async function createTeam({ name, description, memberIds }) {
  const body = { name };

  if (description !== undefined) body.description = description;
  if (memberIds?.length) body.memberIds = memberIds;

  const data = unwrap(await request('/teams', { method: 'POST', body }));

  return mapTeam(data);
}

export async function updateTeam(id, patch) {
  const data = unwrap(
    await request(`/teams/${encodeURIComponent(id)}`, { method: 'PATCH', body: patch }),
  );

  return mapTeam(data);
}

export async function addTeamMember(id, userId) {
  const data = unwrap(
    await request(`/teams/${encodeURIComponent(id)}/members`, {
      method: 'POST',
      body: { userId: Number(userId) },
    }),
  );

  return mapTeam(data);
}

export async function removeTeamMember(id, userId) {
  const data = unwrap(
    await request(`/teams/${encodeURIComponent(id)}/members/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    }),
  );

  return mapTeam(data);
}

export async function moveTeamMember(id, userId, teamId) {
  const data = unwrap(
    await request(
      `/teams/${encodeURIComponent(id)}/members/${encodeURIComponent(userId)}/move`,
      { method: 'POST', body: { targetTeamId: Number(teamId) } },
    ),
  );

  return mapTeam(data);
}
