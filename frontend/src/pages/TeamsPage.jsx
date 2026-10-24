import React, { useState } from 'react';
import Modal from '../components/common/Modal';
import TeamMembersModal from '../components/teams/TeamMembersModal';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';
import { useWorkspace } from '../context/workspaceStore';

const TONES = ['tone-orange', 'tone-purple', 'tone-blue', 'tone-green', 'tone-amber'];

export default function TeamsPage({ onOpenTeam }) {
  const { users, teams, addTeam } = useWorkspace();
  const { toast, showToast } = useToast(3500);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', teamLeadId: '' });
  const [errors, setErrors] = useState({});

  const leaderCandidates = React.useMemo(
    () =>
      users
        .filter(
          (u) =>
            u.active !== false &&
            (u.systemAccess === 'team_leader' ||
              u.systemAccess === 'employee' ||
              u.systemAccess === 'account_manager'),
        )
        .sort((a, b) => String(a.fullName).localeCompare(String(b.fullName))),
    [users],
  );

  const openCreate = () => {
    setForm({ name: '', description: '', teamLeadId: '' });
    setErrors({});
    setIsCreateOpen(true);
  };

  const closeCreate = () => {
    setIsCreateOpen(false);
    setErrors({});
  };

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const createTeam = async () => {
    const name = form.name.trim();

    if (!name) {
      setErrors({ name: 'Team name is required.' });
      return;
    }

    if (teams.some((team) => team.name.toLowerCase() === name.toLowerCase())) {
      setErrors({ name: 'A team with this name already exists.' });
      return;
    }

    try {
      await addTeam({
        name,
        description: form.description,
        teamLeadId: form.teamLeadId ? Number(form.teamLeadId) : null,
      });
      closeCreate();
      showToast('Team created successfully.');
    } catch (err) {
      setErrors({ name: err?.message || 'Could not create team.' });
    }
  };

  return (
    <div className="ws-page">
      <section className="ws-page-head">
        <div>
          <span className="ws-eyebrow">Team Management</span>
          <h1 className="ws-page-title">Teams</h1>
          <p className="ws-page-sub">Organize members and assign brands to each team.</p>
        </div>

        <button type="button" className="ws-btn ws-btn--primary" onClick={openCreate}>
          <svg aria-hidden="true" className="icon">
            <use href="#i-plus" />
          </svg>
          Add Team
        </button>
      </section>

      {teams.length ? (
        <div className="ws-team-grid">
          {teams.map((team, index) => (
            <article className="ws-team-card" key={team.id}>
              <div className="ws-team-card__top">
                <span className={`ws-team-mark ${TONES[index % TONES.length]}`}>
                  {team.name.charAt(0).toUpperCase()}
                </span>
                <span className="ws-badge ws-badge--active">Active</span>
              </div>

              <h2 className="ws-team-card__name">{team.name}</h2>
              <p className="ws-team-card__text">
                {team.description?.trim() || 'No description added.'}
              </p>

              <div className="ws-team-card__leader">
                <svg aria-hidden="true" className="icon">
                  <use href="#i-user" />
                </svg>
                {team.teamLead ? (
                  <span>
                    <strong>Team leader:</strong> {team.teamLead.fullName}
                  </span>
                ) : (
                  <span className="is-muted">No team leader assigned</span>
                )}
              </div>

              <div className="ws-team-card__foot">
                <button type="button" className="ws-open-team" onClick={() => onOpenTeam(team.name)}>
                  Open Team
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-arrow" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="ws-btn ws-btn--ghost ws-btn--sm"
                  onClick={() => setEditingTeam(team)}
                >
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-users" />
                  </svg>
                  Edit Team
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="ws-empty ws-empty--panel">
          <strong>No teams yet.</strong>
          <p>Create a team to start assigning members and brands.</p>
        </div>
      )}

      <Modal
        isOpen={isCreateOpen}
        onClose={closeCreate}
        title="Add Team"
        subtitle="Create a new team for your workspace."
        icon="#i-layers"
        maxWidth="520px"
        footer={
          <>
            <button type="button" className="ws-btn ws-btn--ghost" onClick={closeCreate}>
              Cancel
            </button>
            <button type="button" className="ws-btn ws-btn--primary" onClick={createTeam}>
              Create Team
            </button>
          </>
        }
      >
        <label className={`ws-field${errors.name ? ' is-invalid' : ''}`}>
          <span>Team Name</span>
          <input
            className="ws-input"
            value={form.name}
            onChange={updateField('name')}
            placeholder="Example: Brand Strategy & Growth"
            autoFocus
          />
          {errors.name && <small className="ws-error">{errors.name}</small>}
        </label>

        <label className="ws-field">
          <span>Description</span>
          <textarea
            className="ws-textarea"
            rows={3}
            value={form.description}
            onChange={updateField('description')}
            placeholder="What does this team own?"
          />
        </label>

        <label className="ws-field">
          <span>Team Leader (Optional)</span>
          <span className="ws-select-wrap">
            <select
              className="ws-select"
              value={form.teamLeadId}
              onChange={updateField('teamLeadId')}
            >
              <option value="">No leader assigned</option>
              {leaderCandidates.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName} {user.systemAccess === 'team_leader' ? '⭐ (Team Leader)' : ''} — {user.jobTitle || user.systemAccess}
                </option>
              ))}
            </select>
            <svg aria-hidden="true" className="icon">
              <use href="#i-chevron" />
            </svg>
          </span>
        </label>
      </Modal>

      {editingTeam ? (
        <TeamMembersModal
          team={editingTeam}
          onClose={() => setEditingTeam(null)}
          onSaved={(message) => showToast(`Team updated. ${message}.`)}
        />
      ) : null}

      <Toast message={toast?.message} tone={toast?.tone} />
    </div>
  );
}
