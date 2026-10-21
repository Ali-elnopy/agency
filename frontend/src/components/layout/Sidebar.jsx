import React, { useState } from 'react';
import InfoModal from '../modals/InfoModal';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '#i-dashboard' },
  { id: 'brands', label: 'Brands', icon: '#i-briefcase', soon: true },
  { id: 'teams', label: 'Teams', icon: '#i-layers', soon: true },
  { id: 'users', label: 'Users & Clients', icon: '#i-users' },
  { id: 'content', label: 'Content', icon: '#i-file', soon: true },
  { id: 'analyze', label: 'Analyze', icon: '#i-chart', soon: true },
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
            <span className="brand__mark" aria-hidden="true" />
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
            <svg className="icon">
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
              <svg className="icon">
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
            <svg className="icon">
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ color: 'var(--muted)', fontSize: '13px' }}>
            Built with modern design tokens adhering to strict accessibility and dark mode specifications:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--orange)', color: '#fff', fontSize: '11px', fontWeight: 600 }}>Orange (Primary)</div>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--purple)', color: '#fff', fontSize: '11px', fontWeight: 600 }}>Purple (Creative)</div>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--green)', color: '#fff', fontSize: '11px', fontWeight: 600 }}>Green (Success)</div>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--amber)', color: '#fff', fontSize: '11px', fontWeight: 600 }}>Amber (Warning)</div>
          </div>
        </div>
      </InfoModal>
    </>
  );
}
