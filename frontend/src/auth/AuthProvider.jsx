import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AuthContext from './AuthContext';
import {
  fetchCurrentUserApi,
  isDevBypassEnabled,
  loginApi,
  logout as clearServerSession,
  updateCurrentUserProfileApi,
} from '../services/api';
import {
  getStoredProfilePhoto,
  getStoredUser,
  hasStoredSession,
  setSession,
  setStoredProfilePhoto,
  setStoredUser,
} from '../services/tokenStorage';

function attachStoredPhoto(rawUser) {
  if (!rawUser) return null;
  const storedPhoto = getStoredProfilePhoto(rawUser.id);
  return storedPhoto !== undefined ? { ...rawUser, photo: storedPhoto } : rawUser;
}

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
  const [user, setUser] = useState(() =>
    hasStoredSession() ? attachStoredPhoto(getStoredUser()) : null,
  );

  // Re-hydrate the signed-in user from the API so role, job title and account
  // status changes made by an admin are picked up without a new login. A failed
  // call (mock session, offline demo) leaves the cached profile untouched.
  useEffect(() => {
    if (!hasStoredSession()) return undefined;

    let alive = true;

    fetchCurrentUserApi()
      .then((fresh) => {
        if (!alive || !fresh) return;
        setStoredUser(fresh);
        setUser(attachStoredPhoto(fresh));
      })
      .catch(() => {
        // Keep the cached session; http.js already distinguishes 401s.
      });

    return () => {
      alive = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const result = await loginApi(credentials);
    if (result.success) setUser(attachStoredPhoto(result.data.user));
    return result;
  }, []);

  const logout = useCallback(() => {
    clearServerSession();
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (patch) => {
      if (!user) throw new Error('No authenticated user.');

      const hasProfileFields =
        patch.name !== undefined || patch.fullName !== undefined || patch.phone !== undefined;

      let updated = null;

      if (hasProfileFields) {
        updated = await updateCurrentUserProfileApi({
          fullName: patch.name ?? patch.fullName,
          phone: patch.phone,
        });
      }

      if (patch.photo !== undefined) {
        setStoredProfilePhoto(user.id, patch.photo);
      }

      const persistedUser = {
        ...user,
        fullName: updated?.fullName ?? patch.name ?? patch.fullName ?? user.fullName,
        email: updated?.email ?? user.email,
        phone:
          updated?.phone !== undefined
            ? updated.phone ?? ''
            : patch.phone !== undefined
              ? patch.phone
              : user.phone ?? '',
      };

      // Keep the photo in its own storage slot so `agency_user` stays small.
      const { photo: _omitPhoto, ...storageUser } = persistedUser;
      setStoredUser(storageUser);

      const nextUser =
        patch.photo !== undefined
          ? { ...storageUser, photo: patch.photo }
          : attachStoredPhoto(storageUser);

      setUser(nextUser);
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
