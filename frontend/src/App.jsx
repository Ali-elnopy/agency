import React, { useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage';
import ForgotPage from './pages/ForgotPage';
import Showcase from './components/Showcase';
import DashboardPage from './pages/DashboardPage';
import IconSprite from './components/IconSprite';
import useAuth from './hooks/useAuth';
import { hasStoredSession } from './services/tokenStorage';

const TITLES = {
  login: 'ORVIA — Login',
  forgot: 'ORVIA — Forgot Password',
  dashboard: 'ORVIA — Account Manager Dashboard',
};

const VIEWS = ['login', 'forgot', 'dashboard'];

function readHashView() {
  const hash = window.location.hash.replace('#', '');
  return VIEWS.includes(hash) ? hash : 'login';
}

export default function App() {
  const { user, logout } = useAuth();

  const [view, setView] = useState(() => {
    const initial = readHashView();
    return initial === 'dashboard' && !hasStoredSession() ? 'login' : initial;
  });

  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('theme', theme);
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
      setView('login');
      window.location.hash = '#login';
    }
  }, [view, user]);

  // Storage is the source of truth here: reading it avoids a stale closure
  // racing the hash change that follows a successful sign-in.
  useEffect(() => {
    const redirectGuardedView = () => {
      setView('login');
      window.location.hash = '#login';
    };

    if (readHashView() === 'dashboard' && !hasStoredSession()) {
      redirectGuardedView();
    }

    const handleHashChange = () => {
      const next = readHashView();

      if (next === 'dashboard' && !hasStoredSession()) {
        redirectGuardedView();
        return;
      }

      setView(next);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (nextView) => {
    window.location.hash = `#${nextView}`;
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
    navigateTo('login');
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
            <ForgotPage onNavigate={navigateTo} theme={theme} onToggleTheme={toggleTheme} />
          ) : (
            <LoginPage onNavigate={navigateTo} theme={theme} onToggleTheme={toggleTheme} />
          )}
          <Showcase />
        </main>
      )}
    </>
  );
}
