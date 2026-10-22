import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';

export default function Topbar({
  theme,
  onToggleTheme,
  onSignOut,
  onNewBrief,
  onOpenHelp,
  actionLabel = 'New Brief',
  onAction,
  searchPlaceholder = 'Search briefs, campaigns, assets, clients...',
}) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const displayName = user?.fullName || 'Studio Lead';
  const roleDisplay = user?.role === 'ADMIN' ? 'Admin | Studio Lead' : 'Admin | Creative Dir.';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="topbar">
      <label className="search">
        <input
          type="search"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <svg aria-hidden="true" className="icon">
          <use href="#i-search" />
        </svg>
      </label>

      <div className="topbar__right">
        <button
          type="button"
          className="icon-btn"
          aria-label="Help"
          onClick={onOpenHelp}
          title="Help &amp; Documentation"
        >
          <svg aria-hidden="true" className="icon" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01" />
          </svg>
        </button>

        <button
          type="button"
          className="theme-toggle"
          aria-label="Toggle dark mode"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <svg className="icon-moon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
          </svg>
          <svg className="icon-sun" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        </button>

        <a
          href="#signout"
          className="user"
          title="Click to Sign out"
          onClick={(e) => {
            e.preventDefault();
            onSignOut();
          }}
        >
          <span className="user__text">
            <strong>{displayName}</strong>
            <small>{roleDisplay}</small>
          </span>
          <span className="avatar">{initials}</span>
        </a>

        {actionLabel ? (
          <button
            type="button"
            className="button button--primary button--sm"
            onClick={onAction || onNewBrief}
          >
            <svg aria-hidden="true" className="icon">
              <use href="#i-plus" />
            </svg>
            {actionLabel}
          </button>
        ) : null}
      </div>
    </header>
  );
}
