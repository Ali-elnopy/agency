import React, { useMemo, useState } from 'react';
import Modal from '../common/Modal';
import { monthLabel } from '../../data/brands';

export default function PlanModal({
  brand,
  initialMonth,
  plans = [],
  onClose,
  onSave,
}) {
  const [month, setMonth] = useState(initialMonth);
  const [postsTarget, setPostsTarget] = useState(
    () => plans.find((plan) => plan.month === initialMonth)?.postsTarget ?? 8,
  );
  const [reelsTarget, setReelsTarget] = useState(
    () => plans.find((plan) => plan.month === initialMonth)?.reelsTarget ?? 4,
  );
  const [error, setError] = useState('');

  const existingPlan = useMemo(
    () => plans.find((plan) => plan.month === month) ?? null,
    [plans, month],
  );

  const handleMonthChange = (event) => {
    const nextMonth = event.target.value;
    const nextPlan = plans.find((plan) => plan.month === nextMonth);

    setMonth(nextMonth);
    setPostsTarget(nextPlan?.postsTarget ?? 8);
    setReelsTarget(nextPlan?.reelsTarget ?? 4);
    setError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!month) {
      setError('Choose a month for this plan.');
      return;
    }

    const posts = Number(postsTarget);
    const reels = Number(reelsTarget);

    if (!Number.isFinite(posts) || !Number.isFinite(reels) || posts < 0 || reels < 0) {
      setError('Targets must be zero or a positive number.');
      return;
    }

    if (posts + reels === 0) {
      setError('Set at least one post or reel target.');
      return;
    }

    onSave({
      month,
      postsTarget: Math.round(posts),
      reelsTarget: Math.round(reels),
    });
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={existingPlan ? 'Update Monthly Plan' : 'Create Monthly Plan'}
      subtitle={`Set the content targets for ${brand?.name || 'this brand'}.`}
      icon="#i-calendar"
      iconColor="purple"
      maxWidth="500px"
      footer={
        <>
          <button type="button" className="button button--ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            form="brand-plan-form"
            className="button button--primary"
          >
            <svg aria-hidden="true" className="icon">
              <use href="#i-target" />
            </svg>
            {existingPlan ? 'Update Plan' : 'Create Plan'}
          </button>
        </>
      }
    >
      <form id="brand-plan-form" className="modal-form" onSubmit={handleSubmit}>
        <div className="modal-field">
          <label className="modal-label" htmlFor="plan-month">
            Monthly Plan
          </label>
          <input
            id="plan-month"
            type="month"
            className="modal-input"
            value={month}
            onChange={handleMonthChange}
          />
          <span className="form-hint">{monthLabel(month)}</span>
        </div>

        <div className="modal-grid">
          <div className="modal-field">
            <label className="modal-label" htmlFor="plan-posts">
              Posts Target
            </label>
            <input
              id="plan-posts"
              type="number"
              min="0"
              max="200"
              className="modal-input"
              value={postsTarget}
              onChange={(event) => {
                setPostsTarget(event.target.value);
                setError('');
              }}
            />
          </div>

          <div className="modal-field">
            <label className="modal-label" htmlFor="plan-reels">
              Reels Target
            </label>
            <input
              id="plan-reels"
              type="number"
              min="0"
              max="200"
              className="modal-input"
              value={reelsTarget}
              onChange={(event) => {
                setReelsTarget(event.target.value);
                setError('');
              }}
            />
          </div>
        </div>

        <div className="modal-info-card">
          <div className="modal-info-card__title">
            {Number(postsTarget || 0) + Number(reelsTarget || 0)} total deliverables
          </div>
          <p className="modal-info-card__text">
            Targets are used to calculate content added, still owed, delayed content and plan
            completion for the month.
          </p>
        </div>

        {error ? <div className="modal-error">{error}</div> : null}
      </form>
    </Modal>
  );
}
