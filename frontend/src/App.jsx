import React, { useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage';
import ForgotPage from './pages/ForgotPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Showcase from './components/Showcase';
import DashboardPage from './pages/DashboardPage';
import IconSprite from './components/IconSprite';
import useAuth from './hooks/useAuth';
import { hasStoredSession } from './services/tokenStorage';

const TITLES = {
  login: 'ORVIA — Login',
  forgot: 'ORVIA — Forgot Password',
  reset: 'ORVIA — Reset Password',
  dashboard: 'ORVIA — Account Manager Dashboard',
};

const VIEWS = ['login', 'forgot', 'reset', 'dashboard'];

// Auth screens live in the hash (`#reset?token=…`) so the reset link email can
// carry the token without a server-side route.
function readHashRoute() {
  const raw = window.location.hash.replace(/^#/, '');
  const [rawView, query = ''] = raw.split('?');

  return {
    view: VIEWS.includes(rawView) ? rawView : 'login',
    params: new URLSearchParams(query),
  };
}

// Replacing (rather than pushing) keeps auth screens out of the Back stack.
function replaceHashView(nextView) {
  const nextHash = `#${nextView}`;
  if (window.location.hash === nextHash) return;

  try {
    window.history.replaceState(null, '', nextHash);
  } catch {
    // Some embedded/file:// contexts restrict History API access.
    window.location.replace(nextHash);
  }
}

export default function App() {
  const { user, logout } = useAuth();

  const [view, setView] = useState(() => {
    const route = readHashRoute();
    const authenticated = hasStoredSession();

    // A valid reset link wins over an existing session: the whole point is to
    // recover an account, possibly on a shared device.
    if (route.view === 'reset' && route.params.get('token')) return 'reset';

    // A signed-in user belongs on the dashboard. Auth screens stay reachable
    // only after an explicit sign-out.
    if (authenticated) return 'dashboard';
    return route.view === 'dashboard' ? 'login' : route.view;
  });

  // Token from the emailed `#reset?token=…` link.
  const [resetToken, setResetToken] = useState(
    () => readHashRoute().params.get('token') || '',
  );

  // Light is the product default. Only an explicit toggle is remembered, so a
  // device-level dark preference never forces the workspace into dark mode.
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('orvia_theme_preference');
      return saved === 'dark' || saved === 'light' ? saved : 'light';
    } catch {
      return 'light';
    }
  });

  const [isCollapsed, setIsCollapsed] = useState(false);
  // Carried from "Forgot password" into the reset screen so the copy can name
  // the account being updated.
  const [resetEmail, setResetEmail] = useState('');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('orvia_theme_preference', theme);
    } catch {
      // Theme persistence is optional.
    }
  }, [theme]);

  useEffect(() => {
    document.body.dataset.view = view;
    document.title = TITLES[view] || 'ORVIA — Agency OS';
    window.scrollTo(0, 0);
  }, [view]);

  // A dashboard URL without a session must never render the dashboard.
  useEffect(() => {
    if (view === 'dashboard' && !user) {
      replaceHashView('login');
      setView('login');
    }
  }, [view, user]);

  // An authenticated user should never remain on an auth screen, even for the
  // brief render between setUser() and the login redirect.
  useEffect(() => {
    if (user && view !== 'dashboard' && !resetToken) {
      replaceHashView('dashboard');
      setView('dashboard');
    }
  }, [view, user, resetToken]);

  // Storage is the source of truth here: reading it avoids a stale closure
  // racing the hash change that follows a successful sign-in. While a session
  // exists, any attempt to open an auth screen (including browser Back) is
  // replaced with the dashboard, so sign-in only appears after sign-out.
  useEffect(() => {
    const resolveView = () => {
      const route = readHashRoute();
      const next = route.view;
      const authenticated = hasStoredSession();

      setResetToken(route.params.get('token') || '');

      // Always honour an emailed reset link, even if a stale session exists.
      if (route.view === 'reset' && route.params.get('token')) {
        setView('reset');
        return;
      }

      if (authenticated) {
        if (next !== 'dashboard') replaceHashView('dashboard');
        setView('dashboard');
        return;
      }

      if (next === 'dashboard') {
        replaceHashView('login');
        setView('login');
        return;
      }

      setView(next);
    };

    resolveView();
    window.addEventListener('hashchange', resolveView);
    return () => window.removeEventListener('hashchange', resolveView);
  }, []);

  const navigateTo = (nextView, { replace = false } = {}) => {
    if (replace) {
      replaceHashView(nextView);
    } else {
      window.location.hash = `#${nextView}`;
    }
    setView(nextView);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const handleSignOut = () => {
    logout();
    // Replace the dashboard entry so Back cannot reopen the workspace after
    // the session has been cleared.
    navigateTo('login', { replace: true });
  };

  const showDashboard = view === 'dashboard' && Boolean(user);

  return (
    <>
      <IconSprite />

      {showDashboard ? (
        <DashboardPage
          theme={theme}
          onToggleTheme={toggleTheme}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleSidebar}
          onSignOut={handleSignOut}
          onNavigate={navigateTo}
        />
      ) : (
        <main className="page">
          {view === 'forgot' ? (
            <ForgotPage
              onNavigate={navigateTo}
              theme={theme}
              onToggleTheme={toggleTheme}
              onEmailSubmit={setResetEmail}
            />
          ) : view === 'reset' ? (
            <ResetPasswordPage
              onNavigate={navigateTo}
              theme={theme}
              onToggleTheme={toggleTheme}
              email={resetEmail}
              token={resetToken}
            />
          ) : (
            <LoginPage onNavigate={navigateTo} theme={theme} onToggleTheme={toggleTheme} />
          )}
          <Showcase />
        </main>
      )}
    </>
  );
}
