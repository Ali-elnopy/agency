import React, { useMemo, useState } from 'react';
import Modal from '../common/Modal';
import { useWorkspace } from '../../context/workspaceStore';
import { initialsOf } from '../../data/workspace';

const ELIGIBLE_ACCESS = new Set(['employee', 'account_manager', 'team_leader']);

export default function TeamMembersModal({ team, onClose, onSaved }) {
  const { users, updateTeam, addTeamMember, removeTeamMember, setTeamLead } = useWorkspace();

  const [name, setName] = useState(team.name || '');
  const [description, setDescription] = useState(team.description || '');

  const eligible = useMemo(
    () =>
      users
        .filter((user) => user.active !== false && ELIGIBLE_ACCESS.has(user.systemAccess))
        .sort((a, b) => String(a.fullName).localeCompare(String(b.fullName))),
    [users],
  );

  const [selected, setSelected] = useState(() => {
    const current = Array.isArray(team.memberIds)
      ? team.memberIds
      : users.filter((user) => String(user.teamId) === String(team.id)).map((user) => user.id);

    return new Set(current.map((id) => String(id)));
  });

  const [leaderId, setLeaderId] = useState(
    team.teamLeadId != null ? String(team.teamLeadId) : '',
  );
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Team Leader options: users with role team_leader or any selected member
  const leaderCandidates = useMemo(
    () =>
      users
        .filter(
          (user) =>
            user.active !== false &&
            (user.systemAccess === 'team_leader' || selected.has(String(user.id))),
        )
        .sort((a, b) => String(a.fullName).localeCompare(String(b.fullName))),
    [users, selected],
  );

  const visible = eligible.filter((user) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;

    return [user.fullName, user.email, user.jobTitle]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(needle));
  });

  const currentIds = useMemo(() => {
    const current = Array.isArray(team.memberIds)
      ? team.memberIds
      : users.filter((user) => String(user.teamId) === String(team.id)).map((user) => user.id);

    return current.map((id) => String(id));
  }, [team, users]);

  const toggle = (id) => {
    const strId = String(id);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(strId)) {
        next.delete(strId);
        if (strId === leaderId) setLeaderId('');
      } else {
        next.add(strId);
      }
      return next;
    });

    setError('');
  };

  const handleLeaderChange = (newLeaderId) => {
    setLeaderId(newLeaderId);
    if (newLeaderId) {
      setSelected((prev) => new Set([...prev, String(newLeaderId)]));
    }
  };

  const handleSave = async () => {
    if (busy) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Team name cannot be empty.');
      return;
    }

    const added = eligible.filter(
      (user) => selected.has(String(user.id)) && !currentIds.includes(String(user.id)),
    );
    const removed = eligible.filter(
      (user) => !selected.has(String(user.id)) && currentIds.includes(String(user.id)),
    );
    const currentLeaderId = team.teamLeadId != null ? String(team.teamLeadId) : '';
    const nextLeaderId = leaderId ? String(leaderId) : '';

    setBusy(true);
    setError('');

    try {
      // 1. Update team basic info (name, description, leader)
      await updateTeam(team.id, {
        name: trimmedName,
        description: description.trim(),
        teamLeadId: nextLeaderId || null,
      });

      // 2. Add new members
      for (const user of added) {
        await addTeamMember(team.id, user.id);
      }

      // 3. Remove deselected members
      for (const user of removed) {
        if (String(user.id) !== nextLeaderId) {
          await removeTeamMember(team.id, user.id);
        }
      }

      onSaved?.(`Team updated successfully.`);
      onClose();
    } catch (err) {
      setError(err?.message || 'Could not update this team. Refresh and try again.');
      setBusy(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={busy ? () => {} : onClose}
      title="Edit Team"
      subtitle={`Manage team details, leader and members for ${team.name}.`}
      icon="#i-users"
      iconColor="purple"
      maxWidth="620px"
      dismissible={!busy}
      footer={
        <>
          <span className="bw-team-count">
            {selected.size} {selected.size === 1 ? 'member' : 'members'} selected
          </span>
          <button type="button" className="button button--ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className="button button--primary"
            onClick={handleSave}
            disabled={busy}
          >
            <svg aria-hidden="true" className="icon">
              <use href="#i-check" />
            </svg>
            {busy ? 'Saving…' : 'Save changes'}
          </button>
        </>
      }
    >
      <div className="bw-team-picker">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
          <div>
            <label className="form-label" htmlFor="edit-team-name" style={{ fontWeight: 600, marginBottom: '6px', display: 'block' }}>
              Team Name
            </label>
            <input
              id="edit-team-name"
              className="form-input"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Team Name"
              disabled={busy}
            />
          </div>

          <div>
            <label className="form-label" htmlFor="edit-team-desc" style={{ fontWeight: 600, marginBottom: '6px', display: 'block' }}>
              Description
            </label>
            <textarea
              id="edit-team-desc"
              className="form-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this team do?"
              disabled={busy}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="bw-leader-field" style={{ margin: 0 }}>
            <label htmlFor="team-leader" style={{ fontWeight: 600, marginBottom: '6px', display: 'block' }}>
              Team Leader <span style={{ fontWeight: 400, opacity: 0.7 }}>(Optional)</span>
            </label>
            <span className="form-select-wrap">
              <select
                id="team-leader"
                className="form-select"
                value={leaderId}
                onChange={(event) => handleLeaderChange(event.target.value)}
                disabled={busy}
              >
                <option value="">No leader assigned</option>
                {leaderCandidates.map((user) => (
                  <option key={user.id} value={String(user.id)}>
                    {user.fullName} {user.systemAccess === 'team_leader' ? '⭐ (Team Leader)' : ''} — {user.jobTitle || user.systemAccess}
                  </option>
                ))}
              </select>
              <svg aria-hidden="true" className="icon">
                <use href="#i-chevron" />
              </svg>
            </span>
            <small className="bw-hint" style={{ marginTop: '4px', display: 'block' }}>
              The Team Leader is responsible for this team’s members, tasks, and deliverables.
            </small>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border, rgba(255,255,255,0.08))', paddingTop: '16px', marginTop: '12px' }}>
          <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>
            Manage Team Members
          </label>

          <label className="search bw-team-search" style={{ marginBottom: '12px' }}>
            <input
              type="search"
              placeholder="Search people by name, email or role…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search team members"
            />
            <svg aria-hidden="true" className="icon">
              <use href="#i-search" />
            </svg>
          </label>

          {error ? <div className="modal-error bw-error" style={{ marginBottom: '12px' }}>{error}</div> : null}

          {visible.length ? (
            <ul className="bw-team-list" style={{ maxHeight: '220px', overflowY: 'auto' }}>
              {visible.map((user) => {
                const checked = selected.has(String(user.id));
                const isLeader = String(user.id) === leaderId;

                return (
                  <li key={user.id}>
                    <button
                      type="button"
                      className={`bw-team-row${checked ? ' is-selected' : ''}`}
                      onClick={() => toggle(user.id)}
                      aria-pressed={checked}
                      disabled={busy}
                    >
                      <span className="bw-team-avatar">{initialsOf(user.fullName)}</span>
                      <span className="bw-team-copy">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong>{user.fullName}</strong>
                          {isLeader && (
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '1px 7px',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                borderRadius: '4px',
                                background: 'rgba(59, 130, 246, 0.18)',
                                color: '#60a5fa',
                                border: '1px solid rgba(59, 130, 246, 0.35)',
                              }}
                            >
                              Team Leader
                            </span>
                          )}
                        </div>
                        <small>
                          {user.jobTitle || user.systemAccess}
                          {user.teamName ? ` · ${user.teamName}` : ''}
                        </small>
                        <small>{user.email}</small>
                      </span>
                      <span className={`bw-check${checked ? ' is-checked' : ''}`} aria-hidden="true">
                        {checked ? (
                          <svg aria-hidden="true" className="icon">
                            <use href="#i-check" />
                          </svg>
                        ) : null}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="bw-empty">
              <strong>No eligible people found.</strong>
              <p>Only active employees, managers, and team leaders can join a team.</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
