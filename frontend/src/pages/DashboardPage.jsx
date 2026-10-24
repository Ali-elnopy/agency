import React, { useEffect, useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import OverviewSection from '../components/sections/OverviewSection';
import ProfilePage from './ProfilePage';
import SettingsPage from './SettingsPage';
import RolesPermissionsPage from './RolesPermissionsPage';
import UserAccessPage from './UserAccessPage';
import BrandsPage from './BrandsPage';
import BrandDetailPage from './BrandDetailPage';
import AddBrandPage from './AddBrandPage';
import AddContentPage from './AddContentPage';
import { BrandsProvider } from '../context/BrandsContext';
import { WorkspaceProvider } from '../context/WorkspaceContext';
import { monthKey } from '../data/brands';
import TeamsPage from './TeamsPage';
import TeamDetailsPage from './TeamDetailsPage';
import AddTeamMemberPage from './AddTeamMemberPage';
import ManageBrandsPage from './ManageBrandsPage';
import NewBriefModal from '../components/modals/NewBriefModal';
import AssignTeamModal from '../components/modals/AssignTeamModal';
import InfoModal from '../components/modals/InfoModal';
import Toast from '../components/ui/Toast';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import { getDashboardStats } from '../services/dashboard';

// Every screen that can be reached from the sidebar or from a list row.
const SECTION_LABELS = {
  dashboard: 'Dashboard',
  clients: 'Brands',
  brandDetail: 'Brand Detail',
  addBrand: 'Add Brand',
  addContent: 'Add Content',
  teams: 'Teams',
  teamDetails: 'Team Details',
  addTeamMember: 'Add Team Member',
  manageBrands: 'Manage Brands',
  users: 'Users',
  roles: 'Roles & Permissions',
  profile: 'Profile',
  settings: 'Settings',
};

// The section each screen highlights in the sidebar.
// Settings is opened from the user-card gear and is not a nav destination, so
// it intentionally highlights nothing (it must not light up Profile).
const SECTION_TO_TAB = {
  brandDetail: 'clients',
  addBrand: 'clients',
  addContent: 'clients',
  teamDetails: 'teams',
  addTeamMember: 'teams',
  manageBrands: 'teams',
  roles: 'users',
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
  const { toast, showToast, clearToast } = useToast(8000);

  const [section, setSection] = useState('dashboard');
  const [activeBrandId, setActiveBrandId] = useState('brand-1');
  const [activePlanMonth, setActivePlanMonth] = useState(() => monthKey());
  const [activeTeam, setActiveTeam] = useState('Brand Strategy & Growth');
  const [stats, setStats] = useState(null);
  const [assignTarget, setAssignTarget] = useState(null);
  const [isNewBriefOpen, setIsNewBriefOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);
  const [usersSearch, setUsersSearch] = useState(null);

  useEffect(() => {
    let alive = true;

    getDashboardStats()
      .then((data) => {
        if (alive) setStats(data);
      })
      .catch(() => {
        // The API scopes this endpoint to administrators; other roles keep the
        // static overview instead of surfacing an error screen.
      });

    return () => {
      alive = false;
    };
  }, []);

  const go = (next, message) => {
    setSection(next);
    clearToast();
    if (message) showToast(message, 'info');
    window.scrollTo(0, 0);
  };

  const handleSelect = (id) => {
    if (SECTION_LABELS[id]) {
      if (id === 'users') setUsersSearch({ query: '', nonce: Date.now() });
      go(id);
      return;
    }

    showToast(`${id} page is coming soon.`, 'info');
  };

  const handleAddBrief = (brief) => {
    showToast(`Creative Brief "${brief.title}" launched successfully!`);
  };

  // Re-read the dashboard aggregates so the KPI cards, team distribution and
  // alert list reflect the assignment that was just persisted.
  const refreshStats = () => {
    getDashboardStats()
      .then(setStats)
      .catch(() => {});
  };

  const handleTeamAssigned = (teamName, brandName) => {
    refreshStats();
    showToast(`${brandName} was assigned to ${teamName}.`);
  };

  const openBrand = (brandId) => {
    setActiveBrandId(brandId || 'brand-1');
    setActivePlanMonth(monthKey());
    go('brandDetail');
  };

  const openAddContent = (month) => {
    setActivePlanMonth(month || monthKey());
    go('addContent');
  };

  const openTeam = (name) => {
    setActiveTeam(name || 'Brand Strategy & Growth');
    go('teamDetails');
  };

  // Global search opens the directory filtered to the chosen teammate instead
  // of the edit screen, so admins can review anyone without hitting the
  // "administrators cannot be edited" guard.
  const searchUser = (record) => {
    const name = record?.fullName || record?.name || '';
    setUsersSearch({ query: name, nonce: Date.now() });
    go('users');
  };

  // Page results from the global search open a clean directory; only picking a
  // person applies a directory filter.
  const navigateFromSearch = (id) => {
    if (id === 'users') setUsersSearch({ query: '', nonce: Date.now() });
    go(id);
  };

  const renderSection = () => {
    switch (section) {
      case 'profile':
        return <ProfilePage />;
      case 'settings':
        return <SettingsPage onSignOut={onSignOut} />;
      case 'roles':
        return <RolesPermissionsPage onOpenUsers={() => go('users')} />;
      case 'users':
        return (
          <UserAccessPage
            onAddMemberViaTeam={() => go('teams')}
            initialQuery={usersSearch}
          />
        );
      case 'clients':
        return <BrandsPage onOpenBrand={openBrand} onAddBrand={() => go('addBrand')} />;
      case 'brandDetail':
        return (
          <BrandDetailPage
            key={activeBrandId}
            brandId={activeBrandId}
            initialMonth={activePlanMonth}
            onBack={() => go('clients')}
            onAddContent={openAddContent}
            onDeleted={() => go('clients', 'Brand deleted.')}
          />
        );
      case 'addBrand':
        return (
          <AddBrandPage
            onBack={() => go('clients')}
            onSaved={(brand) => {
              setActiveBrandId(brand.id);
              go('brandDetail', 'Brand created successfully.');
            }}
          />
        );
      case 'addContent':
        return (
          <AddContentPage
            key={`${activeBrandId}-${activePlanMonth}`}
            brandId={activeBrandId}
            initialMonth={activePlanMonth}
            onBack={() => go('brandDetail')}
          />
        );
      case 'teams':
        return <TeamsPage onOpenTeam={openTeam} />;
      case 'teamDetails':
        return (
          <TeamDetailsPage
            team={activeTeam}
            onBack={() => go('teams')}
            onAddMember={() => go('addTeamMember')}
            onManageBrands={() => go('manageBrands')}
            onOpenBrand={openBrand}
            onDeleted={() => go('teams', 'Team deleted.')}
          />
        );
      case 'addTeamMember':
        return (
          <AddTeamMemberPage
            team={activeTeam}
            onBack={() => go('teamDetails')}
            onSaved={(message) => go('teamDetails', message)}
          />
        );
      case 'manageBrands':
        return (
          <ManageBrandsPage
            team={activeTeam}
            onBack={() => go('teamDetails')}
            onSaved={(message) => go('teamDetails', message)}
          />
        );
      default:
        return (
          <>
            <section className="page-head">
              <h1 className="page-head__title">Dashboard</h1>
            </section>

            <OverviewSection
              stats={stats}
              onViewWorkload={() => go('clients')}
              onAssignTeam={setAssignTarget}
            />
          </>
        );
    }
  };

  const actionLabel =
    section === 'roles'
      ? 'New Custom Role'
      : section === 'clients'
        ? 'Add Brand'
        : section === 'brandDetail'
          ? 'Add Content'
          : section === 'profile' ||
              section === 'settings' ||
              section === 'addBrand' ||
              section === 'addContent' ||
              section === 'users' ||
              section === 'teams' ||
              section === 'teamDetails' ||
              section === 'addTeamMember' ||
              section === 'manageBrands'
            ? null
            : 'New Brief';

  const handleAction = () => {
    if (section === 'clients') {
      go('addBrand');
    } else if (section === 'brandDetail') {
      openAddContent();
    } else if (section === 'roles') {
      showToast('Opening the custom role builder…', 'info');
    } else {
      setIsNewBriefOpen(true);
    }
  };

  return (
    <WorkspaceProvider>
      <BrandsProvider>
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
            onSearchNavigate={navigateFromSearch}
            onSearchBrand={openBrand}
            onSearchTeam={openTeam}
            onSearchUser={searchUser}
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

      {/* Assign an unassigned brand to a team from the dashboard alert */}
      <AssignTeamModal
        isOpen={Boolean(assignTarget)}
        brand={assignTarget}
        onClose={() => setAssignTarget(null)}
        onAssigned={handleTeamAssigned}
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
            RBAC permissions for creative teams and brand portals.
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
      </BrandsProvider>
    </WorkspaceProvider>
  );
}
