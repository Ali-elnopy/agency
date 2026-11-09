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
    roles: ['creative'],
  },
  {
    id: 'managerProgress',
    label: 'Team Progress',
    icon: '#i-trend',
    group: 'Execution & Review',
    roles: ['admin', 'account_manager'],
  },
  {
    id: 'clientReview',
    label: 'Client Review',
    icon: '#i-eye',
    group: 'Client & Delivery',
    roles: ['client', 'admin', 'account_manager'],
  },
  {
    id: 'clientRequests',
    label: 'Client Requests',
    icon: '#i-mail',
    group: 'Client & Delivery',
    roles: ['client', 'admin', 'account_manager'],
  },
  {
    id: 'publishing',
    label: 'Publishing',
    icon: '#i-globe',
    group: 'Client & Delivery',
    roles: ['admin', 'account_manager'],
  },
  {
    id: 'analytics',
    label: 'Analytics & Reports',
    icon: '#i-chart',
    group: 'Client & Delivery',
    roles: ['admin', 'account_manager'],
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
            <span className="brand__text sb-label">
              <strong>ORVIA</strong>
            </span>
          </a>
          <button
            type="button"
            className="sidebar__collapse"
            aria-label={isCollapsed ? t('Expand sidebar') : t('Collapse sidebar')}
            onClick={onToggleCollapse}
            title={isCollapsed ? t('Expand sidebar') : t('Collapse sidebar')}
          >
            <svg aria-hidden="true" className="icon">
              <use href="#i-panel" />
            </svg>
          </button>
        </div>

        <nav className="nav">
          {visibleItems.map((item, index) => {
            const previous = visibleItems[index - 1];
            const startGroup = item.group && item.group !== previous?.group;
            const isProfile = item.id === 'profile';
            const showDivider = isProfile || (previous?.group && !item.group);

            return (
              <React.Fragment key={item.id}>
                {startGroup ? (
                  <span className="nav__group sb-label">{t(item.group)}</span>
                ) : null}
                {showDivider ? <span className="nav__divider" aria-hidden="true" /> : null}
                <a
                  href={`#${item.id}`}
                  className={`nav__item ${activeTab === item.id ? 'is-active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    selectTab(item.id);
                  }}
                  title={t(item.label)}
                >
                  <svg aria-hidden="true" className="icon">
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
                aria-label={t('Settings')}
                title={t('Settings')}
              >
                <svg aria-hidden="true" className="icon">
                  <use href="#i-settings" />
                </svg>
              </button>
              <button
                type="button"
                className="sb-user__icon"
                onClick={handleSignOut}
                aria-label={t('Sign out')}
                title={t('Sign out')}
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
