import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import StatsSection from './StatsSection';
import RolesSection from './RolesSection';
import ActivitySection from './ActivitySection';
import NewBriefModal from './modals/NewBriefModal';
import InfoModal from './modals/InfoModal';

export default function DashboardView({
  user,
  theme,
  onToggleTheme,
  isCollapsed,
  onToggleCollapse,
  onSignOut,
  onNavigate,
}) {
  const [isNewBriefOpen, setIsNewBriefOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [newActivity, setNewActivity] = useState(null);

  const handleAddBrief = (brief) => {
    // Add activity record
    setNewActivity({
      id: Date.now(),
      avatarClass: 'is-a',
      initials: user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2) : 'EV',
      name: user?.fullName || 'Elena Vance',
      time: 'Just now',
      role: 'Creative Lead',
      action: (
        <>
          <span className="pill is-orange">
            <svg className="icon">
              <use href="#i-send" />
            </svg>
            Launched
          </span>{' '}
          Brief "{brief.title}" for {brief.brand}
        </>
      ),
    });

    setToast(`Creative Brief "${brief.title}" launched successfully!`);
    setTimeout(() => setToast(''), 4000);
  };

  const handleRoleCreated = (role) => {
    setNewActivity({
      id: Date.now(),
      avatarClass: `is-${role.color === 'purple' ? 'b' : role.color === 'green' ? 'c' : 'a'}`,
      initials: 'AD',
      name: 'System Governance',
      time: 'Just now',
      role: 'Admin Ops',
      action: (
        <>
          <span className={`pill is-${role.color}`}>
            <svg className="icon">
              <use href="#i-users" />
            </svg>
            Configured
          </span>{' '}
          New Role "{role.title}" with {role.badge} permissions.
        </>
      ),
    });
  };

  return (
    <div className="app" data-collapsed={isCollapsed ? 'true' : 'false'}>
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={onToggleCollapse}
        onNavigate={onNavigate}
      />

      <div className="workspace">
        <Topbar
          user={user}
          theme={theme}
          onToggleTheme={onToggleTheme}
          onSignOut={() => setIsSignOutOpen(true)}
          onNewBrief={() => setIsNewBriefOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
        />

        <main className="content">
          <div className="crumbs">
            <nav aria-label="Breadcrumb">
              <a
                href="#home"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('dashboard');
                }}
              >
                Home
              </a>
              <svg className="icon">
                <use href="#i-chevron" />
              </svg>
              <strong>Dashboard</strong>
            </nav>

            <span className="pill is-green live-chip">Live Studio Ops</span>
          </div>

          <section className="page-head">
            <h1 className="page-head__title">Dashboard</h1>
            <p className="page-head__text">
              Agency Operating System &amp; Real-Time Production Velocity across active brand partners and user seats.
            </p>
          </section>

          <StatsSection />

          <section className="row row--admin">
            <RolesSection onRoleCreated={handleRoleCreated} />
            <ActivitySection incomingActivity={newActivity} />
          </section>
        </main>
      </div>

      {/* New Creative Brief Creation Modal */}
      <NewBriefModal
        isOpen={isNewBriefOpen}
        onClose={() => setIsNewBriefOpen(false)}
        onAddBrief={handleAddBrief}
      />

      {/* Help & Support Info Modal */}
      <InfoModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="ORVIA OS Support & Knowledge Base"
        subtitle="Version 3.4 — Production Velocity Suite"
        icon="#i-zap"
        iconColor="orange"
        actionText="Close Help Center"
      >
        <p style={{ marginBottom: '10px' }}>
          Welcome to the ORVIA Agency Operating System. Here are quick tips for managing your studio:
        </p>
        <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--muted)', fontSize: '13px' }}>
          <li><strong>Role Management:</strong> Use the <code>+ New Role</code> modal to configure RBAC permissions for creative teams and client portals.</li>
          <li><strong>Briefs &amp; Campaigns:</strong> Launch new creative briefs from the top navigation bar to trigger automated team pipelines.</li>
          <li><strong>Dark / Light Mode:</strong> Toggle anytime via the sun/moon button; preferences persist across sessions.</li>
        </ul>
      </InfoModal>

      {/* Sign Out Confirmation Modal */}
      <InfoModal
        isOpen={isSignOutOpen}
        onClose={() => setIsSignOutOpen(false)}
        title="Sign Out of ORVIA"
        subtitle="Are you sure you want to exit your active studio session?"
        icon="#i-alert"
        iconColor="amber"
        actionText="Confirm Sign Out"
        onAction={onSignOut}
      >
        <p style={{ color: 'var(--muted)', fontSize: '13px' }}>
          Your draft changes and cached credentials will be cleared for security. You can sign back in at any time.
        </p>
      </InfoModal>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="toast-notice">
          <span className="toast-icon chip is-green">
            <svg className="icon" viewBox="0 0 24 24" width="14" height="14">
              <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.5" />
            </svg>
          </span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
