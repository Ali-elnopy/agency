import React, { useState } from 'react';
import Logo from '../Logo';

// "ADMIN CORE" navigation from the ORVIA design.
// Roles & Permissions is not a top-level destination — it is reached from the Users page.
// Settings is not a nav item either: it lives behind the gear icon in the user card.
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '#i-dashboard' },
  { id: 'clients', label: 'Brands', icon: '#i-briefcase' },
  { id: 'teams', label: 'Teams', icon: '#i-layers' },
  { id: 'users', label: 'Users', icon: '#i-users' },
  { id: 'profile', label: 'Profile', icon: '#i-user' },
];

export default function Sidebar({
  isCollapsed,
  onToggleCollapse,
  onNavigate,
  activeTab: activeTabProp,
  onSelect,
  user,
  onSignOut,
}) {
  const [localTab, setLocalTab] = useState('dashboard');
  const activeTab = activeTabProp ?? localTab;

  const displayName = user?.fullName || 'Elena Vance';
  const roleLabel =
    user?.role === 'ADMIN'
      ? 'Admin'
      : user?.role === 'ACCOUNT_MANAGER'
        ? 'Account Manager'
        : 'Studio Lead';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const selectTab = (id) => {
    setLocalTab(id);
    if (onSelect) onSelect(id);
  };

  const handleSignOut = (event) => {
    event.preventDefault();
    if (onSignOut) onSignOut();
  };

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar__top">
          <a
            href="#dashboard"
            className="brand"
            onClick={(e) => {
              e.preventDefault();
              selectTab('dashboard');
              onNavigate('dashboard');
            }}
          >
            <Logo />
            <span className="brand__text sb-label">
              <strong>ORVIA</strong>
            </span>
          </a>
          <button
            type="button"
            className="sidebar__collapse"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg aria-hidden="true" className="icon">
              <use href="#i-panel" />
            </svg>
          </button>
        </div>

        <nav className="nav">
          {NAV_ITEMS.map((item) => (
            <React.Fragment key={item.id}>
              {item.id === 'profile' ? <span className="nav__divider" aria-hidden="true" /> : null}
              <a
                href={`#${item.id}`}
                className={`nav__item ${activeTab === item.id ? 'is-active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  selectTab(item.id);
                }}
                title={item.soon ? `${item.label} — coming soon` : item.label}
                aria-disabled={item.soon || undefined}
              >
                <svg aria-hidden="true" className="icon">
                  <use href={item.icon} />
                </svg>
                <span className="sb-label">{item.label}</span>
              </a>
            </React.Fragment>
          ))}
        </nav>

        <div className="sidebar__foot">
          <div className="sb-user">
            <span className="sb-user__avatar" aria-hidden="true">
              {initials}
            </span>
            <span className="sb-user__meta sb-label">
              <strong>{displayName}</strong>
              <span className="sb-user__role">{roleLabel}</span>
            </span>
            <span className="sb-user__actions">
              <button
                type="button"
                className="sb-user__icon"
                onClick={() => selectTab('settings')}
                aria-label="Settings"
                title="Settings"
              >
                <svg aria-hidden="true" className="icon">
                  <use href="#i-settings" />
                </svg>
              </button>
              <button
                type="button"
                className="sb-user__icon"
                onClick={handleSignOut}
                aria-label="Sign out"
                title="Sign out"
              >
                <svg aria-hidden="true" className="icon">
                  <use href="#i-logout" />
                </svg>
              </button>
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
