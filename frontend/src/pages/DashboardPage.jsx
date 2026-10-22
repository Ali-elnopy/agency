import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import OverviewSection from '../components/sections/OverviewSection';
import RolesSection from '../components/sections/RolesSection';
import ActivitySection from '../components/sections/ActivitySection';
import SettingsPage from './SettingsPage';
import RolesPermissionsPage from './RolesPermissionsPage';
import UserAccessPage from './UserAccessPage';
import ClientsPage from './ClientsPage';
import ClientProfilePage from './ClientProfilePage';
import EditClientPage from './EditClientPage';
import TeamsPage from './TeamsPage';
import TeamDetailsPage from './TeamDetailsPage';
import AddUserPage from './AddUserPage';
import EditUserPage from './EditUserPage';
import NewBriefModal from '../components/modals/NewBriefModal';
import InfoModal from '../components/modals/InfoModal';
import Toast from '../components/ui/Toast';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';

// Every screen that can be reached from the sidebar or from a list row.
const SECTION_LABELS = {
  dashboard: 'Dashboard',
  clients: 'Clients',
  clientProfile: 'Client Profile',
  editClient: 'Edit Client',
  teams: 'Teams',
  teamDetails: 'Team Details',
  users: 'Users',
  addUser: 'Add User',
  editUser: 'Edit User',
  roles: 'Roles & Permissions',
  settings: 'Settings',
};

// The section each screen highlights in the sidebar.
const SECTION_TO_TAB = {
  clientProfile: 'clients',
  editClient: 'clients',
  teamDetails: 'teams',
  addUser: 'users',
  editUser: 'users',
  roles: 'users',
};

const SEARCH_PLACEHOLDERS = {
  dashboard: 'Search briefs, campaigns, assets, clients...',
  clients: 'Search clients, managers, teams...',
  clientProfile: 'Search clients, assets, contacts...',
  editClient: 'Search clients, assets, contacts...',
  teams: 'Search teams, people, clients...',
  teamDetails: 'Search squad members...',
  users: 'Search or jump to...',
  addUser: 'Search or jump to...',
  editUser: 'Search or jump to...',
  roles: 'Search roles, permissions...',
  settings: 'Search settings...',
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
  const [activeClient, setActiveClient] = useState('Lumina Health');
  const [activeTeam, setActiveTeam] = useState('Brand Strategy & Growth');
  const [activeUser, setActiveUser] = useState('Marcus Vance');
  const [isNewBriefOpen, setIsNewBriefOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);
  const [newActivity, setNewActivity] = useState(null);
  const [addClientRequest, setAddClientRequest] = useState(0);

  const go = (next, message) => {
    setSection(next);
    clearToast();
    if (message) showToast(message, 'info');
    window.scrollTo(0, 0);
  };

  const handleSelect = (id) => {
    if (SECTION_LABELS[id]) {
      go(id);
      return;
    }

    showToast(`${id} page is coming soon.`, 'info');
  };

  const handleAddBrief = (brief) => {
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

  const openClient = (name) => {
    setActiveClient(name || 'Lumina Health');
    go('clientProfile');
  };

  const openTeam = (name) => {
    setActiveTeam(name || 'Brand Strategy & Growth');
    go('teamDetails');
  };

  const openUser = (name) => {
    setActiveUser(name || 'Marcus Vance');
    go('editUser');
  };

  const renderSection = () => {
    switch (section) {
      case 'settings':
        return <SettingsPage />;
      case 'roles':
        return <RolesPermissionsPage onOpenUsers={() => go('users')} />;
      case 'users':
        return (
          <UserAccessPage
            onOpenRoles={() => go('roles')}
            onAddUser={() => go('addUser')}
            onEditUser={openUser}
          />
        );
      case 'addUser':
        return <AddUserPage onBack={() => go('users')} onSaved={() => go('users')} />;
      case 'editUser':
        return (
          <EditUserPage
            member={activeUser}
            onBack={() => go('users')}
            onSaved={() => go('users')}
          />
        );
      case 'clients':
        return <ClientsPage onOpenClient={openClient} addClientRequest={addClientRequest} />;
      case 'clientProfile':
        return (
          <ClientProfilePage
            client={activeClient}
            onBack={() => go('clients')}
            onEditClient={() => go('editClient')}
          />
        );
      case 'editClient':
        return <EditClientPage onBack={() => go('clientProfile')} onSaved={() => go('clients')} />;
      case 'teams':
        return <TeamsPage onOpenTeam={openTeam} />;
      case 'teamDetails':
        return <TeamDetailsPage team={activeTeam} onBack={() => go('teams')} />;
      default:
        return (
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
                  Admin
                </a>
                <svg aria-hidden="true" className="icon">
                  <use href="#i-chevron" />
                </svg>
                <strong>Executive Dashboard</strong>
              </nav>

              <span className="pill is-green live-chip">Live Studio Ops</span>
            </div>

            <section className="page-head">
              <h1 className="page-head__title">Organization Overview</h1>
              <p className="page-head__text">
                Studio health, brand retainers and squad capacity across every active workspace.
              </p>
            </section>

            <OverviewSection
              onAddClient={() => go('clients')}
              onAddUser={() => go('addUser')}
              onCreateTeam={() => go('teams')}
              onViewWorkload={() => go('clients')}
            />

            <section className="row row--admin">
              <RolesSection onRoleCreated={handleRoleCreated} onOpenMatrix={() => go('roles')} />
              <ActivitySection incomingActivity={newActivity} />
            </section>
          </>
        );
    }
  };

  const actionLabel =
    section === 'roles'
      ? 'New Custom Role'
      : section === 'clients' || section === 'clientProfile' || section === 'editClient'
        ? 'Add Client'
        : section === 'teams' || section === 'teamDetails'
          ? 'New'
          : section === 'users' || section === 'addUser' || section === 'editUser'
            ? 'Add User'
            : 'New Brief';

  const handleAction = () => {
    if (section === 'clients' || section === 'clientProfile' || section === 'editClient') {
      setAddClientRequest((value) => value + 1);
      go('clients');
    } else if (section === 'teams' || section === 'teamDetails') {
      showToast('Create Team drawer is coming soon.', 'info');
    } else if (section === 'users' || section === 'addUser' || section === 'editUser') {
      go('addUser');
    } else if (section === 'roles') {
      showToast('Opening the custom role builder…', 'info');
    } else {
      setIsNewBriefOpen(true);
    }
  };

  return (
    <div className="app" data-collapsed={isCollapsed ? 'true' : 'false'}>
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={onToggleCollapse}
        onNavigate={onNavigate}
        activeTab={SECTION_TO_TAB[section] ?? section}
        onSelect={handleSelect}
        user={user}
        onSignOut={onSignOut}
      />

      <div className="workspace">
        <Topbar
          theme={theme}
          onToggleTheme={onToggleTheme}
          onSignOut={() => setIsSignOutOpen(true)}
          onNewBrief={() => setIsNewBriefOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
          searchPlaceholder={SEARCH_PLACEHOLDERS[section]}
          actionLabel={actionLabel}
          onAction={handleAction}
        />

        <main className="content">{renderSection()}</main>
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
