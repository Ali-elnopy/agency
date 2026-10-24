import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { WorkspaceContext } from './workspaceStore';
import {
  SEED_TEAMS,
  SEED_USERS,
  initialsOf,
  permissionsForAccess,
  toneFor,
} from '../data/workspace';
import { apiRequest } from '../services/http';
import { getJobTitleOptions } from '../services/meta';
import { generateTemporaryPassword } from '../utils/credentials';

/* The workspace is backed by the Express API. The single-file demo build
   (dev bypass) keeps its fixtures so it can still run without a server. */

const ACCESS_BY_ROLE = {
  ADMIN: 'admin',
  ACCOUNT_MANAGER: 'account_manager',
  EMPLOYEE: 'employee',
};

const ROLE_BY_ACCESS = {
  admin: 'ADMIN',
  account_manager: 'ACCOUNT_MANAGER',
  employee: 'EMPLOYEE',
};

const STORAGE_KEYS = {
  users: 'orvia_workspace_users_v1',
  teams: 'orvia_workspace_teams_v1',
};

function isLocalDemo() {
  return import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_LOGIN === 'true';
}

function readStore(key, fallback) {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeStore(key, value) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The in-memory workspace still works when storage is unavailable.
  }
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function unwrap(body) {
  return body?.data ?? body;
}

export function mapApiUser(user) {
  if (!user) return null;

  const roleName = user.role?.name ?? 'EMPLOYEE';
  const systemAccess = ACCESS_BY_ROLE[roleName] ?? 'employee';
  const membership = Array.isArray(user.memberships) ? user.memberships[0] : null;

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone ?? '',
    jobTitle: user.jobTitle?.name ?? '',
    jobTitleId: user.jobTitle?.id ?? null,
    systemAccess,
    backendRole: roleName,
    permissions: permissionsForAccess(systemAccess),
    active: user.isActive !== false,
    teamId: membership?.teamId ?? null,
    teamName: membership?.team?.name ?? '',
    createdAt: user.createdAt ? String(user.createdAt).slice(0, 10) : '',
    lastLoginAt: user.lastLoginAt ?? null,
    initials: initialsOf(user.fullName),
    tone: toneFor(user.fullName),
  };
}

export function mapApiTeam(team) {
  if (!team) return null;

  const memberIds = Array.isArray(team.memberships)
    ? team.memberships
        .map((membership) => membership.user?.id ?? membership.userId ?? null)
        .filter((id) => id != null)
    : [];

  return {
    id: team.id,
    name: team.name,
    description: team.description ?? '',
    status: team.isActive === false ? 'inactive' : 'active',
    brandIds: [],
    memberIds,
    createdAt: team.createdAt ? String(team.createdAt).slice(0, 10) : '',
  };
}

function applyBrandLinks(teams, brandLinks) {
  return teams.map((team) => ({
    ...team,
    brandIds: brandLinks.filter((brand) => brand.teamId === team.id).map((brand) => brand.id),
  }));
}

export function WorkspaceProvider({ children }) {
  const demo = isLocalDemo();

  const [users, setUsers] = useState(() =>
    demo ? readStore(STORAGE_KEYS.users, SEED_USERS) : [],
  );
  const [teams, setTeams] = useState(() =>
    demo ? readStore(STORAGE_KEYS.teams, SEED_TEAMS) : [],
  );
  const [brandLinks, setBrandLinks] = useState([]);
  const [loading, setLoading] = useState(!demo);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!demo) return;
    writeStore(STORAGE_KEYS.users, users);
  }, [demo, users]);

  useEffect(() => {
    if (!demo) return;
    writeStore(STORAGE_KEYS.teams, teams);
  }, [demo, teams]);

  const refresh = useCallback(async () => {
    const [usersBody, teamsBody, brandsBody] = await Promise.all([
      apiRequest('/users'),
      apiRequest('/teams'),
      apiRequest('/brands'),
    ]);

    const userData = unwrap(usersBody);
    const teamData = unwrap(teamsBody);
    const brandData = unwrap(brandsBody);

    const nextUsers = (Array.isArray(userData?.users) ? userData.users : []).map(mapApiUser);

    const nextLinks = (Array.isArray(brandData?.brands) ? brandData.brands : []).map((brand) => ({
      id: brand.id,
      name: brand.name,
      industry: brand.industry ?? '',
      teamId: brand.teamId ?? null,
      accountManagerId: brand.accountManagerId ?? null,
    }));

    const nextTeams = applyBrandLinks(
      (Array.isArray(teamData) ? teamData : []).map(mapApiTeam),
      nextLinks,
    );

    setUsers(nextUsers);
    setTeams(nextTeams);
    setBrandLinks(nextLinks);
  }, []);

  useEffect(() => {
    if (demo) return;

    let alive = true;

    setLoading(true);
    setError(null);

    refresh()
      .catch((err) => {
        if (alive) setError(err?.message ?? 'Could not load the workspace.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [demo, refresh]);

  const addTeam = useCallback(
    async (input) => {
      const name = String(input.name ?? '').trim();
      const description = String(input.description ?? '').trim();

      if (demo) {
        const team = {
          id: makeId('team'),
          name,
          description,
          status: 'active',
          brandIds: [],
          createdAt: today(),
        };

        setTeams((prev) => [team, ...prev]);
        return team;
      }

      const team = mapApiTeam(
        unwrap(
          await apiRequest('/teams', {
            method: 'POST',
            body: { name, description: description || null },
          }),
        ),
      );

      setTeams((prev) => [{ ...team, brandIds: [] }, ...prev]);
      return team;
    },
    [demo],
  );

  const deleteTeam = useCallback(
    async (teamId) => {
      if (!demo) {
        await apiRequest(`/teams/${encodeURIComponent(teamId)}`, { method: 'DELETE' });
      }

      setTeams((prev) => prev.filter((team) => team.id !== teamId));
      setUsers((prev) =>
        prev.map((user) => (user.teamId === teamId ? { ...user, teamId: null } : user)),
      );
    },
    [demo],
  );

  const setTeamBrands = useCallback(
    async (teamId, brandIds) => {
      const nextIds = Array.from(new Set(brandIds ?? []));
      const numericTeamId = Number(teamId);

      if (demo) {
        setTeams((prev) =>
          prev.map((team) => (team.id === teamId ? { ...team, brandIds: nextIds } : team)),
        );
        return;
      }

      const assigned = brandLinks.filter(
        (brand) => brand.teamId === numericTeamId && !nextIds.includes(brand.id),
      );

      const added = nextIds.filter(
        (brandId) => brandLinks.find((brand) => brand.id === brandId)?.teamId !== numericTeamId,
      );

      await Promise.all([
        ...assigned.map((brand) =>
          apiRequest(`/brands/${brand.id}`, { method: 'PATCH', body: { teamId: null } }),
        ),
        ...added.map((brandId) =>
          apiRequest(`/brands/${brandId}`, {
            method: 'PATCH',
            body: { teamId: numericTeamId },
          }),
        ),
      ]);

      setBrandLinks((prev) =>
        prev.map((brand) => {
          if (nextIds.includes(brand.id)) return { ...brand, teamId: numericTeamId };
          if (brand.teamId === numericTeamId) return { ...brand, teamId: null };
          return brand;
        }),
      );

      setTeams((prev) =>
        prev.map((team) => (team.id === teamId ? { ...team, brandIds: nextIds } : team)),
      );
    },
    [brandLinks, demo],
  );

  const removeTeamMember = useCallback(
    async (teamId, userId) => {
      if (!demo) {
        await apiRequest(
          `/teams/${encodeURIComponent(teamId)}/members/${encodeURIComponent(userId)}`,
          { method: 'DELETE' },
        );
      }

      setTeams((prev) =>
        prev.map((team) =>
          String(team.id) === String(teamId)
            ? {
                ...team,
                memberIds: (team.memberIds ?? []).filter(
                  (id) => String(id) !== String(userId),
                ),
              }
            : team,
        ),
      );
      setUsers((prev) =>
        prev.map((user) =>
          String(user.id) === String(userId) && String(user.teamId) === String(teamId)
            ? { ...user, teamId: null }
            : user,
        ),
      );
    },
    [demo],
  );

  const addTeamMember = useCallback(
    async (teamId, userId) => {
      if (!demo) {
        await apiRequest(`/teams/${encodeURIComponent(teamId)}/members`, {
          method: 'POST',
          body: { userId: Number(userId) },
        });
      }

      setTeams((prev) =>
        prev.map((team) =>
          String(team.id) === String(teamId)
            ? {
                ...team,
                memberIds: Array.from(new Set([...(team.memberIds ?? []), userId])),
              }
            : team,
        ),
      );
      setUsers((prev) =>
        prev.map((user) =>
          String(user.id) === String(userId) && !user.teamId
            ? { ...user, teamId, teamName: '' }
            : user,
        ),
      );
    },
    [demo],
  );

  const createMember = useCallback(
    async (input) => {
      const fullName = String(input.fullName ?? '').trim();
      const systemAccess = input.systemAccess ?? 'employee';

      if (demo) {
        const member = {
          id: makeId('user'),
          fullName,
          email: String(input.email ?? '').trim().toLowerCase(),
          jobTitle: String(input.jobTitle ?? '').trim(),
          systemAccess,
          permissions: permissionsForAccess(systemAccess, input.permissions ?? []),
          active: true,
          teamId: input.teamId ?? null,
          createdAt: today(),
          initials: initialsOf(fullName),
          tone: toneFor(fullName),
        };

        setUsers((prev) => [member, ...prev]);

        // Demo members live in localStorage only: no server account exists, so
        // there is no password to hand out.
        return { ...member, isDemo: true };
      }

      const jobTitles = await getJobTitleOptions();
      const jobTitleName = String(input.jobTitle ?? '').trim();
      const jobTitle = jobTitles.find(
        (item) => item.name.toLowerCase() === jobTitleName.toLowerCase(),
      );

      if (!jobTitle) {
        const available = jobTitles.map((item) => item.name).join(', ');
        throw new Error(
          `Unknown job title "${jobTitleName}". Choose one of: ${available || 'none configured'}.`,
        );
      }

      // Every account gets its own temporary password. The value sent to the
      // API is exactly the one the dialog shows, so it is guaranteed to work.
      const password = String(input.password || '').trim() || generateTemporaryPassword();

      const created = mapApiUser(
        unwrap(
          await apiRequest('/users', {
            method: 'POST',
            body: {
              fullName,
              email: String(input.email ?? '').trim().toLowerCase(),
              password,
              roleName: ROLE_BY_ACCESS[systemAccess] ?? 'EMPLOYEE',
              jobTitleId: jobTitle.id,
            },
          }),
        ),
      );

      // The account already exists at this point. Linking it to a team is a
      // separate step, so a failure there must not hide the new credentials.
      let teamWarning = '';

      if (input.teamId) {
        try {
          await apiRequest(`/teams/${encodeURIComponent(input.teamId)}/members`, {
            method: 'POST',
            body: { userId: created.id },
          });
        } catch (error) {
          teamWarning =
            error?.message || 'The account was created but could not be added to this team.';
        }
      }

      await refresh().catch(() => {});

      return { ...created, tempPassword: password, isDemo: false, teamWarning };
    },
    [demo, refresh],
  );

  const updateUser = useCallback(
    async (userId, patch) => {
      if (demo) {
        setUsers((prev) =>
          prev.map((user) => {
            if (user.id !== userId) return user;

            const systemAccess = patch.systemAccess ?? user.systemAccess;
            const permissions = permissionsForAccess(
              systemAccess,
              patch.permissions ?? user.permissions,
            );

            return {
              ...user,
              ...patch,
              systemAccess,
              permissions,
              fullName: String(patch.fullName ?? user.fullName).trim(),
              jobTitle: String(patch.jobTitle ?? user.jobTitle).trim(),
            };
          }),
        );
        return;
      }

      const current = users.find((user) => user.id === userId) ?? null;
      const body = {};

      if (patch.fullName !== undefined) body.fullName = String(patch.fullName).trim();
      if (patch.email !== undefined) body.email = String(patch.email).trim().toLowerCase();
      if (patch.phone !== undefined) body.phone = String(patch.phone).trim() || null;

      if (patch.systemAccess && patch.systemAccess !== current?.systemAccess) {
        if (patch.systemAccess === 'admin') {
          throw new Error('Administrator access cannot be granted from the directory.');
        }

        body.roleName = ROLE_BY_ACCESS[patch.systemAccess];
      }

      if (patch.jobTitle && patch.jobTitle !== current?.jobTitle) {
        const jobTitles = await getJobTitleOptions();
        const match = jobTitles.find(
          (item) => item.name.toLowerCase() === String(patch.jobTitle).trim().toLowerCase(),
        );

        if (!match) {
          throw new Error(`Unknown job title "${patch.jobTitle}".`);
        }

        body.jobTitleId = match.id;
      }

      if (patch.active === false && current?.active !== false) {
        await apiRequest(`/users/${encodeURIComponent(userId)}/deactivate`, { method: 'POST' });
      } else if (patch.active === true && current?.active === false) {
        await apiRequest(`/users/${encodeURIComponent(userId)}/reactivate`, { method: 'POST' });
      }

      if (Object.keys(body).length) {
        await apiRequest(`/users/${encodeURIComponent(userId)}`, { method: 'PATCH', body });
      }

      await refresh();
    },
    [demo, refresh, users],
  );

  const deleteUser = useCallback(
    async (userId) => {
      if (!demo) {
        await apiRequest(`/users/${encodeURIComponent(userId)}`, { method: 'DELETE' });
      }

      setUsers((prev) => prev.filter((user) => user.id !== userId));
    },
    [demo],
  );

  const getTeamByName = useCallback(
    (name) => teams.find((team) => team.name === name) ?? null,
    [teams],
  );

  const value = useMemo(
    () => ({
      users,
      teams,
      loading,
      error,
      refresh,
      addTeam,
      deleteTeam,
      setTeamBrands,
      removeTeamMember,
      addTeamMember,
      createMember,
      updateUser,
      deleteUser,
      getTeamByName,
    }),
    [
      users,
      teams,
      loading,
      error,
      refresh,
      addTeam,
      deleteTeam,
      setTeamBrands,
      removeTeamMember,
      addTeamMember,
      createMember,
      updateUser,
      deleteUser,
      getTeamByName,
    ],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}
