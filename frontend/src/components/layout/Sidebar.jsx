import React, { useState } from 'react';
import Logo from '../Logo';
import { useSprint3 } from '../../context/sprint3Store';
import { roleLabel as previewRoleLabel } from '../sprint3/Sprint3UI';

// "ADMIN CORE" navigation from the ORVIA design.
// Roles & Permissions is not a top-level destination — it is reached from the Users page.
// Settings is not a nav item either: it lives behind the gear icon in the user card.
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '#i-dashboard' },
  {
    id: 'clients',
    label: 'Brands',
    icon: '#i-briefcase',
    roles: ['admin', 'account_manager', 'creative'],
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: '#i-file',
    group: 'Strategy & Content',
    roles: ['admin'],
  },
  {
    id: 'dispatch',
    label: 'Question Dispatch',
    icon: '#i-send',
    group: 'Strategy & Content',
    roles: ['admin', 'account_manager'],
  },
  {
    id: 'briefs',
    label: 'AI Briefs',
    icon: '#i-zap',
    group: 'Strategy & Content',
    roles: ['admin', 'account_manager'],
  },
  {
    id: 'strategy',
    label: 'Strategy',
    icon: '#i-chart',
    group: 'Strategy & Content',
    roles: ['admin', 'account_manager', 'creative', 'client'],
  },
  {
    id: 'content',
    label: 'Content Items',
    icon: '#i-calendar',
    group: 'Strategy & Content',
    roles: ['admin', 'account_manager', 'creative', 'client'],
  },
  {
    id: 'tasks',
    label: 'Tasks Management',
    icon: '#i-layers',
    group: 'Execution & Review',
    roles: ['admin', 'account_manager', 'creative'],
  },
  {
    id: 'myWork',
    label: 'My Work',
    icon: '#i-check',
    group: 'Execution & Review',
    roles: ['admin', 'account_manager', 'creative'],
  },
  {
    id: 'decisions',
    label: 'Decision Settings',
    icon: '#i-target',
    roles: ['admin'],
  },
  {
    id: 'portal',
    label: 'Client Portal',
    icon: '#i-external',
    roles: ['admin', 'account_manager', 'client'],
  },
  {
    id: 'teams',
    label: 'Teams',
    icon: '#i-layers',
    roles: ['admin', 'account_manager'],
  },
  { id: 'users', label: 'Users', icon: '#i-users', roles: ['admin'] },
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
  const { role, t } = useSprint3();
  const [localTab, setLocalTab] = useState('dashboard');
  const activeTab = activeTabProp ?? localTab;

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(role),
  );

  const displayName = user?.fullName || 'Elena Vance';
  const accountRole =
    user?.role === 'ADMIN'
      ? 'Admin'
      : user?.role === 'TEAM_LEADER'
        ? 'Team Leader'
        : user?.role === 'ACCOUNT_MANAGER'
          ? 'Account Manager'
          : 'Team Member';
  const roleLabel = `${t(accountRole)} · ${t(previewRoleLabel(role))}`;
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
            <span className="brand__text">
              <strong>ORVIA</strong>
            </span>
          </a>

          <button
            type="button"
            className="sidebar__collapse"
            aria-label={isCollapsed ? t('Expand sidebar') : t('Collapse sidebar')}
            onClick={onToggleCollapse}
            title={isCollapsed ? t('Expand') : t('Collapse')}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
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
                  <svg className="icon" aria-hidden="true">
                    <use href={item.icon} />
                  </svg>
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
              <strong title={displayName}>{displayName}</strong>
              <small title={roleLabel}>{roleLabel}</small>
            </div>
            <div className="sb-user__actions">
              <button
                type="button"
                className="icon-btn"
                title={t('Settings')}
                aria-label="Settings"
                onClick={() => selectTab('settings')}
              >
                <svg className="icon" aria-hidden="true">
                  <use href="#i-settings" />
                </svg>
              </button>
              <button
                type="button"
                className="icon-btn"
                title={t('Click to Sign out')}
                aria-label="Sign out"
                onClick={handleSignOut}
              >
                <svg className="icon" aria-hidden="true">
                  <use href="#i-logout" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
