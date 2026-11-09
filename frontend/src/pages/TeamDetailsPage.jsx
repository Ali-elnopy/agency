import React, { useState } from 'react';
import ConfirmModal from '../components/modals/ConfirmModal';
import TeamMembersModal from '../components/teams/TeamMembersModal';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';
import { useWorkspace } from '../context/workspaceStore';
import { useBrands } from '../context/brandsStore';
import { ACCESS_LEVEL_BY_ID, initialsOf, teamMemberIds } from '../data/workspace';

export default function TeamDetailsPage({
  team: teamName,
  onBack,
  onAddMember,
  onManageBrands,
  onOpenBrand,
  onDeleted,
}) {
  const { users, teams, deleteTeam, removeTeamMember } = useWorkspace();
  const { brands } = useBrands();
  const { toast, showToast } = useToast(3500);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);

  const [currentTeamId] = useState(() => {
    const found = teams.find(
      (item) => item.name === teamName || String(item.id) === String(teamName),
    );
    return found ? found.id : null;
  });

  const team =
    teams.find((item) => (currentTeamId && item.id === currentTeamId) || item.name === teamName) ??
    null;

  if (!team) {
    return (
      <div className="ws-page">
        <button type="button" className="ws-back" onClick={onBack}>
          <span aria-hidden="true">←</span> Back to Teams
        </button>
        <div className="ws-empty ws-empty--panel">
          <strong>Team not found.</strong>
          <p>This team may have been deleted.</p>
        </div>
      </div>
    );
  }

  const memberIds = teamMemberIds(team, users);

  const members = memberIds
    .map((id) => users.find((user) => String(user.id) === String(id)))
    .filter(Boolean);

  const assignedBrands = (team.brandIds ?? [])
    .map((brandId) => brands.find((brand) => String(brand.id) === String(brandId)))
    .filter(Boolean);

  const removeMember = async (member) => {
    try {
      await removeTeamMember(team.id, member.id);
      showToast(`${member.fullName} removed from ${team.name}.`);
    } catch (err) {
      showToast(err?.message || `Failed to remove ${member.fullName} from team.`, 'error');
    }
  };

  const confirmDelete = () => {
    deleteTeam(team.id);
    setIsDeleteOpen(false);
    onDeleted?.();
  };

  return (
    <div className="ws-page">
      <button type="button" className="ws-back" onClick={onBack}>
        <span aria-hidden="true">←</span> Back to Teams
      </button>

      <section className="ws-team-head">
        <div>
          <div className="ws-team-title-line">
            <h1 className="ws-page-title">{team.name}</h1>
            <span className="ws-badge ws-badge--active">Active</span>
            {team.teamLead ? (
              <span className="ws-badge ws-badge--role">
                Team leader: {team.teamLead.fullName}
              </span>
            ) : (
              <span className="ws-badge ws-badge--muted">No team leader</span>
            )}
          </div>
          <p className="ws-team-desc">{team.description?.trim() || 'No description added.'}</p>
        </div>

        <div className="ws-team-actions">
          <button
            type="button"
            className="ws-btn ws-btn--ghost"
            onClick={() => setIsMembersOpen(true)}
          >
            <svg aria-hidden="true" className="icon">
              <use href="#i-users" />
            </svg>
            Edit Team
          </button>
          <button
            type="button"
            className="ws-btn ws-btn--danger-ghost"
            onClick={() => setIsDeleteOpen(true)}
          >
            Delete Team
          </button>
        </div>
      </section>

      <div className="ws-stat-grid">
        <article className="ws-stat-card">
          <span className="ws-stat-card__label">Team Members</span>
          <strong className="ws-stat-card__value">{members.length}</strong>
        </article>
        <article className="ws-stat-card">
          <span className="ws-stat-card__label">Assigned Brands</span>
          <strong className="ws-stat-card__value">{assignedBrands.length}</strong>
        </article>
      </div>

      <div className="ws-team-columns">
        <section className="ws-panel">
          <header className="ws-panel__head">
            <div>
              <h2>Members</h2>
              <p>People working in this team.</p>
            </div>
            <button type="button" className="ws-btn ws-btn--primary" onClick={onAddMember}>
              <svg aria-hidden="true" className="icon">
                <use href="#i-plus" />
              </svg>
              Add Member
            </button>
          </header>

          <div className="ws-panel__body">
            {members.length ? (
              members.map((member) => {
                const access =
                  ACCESS_LEVEL_BY_ID[member.systemAccess] ?? ACCESS_LEVEL_BY_ID.employee;

                return (
                  <article className="ws-member-row" key={member.id}>
                    <span className="ws-member-avatar">{initialsOf(member.fullName)}</span>
                    <div className="ws-member-body">
                      <div className="ws-member-name-line">
                        <strong>{member.fullName}</strong>
                        <span className="ws-badge ws-badge--role">{access.short}</span>
                      </div>
                      <span className="ws-member-job">{member.jobTitle}</span>
                      <span className="ws-member-email">{member.email}</span>
                    </div>
                    <button
                      type="button"
                      className="ws-remove"
                      onClick={() => removeMember(member)}
                    >
                      Remove from team
                    </button>
                  </article>
                );
              })
            ) : (
              <div className="ws-empty">
                <strong>No members yet.</strong>
                <p>Add the first person to this team.</p>
              </div>
            )}
          </div>
        </section>

        <section className="ws-panel">
          <header className="ws-panel__head">
            <div>
              <h2>Assigned Brands</h2>
              <p>Brands managed by this team.</p>
            </div>
            <button type="button" className="ws-btn ws-btn--ghost" onClick={onManageBrands}>
              Manage Brands
            </button>
          </header>

          <div className="ws-panel__body">
            {assignedBrands.length ? (
              assignedBrands.map((brand) => (
                <button
                  type="button"
                  className="ws-brand-row"
                  key={brand.id}
                  onClick={() => onOpenBrand?.(brand.id)}
                >
                  <span className="ws-brand-row__body">
                    <strong>{brand.name}</strong>
                    <small>
                      {brand.industry || 'No industry'} • {brand.country || 'No country'}
                    </small>
                  </span>
                  <svg aria-hidden="true" className="icon ws-brand-row__arrow">
                    <use href="#i-arrow" />
                  </svg>
                </button>
              ))
            ) : (
              <div className="ws-empty">
                <strong>No brands assigned.</strong>
                <p>Use Manage Brands to assign this team.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete team?"
        subtitle="This action cannot be undone."
        icon="#i-trash"
        confirmText="Delete Team"
        onConfirm={confirmDelete}
      >
        <p className="ws-modal-copy">
          <strong>{team.name}</strong> will be removed. Its members stay in the directory but will
          no longer be assigned to this team.
        </p>
      </ConfirmModal>

      {isMembersOpen ? (
        <TeamMembersModal
          team={team}
          onClose={() => setIsMembersOpen(false)}
          onSaved={(message) => showToast(message || 'Team updated.')}
        />
      ) : null}

      <Toast message={toast?.message} tone={toast?.tone} />
    </div>
  );
}
