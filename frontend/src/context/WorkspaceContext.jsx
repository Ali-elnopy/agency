import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { WorkspaceContext } from './workspaceStore';
import {
  SEED_TEAMS,
  SEED_USERS,
  initialsOf,
  permissionsForAccess,
  toneFor,
} from '../data/workspace';

const STORAGE_KEYS = {
  users: 'orvia_workspace_users_v1',
  teams: 'orvia_workspace_teams_v1',
};

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

export function WorkspaceProvider({ children }) {
  const [users, setUsers] = useState(() => readStore(STORAGE_KEYS.users, SEED_USERS));
  const [teams, setTeams] = useState(() => readStore(STORAGE_KEYS.teams, SEED_TEAMS));

  useEffect(() => {
    writeStore(STORAGE_KEYS.users, users);
  }, [users]);

  useEffect(() => {
    writeStore(STORAGE_KEYS.teams, teams);
  }, [teams]);

  const addTeam = useCallback((input) => {
    const name = String(input.name ?? '').trim();
    const team = {
      id: makeId('team'),
      name,
      description: String(input.description ?? '').trim(),
      status: 'active',
      brandIds: [],
      createdAt: today(),
    };

    setTeams((prev) => [team, ...prev]);
    return team;
  }, []);

  const deleteTeam = useCallback((teamId) => {
    setTeams((prev) => prev.filter((team) => team.id !== teamId));
    setUsers((prev) =>
      prev.map((user) => (user.teamId === teamId ? { ...user, teamId: null } : user)),
    );
  }, []);

  const setTeamBrands = useCallback((teamId, brandIds) => {
    const nextBrandIds = Array.from(new Set(brandIds ?? []));

    setTeams((prev) =>
      prev.map((team) => (team.id === teamId ? { ...team, brandIds: nextBrandIds } : team)),
    );
  }, []);

  const removeTeamMember = useCallback((teamId, userId) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId && user.teamId === teamId ? { ...user, teamId: null } : user,
      ),
    );
  }, []);

  const createMember = useCallback((input) => {
    const fullName = String(input.fullName ?? '').trim();
    const systemAccess = input.systemAccess ?? 'employee';
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
    return member;
  }, []);

  const updateUser = useCallback((userId, patch) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id !== userId) return user;

        const systemAccess = patch.systemAccess ?? user.systemAccess;
        const permissions =
          patch.systemAccess && patch.systemAccess !== user.systemAccess
            ? permissionsForAccess(systemAccess, patch.permissions ?? user.permissions)
            : (patch.permissions ?? user.permissions);

        return {
          ...user,
          ...patch,
          systemAccess,
          permissions: permissionsForAccess(systemAccess, permissions),
          fullName: String(patch.fullName ?? user.fullName).trim(),
          jobTitle: String(patch.jobTitle ?? user.jobTitle).trim(),
        };
      }),
    );
  }, []);

  const deleteUser = useCallback((userId) => {
    setUsers((prev) => prev.filter((user) => user.id !== userId));
  }, []);

  const getTeamByName = useCallback(
    (name) => teams.find((team) => team.name === name) ?? null,
    [teams],
  );

  const value = useMemo(
    () => ({
      users,
      teams,
      addTeam,
      deleteTeam,
      setTeamBrands,
      removeTeamMember,
      createMember,
      updateUser,
      deleteUser,
      getTeamByName,
    }),
    [
      users,
      teams,
      addTeam,
      deleteTeam,
      setTeamBrands,
      removeTeamMember,
      createMember,
      updateUser,
      deleteUser,
      getTeamByName,
    ],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}
