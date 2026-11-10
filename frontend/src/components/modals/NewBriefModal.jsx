import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useSprint3 } from '../../context/sprint3Store';

const BRANDS = [
  'Lumina Health',
  'Kinetic Motion',
  'Aura Mobility',
  'Vortex Digital',
  'Nebula Studios',
];

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
  const { t } = useSprint3();
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
      setError(t('Please provide a campaign brief title.'));
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
      title={t('Create Creative Brief')}
      subtitle={t('Launch a new campaign asset brief across brands and creative teams.')}
      icon="#i-file"
      iconColor="orange"
      maxWidth="560px"
      footer={
        <>
          <button type="button" className="button button--ghost" onClick={onClose}>
            {t('Cancel')}
          </button>
          <button type="button" className="button button--primary" onClick={handleSubmit}>
            <svg aria-hidden="true" className="icon">
              <use href="#i-send" />
            </svg>
            {t('Launch Brief')}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="modal-form">
        {error && <div className="modal-error">{error}</div>}

        {/* Brief Title */}
        <div className="modal-field">
          <label className="modal-label" htmlFor="brief-title">
            {t('Brief Title')} <small>{t('Required')}</small>
          </label>
          <input
            id="brief-title"
            className="modal-input"
            type="text"
            placeholder={t('e.g. Q4 Global Brand Relaunch Hero Motion')}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError('');
            }}
            autoFocus
          />
        </div>

        {/* Brand & Deliverable Row */}
        <div className="modal-grid">
          <div className="modal-field">
            <label className="modal-label" htmlFor="brief-brand">
              {t('Brand Partner')}
            </label>
            <select
              id="brief-brand"
              className="modal-select"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            >
              {BRANDS.map((b) => (
                <option key={b} value={b}>
                  {t(b)}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-field">
            <label className="modal-label" htmlFor="brief-deliverable">
              {t('Deliverable Type')}
            </label>
            <select
              id="brief-deliverable"
              className="modal-select"
              value={deliverable}
              onChange={(e) => setDeliverable(e.target.value)}
            >
              {DELIVERABLE_TYPES.map((d) => (
                <option key={d} value={d}>
                  {t(d)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Priority */}
        <div className="modal-field">
          <label className="modal-label">{t('Production Priority')}</label>
          <div className="modal-chips">
            {PRIORITIES.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`modal-chip-btn ${priority === p.id ? 'is-selected' : ''}`}
                onClick={() => setPriority(p.id)}
              >
                <span className={`pill is-${p.color} pill--compact`}>{t(p.label)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Due Date */}
        <div className="modal-field">
          <label className="modal-label" htmlFor="brief-date">
            {t('Target Delivery Date')}
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
            {t('Creative Scope & Objectives')}
          </label>
          <textarea
            id="brief-objective"
            className="modal-textarea"
            placeholder={t('Outline strategic goals, target audience, deliverables checklist, and brand compliance guidelines.')}
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            rows={3}
          />
        </div>
      </form>
    </Modal>
  );
}
