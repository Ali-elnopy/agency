import React, { useState } from 'react';
import InfoModal from '../modals/InfoModal';
import Logo from '../Logo';

// "ADMIN CORE" navigation from the ORVIA design.
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '#i-dashboard' },
  { id: 'clients', label: 'Clients', icon: '#i-briefcase' },
  { id: 'teams', label: 'Teams', icon: '#i-layers' },
  { id: 'users', label: 'Users', icon: '#i-users' },
  { id: 'roles', label: 'Roles & Permissions', icon: '#i-shield' },
  { id: 'settings', label: 'Settings', icon: '#i-settings' },
];

export default function Sidebar({
  isCollapsed,
  onToggleCollapse,
  onNavigate,
  activeTab: activeTabProp,
  onSelect,
}) {
  const [localTab, setLocalTab] = useState('dashboard');
  const activeTab = activeTabProp ?? localTab;
  const [isUiKitOpen, setIsUiKitOpen] = useState(false);

  const selectTab = (id) => {
    setLocalTab(id);
    if (onSelect) onSelect(id);
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
            <a
              key={item.id}
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
          ))}
        </nav>

        <div className="sidebar__foot">
          <a
            href="#uikit"
            className="nav__item nav__item--kit"
            onClick={(e) => {
              e.preventDefault();
              setIsUiKitOpen(true);
            }}
          >
            <svg aria-hidden="true" className="icon">
              <use href="#i-layers" />
            </svg>
            <span className="sb-label">UI Kit &amp; Tokens</span>
          </a>
          <p className="mode-chip sb-label">
            <i className="mode-chip__dot" />
            Sidebar Mode <b>{isCollapsed ? 'Collapsed' : 'Expanded'}</b>
          </p>
        </div>
      </aside>

      {/* UI Kit Modal */}
      <InfoModal
        isOpen={isUiKitOpen}
        onClose={() => setIsUiKitOpen(false)}
        title="ORVIA Design Tokens &amp; System"
        subtitle="Typography, color palettes, and component library specs."
        icon="#i-layers"
        iconColor="purple"
      >
        <div className="uikit-stack">
          <p className="uikit-copy">
            Built with modern design tokens adhering to strict accessibility and dark mode
            specifications:
          </p>
          <div className="uikit-grid">
            <div className="uikit-swatch uikit-swatch--orange">Orange (Primary)</div>
            <div className="uikit-swatch uikit-swatch--purple">Purple (Creative)</div>
            <div className="uikit-swatch uikit-swatch--green">Green (Success)</div>
            <div className="uikit-swatch uikit-swatch--amber">Amber (Warning)</div>
          </div>
        </div>
      </InfoModal>
    </>
  );
}
