import React, { useState } from 'react';
import Modal from '../common/Modal';

const BRANDS = ['Lumina Health', 'Kinetic Motion', 'Aura Mobility', 'Vortex Digital', 'Nebula Studios'];

const DELIVERABLE_TYPES = [
  'Motion & 3D Video',
  'Brand Refresh Deck',
  'Social Carousel Assets',
  'Campaign Key Visuals',
  'Digital Ad Set (Display & Video)',
];

const PRIORITIES = [
  { id: 'normal', label: 'Normal', color: 'green' },
  { id: 'high', label: 'High Priority', color: 'orange' },
  { id: 'urgent', label: 'Urgent / Critical', color: 'amber' },
];

export default function NewBriefModal({ isOpen, onClose, onAddBrief }) {
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('Lumina Health');
  const [deliverable, setDeliverable] = useState('Motion & 3D Video');
  const [priority, setPriority] = useState('high');
  const [dueDate, setDueDate] = useState('');
  const [objective, setObjective] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a campaign brief title.');
      return;
    }

    const newBrief = {
      id: `brief_${Date.now()}`,
      title: title.trim(),
      brand,
      deliverable,
      priority,
      dueDate: dueDate || 'End of Q4',
      objective: objective.trim() || 'Accelerate production workflow and client approvals.',
      createdAt: 'Just now',
    };

    onAddBrief(newBrief);
    // Reset form
    setTitle('');
    setObjective('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Creative Brief"
      subtitle="Launch a new campaign asset brief across brands and creative teams."
      icon="#i-file"
      iconColor="orange"
      maxWidth="560px"
      footer={
        <>
          <button type="button" className="button button--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="button button--primary" onClick={handleSubmit}>
            <svg className="icon">
              <use href="#i-send" />
            </svg>
            Launch Brief
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

        {/* Brief Title */}
        <div className="modal-field">
          <label className="modal-label" htmlFor="brief-title">
            BRIEF TITLE <small>Required</small>
          </label>
          <input
            id="brief-title"
            className="modal-input"
            type="text"
            placeholder="e.g. Q4 Global Brand Relaunch Hero Motion"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError('');
            }}
            autoFocus
          />
        </div>

        {/* Brand & Deliverable Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div className="modal-field">
            <label className="modal-label" htmlFor="brief-brand">
              BRAND PARTNER
            </label>
            <select
              id="brief-brand"
              className="modal-select"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            >
              {BRANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-field">
            <label className="modal-label" htmlFor="brief-deliverable">
              DELIVERABLE TYPE
            </label>
            <select
              id="brief-deliverable"
              className="modal-select"
              value={deliverable}
              onChange={(e) => setDeliverable(e.target.value)}
            >
              {DELIVERABLE_TYPES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Priority */}
        <div className="modal-field">
          <label className="modal-label">PRODUCTION PRIORITY</label>
          <div className="modal-chips">
            {PRIORITIES.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`modal-chip-btn ${priority === p.id ? 'is-selected' : ''}`}
                onClick={() => setPriority(p.id)}
              >
                <span className={`pill is-${p.color}`} style={{ padding: '2px 6px', fontSize: '10px' }}>
                  {p.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Due Date */}
        <div className="modal-field">
          <label className="modal-label" htmlFor="brief-date">
            TARGET DELIVERY DATE
          </label>
          <input
            id="brief-date"
            className="modal-input"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        {/* Objectives */}
        <div className="modal-field">
          <label className="modal-label" htmlFor="brief-objective">
            CREATIVE SCOPE &amp; OBJECTIVES
          </label>
          <textarea
            id="brief-objective"
            className="modal-textarea"
            placeholder="Outline strategic goals, target audience, deliverables checklist, and brand compliance guidelines."
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            rows={3}
          />
        </div>
      </form>
    </Modal>
  );
}
