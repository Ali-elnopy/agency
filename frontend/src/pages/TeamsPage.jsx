import React, { useState } from 'react';
import Modal from '../components/common/Modal';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';
import { useWorkspace } from '../context/workspaceStore';

const TONES = ['tone-orange', 'tone-purple', 'tone-blue', 'tone-green', 'tone-amber'];

export default function TeamsPage({ onOpenTeam }) {
  const { teams, addTeam } = useWorkspace();
  const { toast, showToast } = useToast(3500);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [errors, setErrors] = useState({});

  const openCreate = () => {
    setForm({ name: '', description: '' });
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

  const createTeam = () => {
    const name = form.name.trim();

    if (!name) {
      setErrors({ name: 'Team name is required.' });
      return;
    }

    if (teams.some((team) => team.name.toLowerCase() === name.toLowerCase())) {
      setErrors({ name: 'A team with this name already exists.' });
      return;
    }

    addTeam({ name, description: form.description });
    closeCreate();
    showToast('Team created successfully.');
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

              <div className="ws-team-card__foot">
                <button type="button" className="ws-open-team" onClick={() => onOpenTeam(team.name)}>
                  Open Team
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-arrow" />
                  </svg>
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
            rows={4}
            value={form.description}
            onChange={updateField('description')}
            placeholder="What does this team own?"
          />
        </label>
      </Modal>

      <Toast message={toast?.message} tone={toast?.tone} />
    </div>
  );
}
