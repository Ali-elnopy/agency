import React, { useState } from 'react';
import Logo from '../Logo';
import { useSprint3 } from '../../context/sprint3Store';
import { roleLabel as previewRoleLabel } from '../sprint3/Sprint3UI';

// "ADMIN CORE" navigation from the ORVIA design.
// Roles & Permissions is not a top-level destination — it is reached from the Users page.
// Settings is not a nav item either: it lives behind the gear icon in the user card.
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '#i-dashboard', roles: ['admin', 'account_manager'] },
  {
    id: 'clients',
    label: 'Brands',
    icon: '#i-briefcase',
    roles: ['admin', 'account_manager', 'employee'],
  },
  {
    id: 'briefs',
    label: 'AI Briefs',
    icon: '#i-zap',
    group: 'Strategy & Content',
    roles: ['admin', 'account_manager', 'employee'],
  },
  {
    id: 'strategy',
    label: 'Strategy',
    icon: '#i-chart',
    group: 'Strategy & Content',
    roles: ['admin', 'account_manager', 'employee'],
  },
  {
    id: 'content',
    label: 'Content Items',
    icon: '#i-calendar',
    group: 'Strategy & Content',
    roles: ['admin', 'account_manager', 'employee'],
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: '#i-layers',
    group: 'Execution & Review',
    roles: ['account_manager', 'employee'],
  },
  {
    id: 'teams',
    label: 'Teams',
    icon: '#i-layers',
    roles: ['admin', 'account_manager'],
  },
  { id: 'users', label: 'Users', icon: '#i-users', roles: ['admin'] },
  {
    id: 'templates',
    label: 'Templates',
    icon: '#i-file',
    roles: ['admin', 'account_manager'],
  },
  { id: 'profile', label: 'Profile', icon: '#i-user', roles: ['admin', 'account_manager', 'employee'] },
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
  const { role, t } = useSprint3();
  const [localTab, setLocalTab] = useState('dashboard');
  const activeTab = activeTabProp ?? localTab;

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(role),
  );

  const displayName = user?.fullName || 'User';
  const accountRole =
    user?.role === 'ADMIN'
      ? 'Admin'
      : user?.role === 'ACCOUNT_MANAGER'
        ? 'Account Manager'
        : user?.role === 'CONTENT_CREATOR' || user?.role === 'EMPLOYEE' || user?.role === 'CREATOR' || user?.role === 'CREATIVE'
          ? 'Employee'
          : user?.role === 'CLIENT'
            ? 'Client'
            : 'Employee';
  const roleLabel = t(accountRole);
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
              const defaultTab = role === 'employee' ? 'content' : role === 'client' ? 'clients' : 'dashboard';
              selectTab(defaultTab);
              onNavigate(defaultTab);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: '#111111',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  border: '3px solid #ffffff',
                }}
              />
            </div>
            <span className="brand__text">
              <strong style={{ fontSize: 20, color: '#111111', fontWeight: 800, letterSpacing: '-0.02em' }}>Orvia</strong>
            </span>
          </a>

          <button
            type="button"
            className="sidebar__collapse"
            aria-label={isCollapsed ? t('Expand sidebar') : t('Collapse sidebar')}
            onClick={onToggleCollapse}
            title={isCollapsed ? t('Expand') : t('Collapse')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              color: '#555555',
              background: 'transparent',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 6h16M4 12h10M4 18h16" />
            </svg>
          </button>
        </div>

        <nav className="nav" aria-label="Main navigation">
          {visibleItems.map((item, index) => {
            const previous = visibleItems[index - 1];
            const showGroup =
              item.group && (!previous || previous.group !== item.group);

            return (
              <React.Fragment key={item.id}>
                {showGroup ? (
                  <span className="s3-nav-group-label">{t(item.group)}</span>
                ) : null}

                <a
                  href={`#${item.id}`}
                  className={`nav__item ${activeTab === item.id ? 'is-active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    selectTab(item.id);
                  }}
                >
                  <span className="nav-dot" />
                  <span className="sb-label">{t(item.label)}</span>
                </a>
              </React.Fragment>
            );
          })}
        </nav>

        <div className="sidebar__foot">
          <div className="sb-user">
            <span className="avatar avatar--accent">{initials}</span>
            <div className="sb-user__meta">
              <strong title={t(displayName)}>{t(displayName)}</strong>
              <small title={roleLabel}>{roleLabel}</small>
            </div>
            <div className="sb-user__actions">
              <button
                type="button"
                className="sb-user__icon icon-btn"
                title={t('Settings')}
                aria-label="Settings"
                onClick={() => selectTab('settings')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                  background: '#f8f7f3',
                  color: '#4b5563',
                  cursor: 'pointer',
                  flexShrink: 0,
                  padding: 0,
                }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: 'block' }}>
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>
              <button
                type="button"
                className="sb-user__icon icon-btn sb-signout-btn"
                title={t('Click to Sign out')}
                aria-label="Sign out"
                onClick={handleSignOut}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: '1.5px solid #fca5a5',
                  background: '#fee2e2',
                  color: '#dc2626',
                  cursor: 'pointer',
                  flexShrink: 0,
                  padding: 0,
                  boxShadow: '0 1px 2px rgba(220, 38, 38, 0.08)',
                }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: 'block', stroke: '#dc2626' }}>
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
