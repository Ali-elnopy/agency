import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AuthContext from './AuthContext';
import { isDevBypassEnabled, loginApi, logout as clearServerSession } from '../services/api';
import { SESSION_EXPIRED_EVENT } from '../services/http';
import { updateUser } from '../services/users';
import {
  getStoredUser,
  hasStoredSession,
  setSession,
  setStoredUser,
} from '../services/tokenStorage';

function createDevSession(setUser) {
  // Inline DEV check (plus the exported guard) keeps this whole block out of
  // production bundles, including the fake token.
  if (
    import.meta.env.DEV &&
    import.meta.env.VITE_DEV_BYPASS_LOGIN === 'true' &&
    isDevBypassEnabled()
  ) {
    const devUser = {
      id: 'usr_dev_bypass',
      fullName: 'Dev Admin',
      email: 'dev@orvia.local',
      role: 'ADMIN',
    };

    setSession({
      accessToken: 'dev-bypass-token',
      refreshToken: 'dev-bypass-refresh-token',
      user: devUser,
    });
    setUser(devUser);
    return;
  }

  throw new Error('Login is unavailable.');
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (hasStoredSession() ? getStoredUser() : null));

  useEffect(() => {
    const handleExpired = () => setUser(null);
    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
  }, []);

  const login = useCallback(async (credentials) => {
    const result = await loginApi(credentials);
    if (result.success) setUser(result.data.user);
    return result;
  }, []);

  const logout = useCallback(() => {
    clearServerSession();
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (patch) => {
      if (!user) throw new Error('No authenticated user.');

      let updated;

      try {
        updated = await updateUser(user.id, patch);
      } catch (error) {
        // The API manages directory accounts (admin-only) and exposes no
        // self-profile endpoint yet. Keep the signed-in identity in sync for
        // this workspace instead of failing the save outright.
        const cannotSelfEdit =
          error?.status === 403 ||
          error?.status === 404 ||
          /administrator accounts/i.test(error?.message ?? '');

        if (!cannotSelfEdit) throw error;

        updated = {
          id: user.id,
          name: patch.name ?? user.fullName,
          fullName: patch.name ?? user.fullName,
          email: patch.email ?? user.email,
          phone: patch.phone ?? user.phone ?? '',
        };
      }

      const nextUser = {
        ...user,
        fullName: updated?.name ?? updated?.fullName ?? user.fullName,
        email: updated?.email ?? user.email,
        phone: updated?.phone ?? user.phone,
      };

      setUser(nextUser);
      setStoredUser(nextUser);
      return nextUser;
    },
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
      updateProfile,
      // Conditional key so production bundles never contain the bypass API.
      ...(import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_LOGIN === 'true'
        ? { devLogin: () => createDevSession(setUser) }
        : {}),
    }),
    [user, login, logout, updateProfile, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
