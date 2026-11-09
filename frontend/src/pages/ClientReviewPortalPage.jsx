import React, { useMemo, useState } from 'react';
import { useSprint3 } from '../context/sprint3Store';
import { useBrands } from '../context/brandsStore';
import { PageHeader, EmptyState } from '../components/sprint3/Sprint3UI';

export default function ClientReviewPortalPage() {
  const { role, clientReviews, approveClientReview, requestClientChanges, addReviewComment, t } =
    useSprint3();
  const { brands } = useBrands();

  // Selected brand filter (In client role, locked to their brand!)
  const [selectedBrandId, setSelectedBrandId] = useState(() => {
    return role === 'client' ? '1' : 'all'; // Default Nike or All for agency
  });

  const [activeReviewItem, setActiveReviewItem] = useState(null);
  const [changeReason, setChangeReason] = useState('');
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Data isolation
  const visibleReviews = useMemo(() => {
    return clientReviews.filter((item) => {
      if (role === 'client') {
        return String(item.brandId) === '1' || item.brandName === 'Nike';
      }
      if (selectedBrandId !== 'all') {
        return String(item.brandId) === String(selectedBrandId);
      }
      return true;
    });
  }, [clientReviews, role, selectedBrandId]);

  const handleApprove = (item) => {
    approveClientReview(item.id, 'Approved for publishing.');
    setToastMsg(t('Content approved by client and sent to publishing queue'));
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleOpenChangesModal = (item) => {
    setActiveReviewItem(item);
    setChangeReason('');
    setShowChangesModal(true);
  };

  const handleSubmitChanges = (e) => {
    e.preventDefault();
    if (!changeReason.trim() || !activeReviewItem) return;

    requestClientChanges(activeReviewItem.id, changeReason.trim());
    setShowChangesModal(false);
    setToastMsg(t('Change request sent to the agency account manager'));
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleSendComment = (e, item) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const authorName = role === 'client' ? 'Kenji Sato (Client Lead)' : 'Elena Vance (Agency Lead)';
    const authorRole = role === 'client' ? 'Client' : 'Agency';

    addReviewComment(item.id, authorName, authorRole, newComment.trim());
    setNewComment('');
  };

  return (
    <div className="page-screen client-review-page">
      <PageHeader
        eyebrow={t('Client & Delivery')}
        title={t('Client Review Portal')}
        description={t('Review high-fidelity post mockups, inspect captions and visuals, submit feedback, or approve content for publishing.')}
        actions={
          role !== 'client' ? (
            <select
              className="s3-toolbar__select"
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
            >
              <option value="all">{t('All')}: {t('Brands')}</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {t(b.name)}
                </option>
              ))}
            </select>
          ) : null
        }
      />

      {toastMsg ? (
        <div className="s3-alert is-green client-review__toast">
          <svg aria-hidden="true" className="icon"><use href="#i-check" /></svg>
          {toastMsg}
        </div>
      ) : null}

      {visibleReviews.length === 0 ? (
        <div className="cl-card">
          <EmptyState
            icon="#i-eye"
            title={t('No approved brief')}
            text={t('Content will appear here once it passes internal agency review.')}
          />
        </div>
      ) : (
        <div className="client-review__feed">
          {visibleReviews.map((item) => {
            const isApproved = item.status === 'approved';
            const isChanges = item.status === 'changes_requested';

            return (
              <article key={item.id} className="cl-card review-post-card">
                {/* Brand & Platform Header */}
                <header className="review-post-card__header">
                  <div className="review-post-card__brand-info">
                    <span className="cl-avatar cl-avatar--orange">
                      {item.brandName.substring(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <strong>{t(item.brandName)}</strong>
                      <span className="review-post-card__handle">
                        @{item.brandName.toLowerCase().replace(/\s+/g, '')} · {t(item.platform)}
                      </span>
                    </div>
                  </div>

                  <div className="review-post-card__status-wrap">
                    <span className={`pill is-${isApproved ? 'green' : isChanges ? 'red' : 'purple'}`}>
                      {t(isApproved ? 'Approved by Client' : isChanges ? 'Changes Requested' : 'Pending Client Review')}
                    </span>
                  </div>
                </header>

                {/* Media Mockup */}
                <div className="review-post-card__media-wrap">
                  <img
                    src={item.mediaPreview}
                    alt={item.title}
                    className="review-post-card__media-img"
                    loading="lazy"
                  />
                  <span className="review-post-card__format-tag">
                    {item.format === 'reel' ? '🎥 Reel' : item.format === 'carousel' ? '📑 Carousel' : '🖼️ Post'}
                  </span>
                </div>

                {/* Social Actions Simulation Bar */}
                <div className="review-post-card__social-bar">
                  <span className="social-action">❤️ 1.2k</span>
                  <span className="social-action">💬 48</span>
                  <span className="social-action">↗️ Share</span>
                  <span className="social-action">🔖 Save</span>
                </div>

                {/* Post Caption */}
                <div className="review-post-card__caption-area">
                  <h3 className="review-post-card__title">{t(item.title)}</h3>
                  <p className="review-post-card__caption">{item.caption}</p>
                </div>

                {/* Client Decision Section */}
                <div className="review-post-card__decisions">
                  {isApproved ? (
                    <div className="review-decision-banner is-approved">
                      <svg aria-hidden="true" className="icon"><use href="#i-check" /></svg>
                      <div>
                        <strong>{t('Approved by Client')}</strong>
                        <p>{item.clientFeedback || t('Content approved by client and sent to publishing queue')}</p>
                      </div>
                    </div>
                  ) : isChanges ? (
                    <div className="review-decision-banner is-changes">
                      <svg aria-hidden="true" className="icon"><use href="#i-alert" /></svg>
                      <div>
                        <strong>{t('Changes Requested')}</strong>
                        <p>{item.clientFeedback}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="review-decision-buttons">
                      <button
                        type="button"
                        className="button button--primary"
                        onClick={() => handleApprove(item)}
                      >
                        <svg aria-hidden="true" className="icon"><use href="#i-check" /></svg>
                        {t('Approve Post')}
                      </button>

                      <button
                        type="button"
                        className="button button--ghost is-danger"
                        onClick={() => handleOpenChangesModal(item)}
                      >
                        <svg aria-hidden="true" className="icon"><use href="#i-alert" /></svg>
                        {t('Request Changes')}
                      </button>
                    </div>
                  )}
                </div>

                {/* Discussion Thread */}
                <div className="review-post-card__discussion">
                  <h4 className="discussion-title">
                    <svg aria-hidden="true" className="icon"><use href="#i-mail" /></svg>
                    {t('Discussion & Agency Comments')}
                  </h4>

                  <div className="discussion-list">
                    {(item.comments || []).map((comm) => (
                      <div key={comm.id} className="discussion-comment">
                        <div className="discussion-comment__head">
                          <strong>{t(comm.author)}</strong>
                          <span className="discussion-comment__time">{comm.timestamp}</span>
                        </div>
                        <p className="discussion-comment__text">{comm.text}</p>
                      </div>
                    ))}
                  </div>

                  <form
                    onSubmit={(e) => handleSendComment(e, item)}
                    className="discussion-form"
                  >
                    <input
                      type="text"
                      className="s3-input"
                      placeholder={t('Add a comment…')}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button type="submit" className="button button--ghost button--sm">
                      {t('Post Comment')}
                    </button>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Changes Request Modal */}
      {showChangesModal && activeReviewItem ? (
        <div className="s3-modal-backdrop" onClick={() => setShowChangesModal(false)}>
          <div
            className="s3-modal changes-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
          >
            <header className="s3-modal__head">
              <h2 className="s3-modal__title">{t('Request Changes')}</h2>
              <button
                type="button"
                className="s3-modal__close"
                onClick={() => setShowChangesModal(false)}
              >
                ✕
              </button>
            </header>

            <form onSubmit={handleSubmitChanges} className="changes-form">
              <p className="changes-form__hint">
                {t('Describe the changes you want our team to make…')}
              </p>

              <label className="s3-field">
                <span className="s3-field__label">{t('Change Request Reason (Required)')}</span>
                <textarea
                  className="s3-input"
                  rows={4}
                  required
                  placeholder={t('Describe the changes you want our team to make…')}
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                />
              </label>

              <footer className="s3-modal__foot">
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => setShowChangesModal(false)}
                >
                  {t('Cancel')}
                </button>
                <button type="submit" className="button button--primary is-danger">
                  <svg aria-hidden="true" className="icon"><use href="#i-alert" /></svg>
                  {t('Request Changes')}
                </button>
              </footer>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
