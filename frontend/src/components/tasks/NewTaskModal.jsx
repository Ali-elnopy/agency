import React, { useState } from 'react';
import { useSprint3 } from '../../context/sprint3Store';
import { useBrands } from '../../context/brandsStore';
import { REGISTERED_EMPLOYEES, TASK_PRIORITIES } from '../../data/tasksData';

export default function NewTaskModal({ isOpen, onClose, onCreated }) {
  const { addTask, t } = useSprint3();
  const { brands = [] } = useBrands();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [brandId, setBrandId] = useState(brands[0]?.id || '1');
  const [contentTitle, setContentTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [assigneeId, setAssigneeId] = useState(REGISTERED_EMPLOYEES[0].id);

  // Default deadline: 2 days from now at 17:00
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 2);
  defaultDate.setHours(17, 0, 0, 0);
  const pad = (n) => String(n).padStart(2, '0');
  const defaultIso = `${defaultDate.getFullYear()}-${pad(defaultDate.getMonth() + 1)}-${pad(defaultDate.getDate())}T${pad(defaultDate.getHours())}:${pad(defaultDate.getMinutes())}`;
  const [deadline, setDeadline] = useState(defaultIso);

  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(t('Task Name') + ' ' + t('is-req'));
      return;
    }

    const selectedBrand = brands.find((b) => String(b.id) === String(brandId));
    const selectedEmp = REGISTERED_EMPLOYEES.find((emp) => emp.id === assigneeId);

    const created = addTask({
      title: title.trim(),
      description: description.trim(),
      brandId: String(brandId),
      brandName: selectedBrand?.name || 'Nike',
      contentTitle: contentTitle.trim() || title.trim(),
      priority,
      deadline: new Date(deadline).toISOString(),
      assigneeId: selectedEmp?.id || 'emp-1',
      assigneeName: selectedEmp?.name || 'Sarah Lin',
      assigneeRole: selectedEmp?.role || 'Content Creator',
      assigneeAvatar: selectedEmp?.avatar || 'SL',
      status: 'to_do',
    });

    if (onCreated) onCreated(created);
    onClose();
  };

  return (
    <div className="s3-modal-backdrop" onClick={onClose}>
      <div className="s3-modal" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
        <header className="s3-modal__head">
          <div className="s3-modal__title-group">
            <span className="s3-eyebrow">{t('Executive Tasks')}</span>
            <h2>{t('New Task')}</h2>
          </div>
          <button type="button" className="s3-modal-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <form onSubmit={handleSubmit} className="s3-modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && <div className="form__error">{error}</div>}

          <div className="form-field">
            <label className="is-req"><strong>{t('Task Name')}</strong></label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(''); }}
              placeholder={t('e.g. Design Q1 Launch Reel for Instagram')}
              required
            />
          </div>

          <div className="form-field">
            <label><strong>{t('Description')}</strong></label>
            <textarea
              className="form-textarea"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('Creative guidelines, specs, references, and delivery formats...')}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-field">
              <label><strong>{t('Brand')}</strong></label>
              <select
                className="form-input"
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label><strong>{t('Priority')}</strong></label>
              <select
                className="form-input"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                {TASK_PRIORITIES.map((p) => (
                  <option key={p.id} value={p.id}>{t(p.label)}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-field">
              <label><strong>{t('Assign to Employee')}</strong></label>
              <select
                className="form-input"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              >
                {REGISTERED_EMPLOYEES.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({t(emp.role)})</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label className="is-req"><strong>{t('Deadline')}</strong></label>
              <input
                type="datetime-local"
                className="form-input"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label><strong>{t('Associated Content Item')} ({t('Optional link to content item')})</strong></label>
            <input
              type="text"
              className="form-input"
              value={contentTitle}
              onChange={(e) => setContentTitle(e.target.value)}
              placeholder={t('e.g. Spring Reveal Video')}
            />
          </div>

          <footer className="s3-modal__foot" style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="button button--ghost" onClick={onClose}>
              {t('Close')}
            </button>
            <button type="submit" className="button button--primary">
              <svg aria-hidden="true" className="icon" width="16" height="16">
                <use href="#i-plus" />
              </svg>
              {t('Create Task')}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
