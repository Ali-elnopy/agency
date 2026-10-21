import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import StatsSection from '../components/sections/StatsSection';
import RolesSection from '../components/sections/RolesSection';
import ActivitySection from '../components/sections/ActivitySection';
import SettingsPage from './SettingsPage';
import RolesPermissionsPage from './RolesPermissionsPage';
import UserAccessPage from './UserAccessPage';
import NewBriefModal from '../components/modals/NewBriefModal';
import InfoModal from '../components/modals/InfoModal';
import Toast from '../components/ui/Toast';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';

// Anything outside this list is announced as "coming soon" instead of
// silently rendering the dashboard under a different highlighted tab.
const AVAILABLE_SECTIONS = ['dashboard', 'users', 'roles', 'settings'];

const SECTION_LABELS = {
  dashboard: 'Dashboard',
  brands: 'Brands',
  teams: 'Teams',
  users: 'Users & Clients',
  content: 'Content',
  analyze: 'Analyze',
  settings: 'Settings',
};

export default function DashboardPage({
  theme,
  onToggleTheme,
  isCollapsed,
  onToggleCollapse,
  onSignOut,
  onNavigate,
}) {
  const { user } = useAuth();
  const { toast, showToast, clearToast } = useToast();

  const [section, setSection] = useState('dashboard');
  const [isNewBriefOpen, setIsNewBriefOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);
  const [newActivity, setNewActivity] = useState(null);

  const handleSelect = (id) => {
    if (AVAILABLE_SECTIONS.includes(id)) {
      setSection(id);
      clearToast();
      return;
    }

    showToast(`${SECTION_LABELS[id] ?? 'This'} page is coming soon.`, 'info');
  };

  const handleAddBrief = (brief) => {
    // Add activity record
    setNewActivity({
      id: Date.now(),
      avatarClass: 'is-a',
      initials: user?.fullName
        ? user.fullName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .substring(0, 2)
        : 'EV',
      name: user?.fullName || 'Elena Vance',
      time: 'Just now',
      role: 'Creative Lead',
      action: (
        <>
          <span className="pill is-orange">
            <svg aria-hidden="true" className="icon">
              <use href="#i-send" />
            </svg>
            Launched
          </span>{' '}
          Brief &quot;{brief.title}&quot; for {brief.brand}
        </>
      ),
    });

    showToast(`Creative Brief "${brief.title}" launched successfully!`);
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
            <svg aria-hidden="true" className="icon">
              <use href="#i-users" />
            </svg>
            Configured
          </span>{' '}
          New Role &quot;{role.title}&quot; with {role.badge} permissions.
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
        activeTab={section === 'roles' ? 'users' : section}
        onSelect={handleSelect}
      />

      <div className="workspace">
        <Topbar
          theme={theme}
          onToggleTheme={onToggleTheme}
          onSignOut={() => setIsSignOutOpen(true)}
          onNewBrief={() => setIsNewBriefOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
          actionLabel={
            section === 'roles'
              ? 'New Custom Role'
              : section === 'users'
                ? 'Add New User'
                : 'New Brief'
          }
          onAction={
            section === 'roles'
              ? () => showToast('Opening the custom role builder…', 'info')
              : section === 'users'
                ? () => showToast('Creating a new user invitation…', 'info')
                : undefined
          }
        />

        <main className="content">
          {section === 'settings' ? (
            <SettingsPage />
          ) : section === 'users' ? (
            <UserAccessPage onOpenRoles={() => setSection('roles')} />
          ) : section === 'roles' ? (
            <RolesPermissionsPage onOpenUsers={() => setSection('users')} />
          ) : (
            <>
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
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-chevron" />
                  </svg>
                  <strong>Dashboard</strong>
                </nav>

                <span className="pill is-green live-chip">Live Studio Ops</span>
              </div>

              <section className="page-head">
                <h1 className="page-head__title">Dashboard</h1>
                <p className="page-head__text">
                  Agency Operating System &amp; Real-Time Production Velocity across active brand
                  partners and user seats.
                </p>
              </section>

              <StatsSection />

              <section className="row row--admin">
                <RolesSection
                  onRoleCreated={handleRoleCreated}
                  onOpenMatrix={() => setSection('roles')}
                />
                <ActivitySection incomingActivity={newActivity} />
              </section>
            </>
          )}
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
        <p className="modal-copy">
          Welcome to the ORVIA Agency Operating System. Here are quick tips for managing your
          studio:
        </p>
        <ul className="modal-list">
          <li>
            <strong>Role Management:</strong> Use the <code>+ New Role</code> modal to configure
            RBAC permissions for creative teams and client portals.
          </li>
          <li>
            <strong>Briefs &amp; Campaigns:</strong> Launch new creative briefs from the top
            navigation bar to trigger automated team pipelines.
          </li>
          <li>
            <strong>Dark / Light Mode:</strong> Toggle anytime via the sun/moon button; preferences
            persist across sessions.
          </li>
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
        <p className="modal-copy modal-copy--muted">
          Your draft changes and cached credentials will be cleared for security. You can sign back
          in at any time.
        </p>
      </InfoModal>

      {/* Floating Toast Notification */}
      <Toast message={toast?.message} tone={toast?.tone} />
    </div>
  );
}
