import React, { useState } from 'react';
import { useBrands } from '../../context/brandsStore';
import useAuth from '../../hooks/useAuth';
import {
  STRATEGY_STATUS_LABEL,
  STRATEGY_STATUS_TONE,
} from '../../data/brandWorkspace';

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const EMPTY = { title: '', body: '' };

export default function ContentStrategySection({ brand, onToast }) {
  const { user } = useAuth();
  const { getStrategies, saveStrategy, deleteStrategy, setStrategyStatus } = useBrands();

  const [editor, setEditor] = useState(null); // { id?, title, body }
  const [reviewFor, setReviewFor] = useState(null); // strategy id
  const [reviewNote, setReviewNote] = useState('');

  const strategies = getStrategies(brand.id)
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const role = String(user?.role ?? '').toUpperCase();
  const canReview = role === 'ADMIN' || role === 'ACCOUNT_MANAGER';

  const startCreate = () => setEditor({ ...EMPTY });
  const startEdit = (strategy) =>
    setEditor({ id: strategy.id, title: strategy.title, body: strategy.body });

  const handleSave = (event) => {
    event.preventDefault();
    if (!editor) return;

    if (!editor.title.trim() || !editor.body.trim()) {
      onToast?.('Add a title and the strategy content.', 'danger');
      return;
    }

    saveStrategy({
      id: editor.id,
      brandId: brand.id,
      title: editor.title,
      body: editor.body,
      authorName: editor.id ? undefined : user?.fullName ?? '',
      status: editor.id ? undefined : 'draft',
    });

    setEditor(null);
    onToast?.(editor.id ? 'Strategy updated.' : 'Strategy saved as a draft.');
  };

  const advance = (strategy, status, note = '') => {
    setStrategyStatus(strategy.id, status, note, user?.fullName ?? '');
    setReviewFor(null);
    setReviewNote('');
    onToast?.(`Strategy marked as ${STRATEGY_STATUS_LABEL[status]}.`);
  };

  return (
    <div className="bw-section">
      <header className="bw-head">
        <div>
          <h2 className="bw-title">Content Strategy</h2>
          <p className="bw-sub">
            The content creator drafts the strategy, the account manager reviews and approves it.
          </p>
        </div>
        <button type="button" className="button button--primary button--sm" onClick={startCreate}>
          <svg aria-hidden="true" className="icon">
            <use href="#i-plus" />
          </svg>
          New strategy
        </button>
      </header>

      {editor ? (
        <form className="bw-card bw-editor" onSubmit={handleSave}>
          <header className="bw-card__head">
            <div>
              <h3>{editor.id ? 'Edit strategy' : 'New content strategy'}</h3>
              <p>Positioning, pillars, channel roles and the content rules for this brand.</p>
            </div>
          </header>

          <div className="bw-field">
            <label htmlFor="strategy-title">Title</label>
            <input
              id="strategy-title"
              className="form-input"
              value={editor.title}
              placeholder="Q4 content strategy — launch pillar"
              onChange={(event) => setEditor((prev) => ({ ...prev, title: event.target.value }))}
            />
          </div>

          <div className="bw-field">
            <label htmlFor="strategy-body">Strategy</label>
            <textarea
              id="strategy-body"
              className="form-textarea"
              rows={10}
              placeholder={
                'Objectives, audience insight, content pillars, channel roles, formats,\nmeasurement plan and the rules every deliverable follows…'
              }
              value={editor.body}
              onChange={(event) => setEditor((prev) => ({ ...prev, body: event.target.value }))}
            />
          </div>

          <div className="bw-actions">
            <button
              type="button"
              className="button button--ghost button--sm"
              onClick={() => setEditor(null)}
            >
              Cancel
            </button>
            <button type="submit" className="button button--primary button--sm">
              Save strategy
            </button>
          </div>
        </form>
      ) : null}

      {strategies.length ? (
        <div className="bw-stack">
          {strategies.map((strategy) => {
            const tone = STRATEGY_STATUS_TONE[strategy.status] ?? 'is-gray';

            return (
              <article className="bw-card" key={strategy.id}>
                <header className="bw-card__head">
                  <div>
                    <h3>
                      {strategy.title}
                      <span className={`pill ${tone}`}>
                        {STRATEGY_STATUS_LABEL[strategy.status] ?? strategy.status}
                      </span>
                    </h3>
                    <p>
                      {strategy.authorName ? `By ${strategy.authorName}` : 'Draft'} · updated{' '}
                      {formatDate(strategy.updatedAt)}
                    </p>
                  </div>
                  <span className="bw-card__actions">
                    <button
                      type="button"
                      className="button button--ghost button--sm"
                      onClick={() => startEdit(strategy)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="bw-icon-btn is-danger"
                      title="Delete strategy"
                      aria-label={`Delete ${strategy.title}`}
                      onClick={() => {
                        deleteStrategy(strategy.id);
                        onToast?.('Strategy deleted.');
                      }}
                    >
                      <svg aria-hidden="true" className="icon">
                        <use href="#i-trash" />
                      </svg>
                    </button>
                  </span>
                </header>

                <p className="bw-body">{strategy.body}</p>

                {strategy.reviewerNote ? (
                  <div className="bw-note">
                    <strong>Reviewer note</strong>
                    <p>{strategy.reviewerNote}</p>
                    {strategy.reviewerName ? <small>— {strategy.reviewerName}</small> : null}
                  </div>
                ) : null}

                <footer className="bw-card__foot">
                  {strategy.status === 'draft' || strategy.status === 'changes_requested' ? (
                    <button
                      type="button"
                      className="button button--dark button--sm"
                      onClick={() => advance(strategy, 'in_review')}
                    >
                      <svg aria-hidden="true" className="icon">
                        <use href="#i-send" />
                      </svg>
                      Submit for review
                    </button>
                  ) : null}

                  {strategy.status === 'in_review' && canReview ? (
                    <>
                      <button
                        type="button"
                        className="button button--primary button--sm"
                        onClick={() => advance(strategy, 'approved')}
                      >
                        <svg aria-hidden="true" className="icon">
                          <use href="#i-check" />
                        </svg>
                        Approve
                      </button>
                      <button
                        type="button"
                        className="button button--ghost button--sm"
                        onClick={() => {
                          setReviewFor(strategy.id);
                          setReviewNote('');
                        }}
                      >
                        Request changes
                      </button>
                    </>
                  ) : null}

                  {strategy.status === 'in_review' && !canReview ? (
                    <span className="bw-muted">Waiting for the account manager to review.</span>
                  ) : null}

                  {strategy.status === 'approved' ? (
                    <span className="bw-approved">
                      <svg aria-hidden="true" className="icon">
                        <use href="#i-check" />
                      </svg>
                      Approved{strategy.reviewerName ? ` by ${strategy.reviewerName}` : ''}
                    </span>
                  ) : null}
                </footer>

                {reviewFor === strategy.id ? (
                  <div className="bw-review">
                    <label htmlFor={`review-${strategy.id}`}>What should change?</label>
                    <textarea
                      id={`review-${strategy.id}`}
                      className="form-textarea"
                      rows={3}
                      value={reviewNote}
                      onChange={(event) => setReviewNote(event.target.value)}
                      placeholder="Add the feedback the creator needs to action…"
                    />
                    <div className="bw-actions">
                      <button
                        type="button"
                        className="button button--ghost button--sm"
                        onClick={() => setReviewFor(null)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="button button--danger button--sm"
                        onClick={() => advance(strategy, 'changes_requested', reviewNote)}
                      >
                        Send feedback
                      </button>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="bw-empty bw-empty--panel">
          <strong>No content strategy yet.</strong>
          <p>Draft the strategy, then send it to the account manager for review.</p>
          <button type="button" className="button button--primary button--sm" onClick={startCreate}>
            <svg aria-hidden="true" className="icon">
              <use href="#i-plus" />
            </svg>
            Create the first strategy
          </button>
        </div>
      )}
    </div>
  );
}
