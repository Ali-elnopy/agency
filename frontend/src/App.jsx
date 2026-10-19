import React, { useState, useEffect } from 'react';
import LoginView from './components/LoginView';
import ForgotView from './components/ForgotView';
import Showcase from './components/Showcase';
import DashboardView from './components/DashboardView';
import IconSprite from './components/IconSprite';
import { getCurrentUser, logout } from './services/api';

const TITLES = {
  login: 'ORVIA — Login',
  forgot: 'ORVIA — Forgot Password',
  dashboard: 'ORVIA — Account Manager Dashboard',
};

export default function App() {
  // Routing view state (login | forgot | dashboard)
  const [view, setView] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return ['login', 'forgot', 'dashboard'].includes(hash) ? hash : 'login';
  });

  // Dark / Light Theme state
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  // Sidebar collapsed state
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Authenticated user state
  const [user, setUser] = useState(() => getCurrentUser());

  // Synchronize theme with html data-theme and localStorage
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('theme', theme);
    } catch {}
  }, [theme]);

  // Synchronize view with title and body data-view
  useEffect(() => {
    document.body.dataset.view = view;
    document.title = TITLES[view] || 'ORVIA — Agency OS';
    window.scrollTo(0, 0);
  }, [view]);

  // Hash listener for deep linking & back/forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['login', 'forgot', 'dashboard'].includes(hash)) {
        setView(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (newView) => {
    window.location.hash = `#${newView}`;
    setView(newView);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const handleSignOut = () => {
    logout();
    setUser(null);
    navigateTo('login');
  };

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
  };

  return (
    <>
      <IconSprite />

      {view === 'dashboard' ? (
        <DashboardView
          user={user}
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
            <ForgotView
              onNavigate={navigateTo}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          ) : (
            <LoginView
              onNavigate={navigateTo}
              theme={theme}
              onToggleTheme={toggleTheme}
              onLoginSuccess={handleLoginSuccess}
            />
          )}
          <Showcase />
        </main>
      )}
    </>
  );
}
