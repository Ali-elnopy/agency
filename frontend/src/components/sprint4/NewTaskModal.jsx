import React, { useState } from 'react';
import { useSprint3 } from '../../context/sprint3Store';
import { useBrands } from '../../context/brandsStore';
import { useWorkspace } from '../../context/workspaceStore';

export default function NewTaskModal({ isOpen, onClose }) {
  const { addTask, t } = useSprint3();
  const { brands } = useBrands();
  const { users } = useWorkspace();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [brandId, setBrandId] = useState(brands[0]?.id || '1');
  const [assigneeId, setAssigneeId] = useState(users[0]?.id || '160');
  const [priority, setPriority] = useState('medium');
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const brand = brands.find((b) => String(b.id) === String(brandId));
    const assignee = users.find((u) => String(u.id) === String(assigneeId));

    addTask({
      title: title.trim(),
      description: description.trim(),
      brandId: String(brandId),
      brandName: brand?.name || 'Nike',
      assigneeId: String(assigneeId),
      assigneeName: assignee?.fullName || 'Sarah Lin',
      assigneeRole: assignee?.jobTitle || 'Content Creator',
      priority,
      deadline,
      status: 'todo',
    });

    onClose();
  };

  return (
    <div className="s3-modal-backdrop" onClick={onClose}>
      <div
        className="s3-modal task-create-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <header className="s3-modal__head">
          <h2 className="s3-modal__title">{t('New Task')}</h2>
          <button type="button" className="s3-modal__close" onClick={onClose}>✕</button>
        </header>

        <form onSubmit={handleSubmit} className="task-create-form">
          <label className="s3-field">
            <span className="s3-field__label">{t('Task Title')}</span>
            <input
              type="text"
              required
              className="s3-input"
              placeholder={t('Task Title')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <label className="s3-field">
            <span className="s3-field__label">{t('Task Description')}</span>
            <textarea
              className="s3-input"
              rows={3}
              placeholder={t('Task Description')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <div className="task-create-grid">
            <label className="s3-field">
              <span className="s3-field__label">{t('Brand')}</span>
              <select
                className="s3-select"
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {t(b.name)}
                  </option>
                ))}
              </select>
            </label>

            <label className="s3-field">
              <span className="s3-field__label">{t('Assigned To')}</span>
              <select
                className="s3-select"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              >
                {users
                  .filter((u) => u.systemAccess === 'employee' || u.jobTitle?.includes('Creator') || u.jobTitle?.includes('Editor') || u.jobTitle?.includes('Designer'))
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {t(u.fullName)} ({t(u.jobTitle)})
                    </option>
                  ))}
              </select>
            </label>

            <label className="s3-field">
              <span className="s3-field__label">{t('Priority')}</span>
              <select
                className="s3-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="high">{t('High')}</option>
                <option value="medium">{t('Medium')}</option>
                <option value="low">{t('Low')}</option>
              </select>
            </label>

            <label className="s3-field">
              <span className="s3-field__label">{t('Deadline')}</span>
              <input
                type="date"
                required
                className="s3-input"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </label>
          </div>

          <footer className="s3-modal__foot">
            <button type="button" className="button button--ghost" onClick={onClose}>
              {t('Cancel')}
            </button>
            <button type="submit" className="button button--primary">
              <svg aria-hidden="true" className="icon"><use href="#i-plus" /></svg>
              {t('Create Task')}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
