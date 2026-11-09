import React, { useState } from 'react';
import { useSprint3 } from '../context/sprint3Store';
import { PUBLISHING_STATUSES } from '../data/sprintWorkflow';
import { PageHeader, EmptyState } from '../components/sprint3/Sprint3UI';

export default function PublishingPage() {
  const { publishingItems, updatePublishingItem, t } = useSprint3();

  const [editingItem, setEditingItem] = useState(null);
  const [liveUrl, setLiveUrl] = useState('');
  const [actualDate, setActualDate] = useState('');
  const [pubStatus, setPubStatus] = useState('published');
  const [toastMsg, setToastMsg] = useState('');

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setLiveUrl(item.liveUrl || '');
    setActualDate(item.actualPublishDate || new Date().toISOString().replace('T', ' ').substring(0, 16));
    setPubStatus(item.status || 'published');
  };

  const handleSavePublishing = (e) => {
    e.preventDefault();
    if (!editingItem) return;

    updatePublishingItem(editingItem.id, {
      liveUrl: liveUrl.trim(),
      actualPublishDate: actualDate,
      status: pubStatus,
    });

    setEditingItem(null);
    setToastMsg(t('Publishing details updated successfully'));
    setTimeout(() => setToastMsg(''), 4000);
  };

  return (
    <div className="page-screen publishing-page">
      <PageHeader
        eyebrow={t('Client & Delivery')}
        title={t('Publishing Tracking')}
        description={t('Audit approved assets, log broadcast time, record live social URLs, and verify cross-platform release health.')}
      />

      {toastMsg ? (
        <div className="s3-alert is-green publishing__toast">
          <svg aria-hidden="true" className="icon"><use href="#i-check" /></svg>
          {toastMsg}
        </div>
      ) : null}

      <div className="cl-card table-wrap">
        <table className="table publishing-table">
          <thead>
            <tr>
              <th>{t('Task Title')}</th>
              <th>{t('Brand')}</th>
              <th>{t('Platform')}</th>
              <th>{t('Scheduled Date')}</th>
              <th>{t('Actual Publish Date')}</th>
              <th>{t('Status')}</th>
              <th>{t('Live URL')}</th>
              <th>{t('Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {publishingItems.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <EmptyState
                    icon="#i-globe"
                    title={t('Publishing Queue')}
                    text={t('Approved content from the Client Review Portal will automatically populate here.')}
                  />
                </td>
              </tr>
            ) : (
              publishingItems.map((item) => (
                <tr key={item.id} className="publishing-row">
                  <td>
                    <strong>{t(item.title)}</strong>
                  </td>
                  <td>
                    <span className="cl-label">{t(item.brandName)}</span>
                  </td>
                  <td>
                    <span className="pill is-gray">{t(item.platform)}</span>
                  </td>
                  <td>{item.scheduledDate}</td>
                  <td>
                    {item.actualPublishDate ? (
                      <span className="publishing-table__actual">{item.actualPublishDate}</span>
                    ) : (
                      <span className="publishing-table__pending">—</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`pill is-${
                        item.status === 'published'
                          ? 'green'
                          : item.status === 'failed'
                          ? 'red'
                          : 'amber'
                      }`}
                    >
                      {t(
                        item.status === 'published'
                          ? 'Published'
                          : item.status === 'failed'
                          ? 'Failed'
                          : 'Scheduled'
                      )}
                    </span>
                  </td>
                  <td>
                    {item.liveUrl ? (
                      <a
                        href={item.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="publishing-table__link"
                      >
                        <svg aria-hidden="true" className="icon"><use href="#i-external" /></svg>
                        {item.liveUrl.length > 28 ? `${item.liveUrl.substring(0, 28)}…` : item.liveUrl}
                      </a>
                    ) : (
                      <span className="publishing-table__nolink">—</span>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="button button--ghost button--sm"
                      onClick={() => handleOpenEdit(item)}
                    >
                      {t('Update Live URL')}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingItem ? (
        <div className="s3-modal-backdrop" onClick={() => setEditingItem(null)}>
          <div
            className="s3-modal publishing-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
          >
            <header className="s3-modal__head">
              <h2 className="s3-modal__title">{t('Update Live URL')}</h2>
              <button
                type="button"
                className="s3-modal__close"
                onClick={() => setEditingItem(null)}
              >
                ✕
              </button>
            </header>

            <form onSubmit={handleSavePublishing} className="publishing-form">
              <label className="s3-field">
                <span className="s3-field__label">{t('Status')}</span>
                <select
                  className="s3-select"
                  value={pubStatus}
                  onChange={(e) => setPubStatus(e.target.value)}
                >
                  {PUBLISHING_STATUSES.map((st) => (
                    <option key={st.id} value={st.id}>
                      {t(st.label)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="s3-field">
                <span className="s3-field__label">{t('Actual Publish Date')}</span>
                <input
                  type="text"
                  className="s3-input"
                  placeholder="YYYY-MM-DD HH:MM"
                  value={actualDate}
                  onChange={(e) => setActualDate(e.target.value)}
                />
              </label>

              <label className="s3-field">
                <span className="s3-field__label">{t('Live URL')}</span>
                <input
                  type="url"
                  className="s3-input"
                  placeholder="https://instagram.com/p/..."
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                />
              </label>

              <footer className="s3-modal__foot">
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => setEditingItem(null)}
                >
                  {t('Cancel')}
                </button>
                <button type="submit" className="button button--primary">
                  {t('Save')}
                </button>
              </footer>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
