import React, { useMemo, useState } from 'react';
import Modal from '../common/Modal';
import { useWorkspace } from '../../context/workspaceStore';
import { initialsOf } from '../../data/workspace';

export default function EditTeamModal({ brand, selectedIds, onClose, onSave }) {
  const { users } = useWorkspace();
  const [selected, setSelected] = useState(() => new Set(selectedIds));
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return users
      .filter((user) => user.active !== false)
      .filter((user) => {
        if (!needle) return true;
        return [user.fullName, user.email, user.jobTitle]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(needle));
      })
      .sort((a, b) => String(a.fullName).localeCompare(String(b.fullName)));
  }, [users, query]);

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Edit Team"
      subtitle={`Choose who works on ${brand?.name ?? 'this brand'}.`}
      icon="#i-users"
      iconColor="purple"
      maxWidth="560px"
      footer={
        <>
          <span className="bw-team-count">
            {selected.size} {selected.size === 1 ? 'member' : 'members'} selected
          </span>
          <button type="button" className="button button--ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="button button--primary"
            onClick={() => onSave(Array.from(selected))}
          >
            <svg aria-hidden="true" className="icon">
              <use href="#i-check" />
            </svg>
            Save team
          </button>
        </>
      }
    >
      <div className="bw-team-picker">
        <label className="search bw-team-search">
          <input
            type="search"
            placeholder="Search the directory by name, email or role…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search team members"
          />
          <svg aria-hidden="true" className="icon">
            <use href="#i-search" />
          </svg>
        </label>

        {visible.length ? (
          <ul className="bw-team-list">
            {visible.map((user) => {
              const checked = selected.has(user.id);

              return (
                <li key={user.id}>
                  <button
                    type="button"
                    className={`bw-team-row${checked ? ' is-selected' : ''}`}
                    onClick={() => toggle(user.id)}
                    aria-pressed={checked}
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
            <strong>No people match that search.</strong>
            <p>Try another name, email or job title.</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
