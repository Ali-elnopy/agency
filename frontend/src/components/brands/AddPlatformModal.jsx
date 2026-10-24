import React, { useState } from 'react';
import Modal from '../common/Modal';
import {
  CONTENT_KINDS,
  PLATFORM_PRESETS,
  platformShort,
  platformTone,
} from '../../data/brandWorkspace';

const CUSTOM = '__custom';

export default function AddPlatformModal({ brand, platform, onClose, onSave }) {
  const editing = Boolean(platform);

  const [preset, setPreset] = useState(() => {
    if (!platform) return PLATFORM_PRESETS[0].name;
    return PLATFORM_PRESETS.some((item) => item.name === platform.name)
      ? platform.name
      : CUSTOM;
  });
  const [name, setName] = useState(platform?.name ?? PLATFORM_PRESETS[0].name);
  const [handle, setHandle] = useState(platform?.handle ?? '');
  const [url, setUrl] = useState(platform?.url ?? '');
  const [goal, setGoal] = useState(platform?.goal ?? '');
  const [monthlyTarget, setMonthlyTarget] = useState(platform?.monthlyTarget ?? 12);
  const [contentTypes, setContentTypes] = useState(platform?.contentTypes ?? []);
  const [notes, setNotes] = useState(platform?.notes ?? '');
  const [error, setError] = useState('');

  const toggleType = (type) => {
    setContentTypes((prev) =>
      prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type],
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setError('Choose or type a platform name.');
      return;
    }

    onSave({
      name: name.trim(),
      short: platformShort(name),
      tone: platformTone(name),
      handle: handle.trim(),
      url: url.trim(),
      goal: goal.trim(),
      monthlyTarget: Math.max(0, Number(monthlyTarget) || 0),
      contentTypes,
      notes: notes.trim(),
    });
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={editing ? 'Edit platform' : 'Add social platform'}
      subtitle={`${brand?.name ?? 'This brand'} · goals, targets and content types.`}
      icon="#i-globe"
      iconColor="purple"
      maxWidth="560px"
      footer={
        <>
          <button type="button" className="button button--ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            form="brand-platform-form"
            className="button button--primary"
          >
            <svg aria-hidden="true" className="icon">
              <use href="#i-check" />
            </svg>
            {editing ? 'Save platform' : 'Add platform'}
          </button>
        </>
      }
    >
      <form id="brand-platform-form" className="modal-form" onSubmit={handleSubmit}>
        <div className="modal-field">
          <label className="modal-label" htmlFor="platform-preset">
            Platform
          </label>
          <span className="form-select-wrap">
            <select
              id="platform-preset"
              className="modal-input"
              value={preset}
              onChange={(event) => {
                const next = event.target.value;
                setPreset(next);
                if (next !== CUSTOM) setName(next);
                else setName('');
                setError('');
              }}
            >
              {PLATFORM_PRESETS.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              ))}
              <option value={CUSTOM}>Other platform…</option>
            </select>
            <svg aria-hidden="true" className="icon">
              <use href="#i-chevron" />
            </svg>
          </span>
        </div>

        {preset === CUSTOM ? (
          <div className="modal-field">
            <label className="modal-label" htmlFor="platform-name">
              Platform name
            </label>
            <input
              id="platform-name"
              className="modal-input"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError('');
              }}
              placeholder="e.g. Telegram"
            />
          </div>
        ) : null}

        <div className="modal-grid">
          <div className="modal-field">
            <label className="modal-label" htmlFor="platform-handle">
              Handle / account
            </label>
            <input
              id="platform-handle"
              className="modal-input"
              value={handle}
              onChange={(event) => setHandle(event.target.value)}
              placeholder="@brand"
            />
          </div>
          <div className="modal-field">
            <label className="modal-label" htmlFor="platform-url">
              Profile URL
            </label>
            <input
              id="platform-url"
              type="url"
              className="modal-input"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://instagram.com/brand"
            />
          </div>
        </div>

        <div className="modal-field">
          <label className="modal-label" htmlFor="platform-goal">
            Platform goal
          </label>
          <textarea
            id="platform-goal"
            className="modal-input modal-textarea"
            rows={3}
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            placeholder="What this platform should achieve for the brand…"
          />
        </div>

        <div className="modal-field">
          <label className="modal-label" htmlFor="platform-target">
            Content pieces required per month
          </label>
          <input
            id="platform-target"
            type="number"
            min="0"
            max="200"
            className="modal-input"
            value={monthlyTarget}
            onChange={(event) => setMonthlyTarget(event.target.value)}
          />
        </div>

        <div className="modal-field">
          <span className="modal-label">Content types</span>
          <div className="bw-check-chips">
            {CONTENT_KINDS.map((type) => (
              <button
                key={type}
                type="button"
                className={`bw-check-chip${contentTypes.includes(type) ? ' is-checked' : ''}`}
                onClick={() => toggleType(type)}
                aria-pressed={contentTypes.includes(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-field">
          <label className="modal-label" htmlFor="platform-notes">
            Notes
          </label>
          <textarea
            id="platform-notes"
            className="modal-input modal-textarea"
            rows={2}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Publishing cadence, approval rules, anything the team should know…"
          />
        </div>

        {error ? <div className="modal-error">{error}</div> : null}
      </form>
    </Modal>
  );
}
