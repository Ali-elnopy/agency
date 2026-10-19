import React, { useState } from 'react';
import Modal from '../common/Modal';

const GOVERNANCE_LEVELS = [
  'Full Control',
  'Review & Approve',
  'Edit & Draft',
  'External Sign-off',
];

const COLOR_OPTIONS = [
  { id: 'orange', label: 'Orange', bgClass: 'c-orange' },
  { id: 'purple', label: 'Purple', bgClass: 'c-purple' },
  { id: 'green', label: 'Green', bgClass: 'c-green' },
  { id: 'amber', label: 'Amber', bgClass: 'c-amber' },
  { id: 'gray', label: 'Gray', bgClass: 'c-gray' },
];

const AVAILABLE_PERMISSIONS = [
  'All Workspaces',
  'Brand Assets',
  'Approve & Publish',
  'Stage Gate Sign-off',
  'Assignments',
  'Submit for Review',
  'Audit Log',
  'Client Portal Only',
];

export default function NewRoleModal({ isOpen, onClose, onAddRole }) {
  const [title, setTitle] = useState('');
  const [badge, setBadge] = useState('Review & Approve');
  const [color, setColor] = useState('orange');
  const [text, setText] = useState('');
  const [selectedTags, setSelectedTags] = useState(['Brand Assets', 'Stage Gate Sign-off']);
  const [memberCount, setMemberCount] = useState(1);
  const [error, setError] = useState('');

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a role title.');
      return;
    }

    const newRole = {
      id: `role_${Date.now()}`,
      title: title.trim(),
      badge,
      color,
      icon: color === 'purple' ? '#i-eye' : color === 'green' ? '#i-file' : '#i-target',
      text:
        text.trim() ||
        'Configured studio permissions and workspace access rights for this team seat.',
      tags: selectedTags.length > 0 ? selectedTags : ['Standard Access'],
      members: `${memberCount} ${memberCount === 1 ? 'Member' : 'Members'}`,
    };

    onAddRole(newRole);
    // Reset form
    setTitle('');
    setText('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Studio Role"
      subtitle="Define access privileges, governance levels, and workspace capabilities."
      icon="#i-users"
      iconColor={color}
      maxWidth="560px"
      footer={
        <>
          <button type="button" className="button button--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="button button--primary" onClick={handleSubmit}>
            <svg className="icon">
              <use href="#i-plus" />
            </svg>
            Create Role
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(229, 72, 77, 0.12)',
              border: '1px solid rgba(229, 72, 77, 0.3)',
              color: 'var(--red)',
              fontSize: '13px',
            }}
          >
            {error}
          </div>
        )}

        {/* Role Title */}
        <div className="modal-field">
          <label className="modal-label" htmlFor="role-title">
            ROLE TITLE <small>Required</small>
          </label>
          <input
            id="role-title"
            className="modal-input"
            type="text"
            placeholder="e.g. Creative Producer, Motion Lead, Brand Strategist"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError('');
            }}
            autoFocus
          />
        </div>

        {/* Governance Level */}
        <div className="modal-field">
          <label className="modal-label">GOVERNANCE LEVEL</label>
          <div className="modal-chips">
            {GOVERNANCE_LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                className={`modal-chip-btn ${badge === level ? 'is-selected' : ''}`}
                onClick={() => setBadge(level)}
              >
                {badge === level && (
                  <svg className="icon" viewBox="0 0 24 24" width="12" height="12">
                    <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.5" />
                  </svg>
                )}
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Accent Color */}
        <div className="modal-field">
          <label className="modal-label">THEME ACCENT COLOR</label>
          <div className="modal-color-picker">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`modal-color-dot ${c.bgClass} ${color === c.id ? 'is-active' : ''}`}
                onClick={() => setColor(c.id)}
                title={c.label}
                aria-label={c.label}
              />
            ))}
            <span style={{ fontSize: '12px', color: 'var(--muted)', marginLeft: '8px', textTransform: 'capitalize' }}>
              {color} Accent
            </span>
          </div>
        </div>

        {/* Role Responsibilities */}
        <div className="modal-field">
          <label className="modal-label" htmlFor="role-text">
            ROLE RESPONSIBILITIES &amp; SCOPE
          </label>
          <textarea
            id="role-text"
            className="modal-textarea"
            placeholder="Describe what members with this role can execute (e.g. Total asset approval flows, campaign scheduling, and client review gatekeeper)."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
          />
        </div>

        {/* Workspace Permissions */}
        <div className="modal-field">
          <label className="modal-label">
            ASSIGNED PERMISSIONS <small>Select applicable tags</small>
          </label>
          <div className="modal-chips">
            {AVAILABLE_PERMISSIONS.map((perm) => (
              <button
                key={perm}
                type="button"
                className={`modal-chip-btn ${selectedTags.includes(perm) ? 'is-selected' : ''}`}
                onClick={() => toggleTag(perm)}
              >
                {selectedTags.includes(perm) ? '✓ ' : '+ '}
                {perm}
              </button>
            ))}
          </div>
        </div>

        {/* Initial Assigned Members */}
        <div className="modal-field">
          <label className="modal-label" htmlFor="member-count">
            INITIAL SEATS / MEMBERS
          </label>
          <input
            id="member-count"
            className="modal-input"
            type="number"
            min="1"
            max="100"
            value={memberCount}
            onChange={(e) => setMemberCount(Math.max(1, parseInt(e.target.value) || 1))}
            style={{ width: '120px' }}
          />
        </div>
      </form>
    </Modal>
  );
}
