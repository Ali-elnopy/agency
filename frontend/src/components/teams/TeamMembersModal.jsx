import React, { useMemo, useState } from 'react';
import Modal from '../common/Modal';
import { useWorkspace } from '../../context/workspaceStore';
import { initialsOf } from '../../data/workspace';

/* Team membership editor. Lives on the Teams screens only — brands show the
   team they are assigned to, but membership is managed here. */

const ELIGIBLE_ACCESS = new Set(['employee', 'account_manager']);

export default function TeamMembersModal({ team, onClose, onSaved }) {
  const { users, addTeamMember, removeTeamMember, setTeamLead } = useWorkspace();

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
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(String(id))) next.delete(String(id));
      else next.add(String(id));
      return next;
    });

    if (String(id) === leaderId) setLeaderId('');
    setError('');
  };

  const handleSave = async () => {
    if (busy) return;

    const added = eligible.filter(
      (user) => selected.has(String(user.id)) && !currentIds.includes(String(user.id)),
    );
    const removed = eligible.filter(
      (user) => !selected.has(String(user.id)) && currentIds.includes(String(user.id)),
    );
    const currentLeaderId = team.teamLeadId != null ? String(team.teamLeadId) : '';
    const nextLeaderId = selected.has(leaderId) ? leaderId : '';

    setBusy(true);
    setError('');

    try {
      // The API refuses to remove a team leader, so clear the role first when
      // the current leader is being taken out of the team.
      if (currentLeaderId && !selected.has(currentLeaderId)) {
        await setTeamLead(team.id, null);
      }

      for (const user of added) {
        await addTeamMember(team.id, user.id);
      }

      for (const user of removed) {
        await removeTeamMember(team.id, user.id);
      }

      if (nextLeaderId !== currentLeaderId) {
        await setTeamLead(team.id, nextLeaderId || null);
      }

      onSaved?.(
        `${added.length} added, ${removed.length} removed${
          nextLeaderId !== currentLeaderId ? ', leader updated' : ''
        }`,
      );
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
      subtitle={`Manage the members of ${team.name}.`}
      icon="#i-users"
      iconColor="purple"
      maxWidth="560px"
      dismissible={!busy}
      footer={
        <>
          <span className="bw-team-count">
            {selected.size} {selected.size === 1 ? 'member' : 'members'} selected
          </span>
          <button type="button" className="button button--ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="button button--primary" onClick={handleSave} disabled={busy}>
            <svg aria-hidden="true" className="icon">
              <use href="#i-check" />
            </svg>
            {busy ? 'Saving…' : 'Save team'}
          </button>
        </>
      }
    >
      <div className="bw-team-picker">
        <div className="bw-leader-field">
          <label htmlFor="team-leader">
            Team leader <span>optional</span>
          </label>
          <span className="form-select-wrap">
            <select
              id="team-leader"
              className="form-select"
              value={leaderId}
              onChange={(event) => setLeaderId(event.target.value)}
              disabled={busy}
            >
              <option value="">No leader</option>
              {eligible
                .filter((user) => selected.has(String(user.id)))
                .map((user) => (
                  <option key={user.id} value={String(user.id)}>
                    {user.fullName} — {user.jobTitle || user.systemAccess}
                  </option>
                ))}
            </select>
            <svg aria-hidden="true" className="icon">
              <use href="#i-chevron" />
            </svg>
          </span>
          <small className="bw-hint">
            The leader is responsible for this team only. A team can work without a leader.
          </small>
        </div>

        <label className="search bw-team-search">
          <input
            type="search"
            placeholder="Search by name, email or role…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search team members"
          />
          <svg aria-hidden="true" className="icon">
            <use href="#i-search" />
          </svg>
        </label>

        {error ? <div className="modal-error bw-error">{error}</div> : null}

        {visible.length ? (
          <ul className="bw-team-list">
            {visible.map((user) => {
              const checked = selected.has(String(user.id));

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
                      <strong>{user.fullName}</strong>
                      <small>
                        {user.jobTitle || 'No job title'}
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
            <p>Only active employees and account managers can join a team.</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
