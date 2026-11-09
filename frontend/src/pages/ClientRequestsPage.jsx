import React, { useState } from 'react';
import { useSprint3 } from '../context/sprint3Store';
import { useBrands } from '../context/brandsStore';
import { CLIENT_REQUEST_TYPES } from '../data/sprintWorkflow';
import { PageHeader, EmptyState } from '../components/sprint3/Sprint3UI';

export default function ClientRequestsPage() {
  const {
    role,
    clientRequests,
    addClientRequest,
    updateClientRequestStatus,
    addTask,
    t,
  } = useSprint3();
  const { brands } = useBrands();

  const [showNewModal, setShowNewModal] = useState(false);
  const [title, setTitle] = useState('');
  const [reqType, setReqType] = useState('extra_design');
  const [urgency, setUrgency] = useState('standard');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [selectedBrandId, setSelectedBrandId] = useState('1');
  const [toastMsg, setToastMsg] = useState('');

  // Reject modal
  const [rejectingReq, setRejectingReq] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const isClient = role === 'client';
  const isManager = role === 'admin' || role === 'account_manager';

  const visibleRequests = isClient
    ? clientRequests.filter((r) => r.brandId === '1' || r.brandName === 'Nike')
    : clientRequests;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const brand = brands.find((b) => String(b.id) === String(selectedBrandId)) || brands[0];

    addClientRequest({
      brandId: String(selectedBrandId),
      brandName: brand?.name || 'Nike',
      title: title.trim(),
      type: reqType,
      urgency,
      deadline,
      description: description.trim(),
    });

    setTitle('');
    setDescription('');
    setShowNewModal(false);
    setToastMsg(t('Client request submitted successfully'));
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleAcceptAndConvert = (req) => {
    // 1. Create a task in tasks
    const task = addTask({
      title: `[Client Request] ${req.title}`,
      description: req.description,
      brandId: req.brandId,
      brandName: req.brandName,
      priority: req.urgency === 'urgent' ? 'high' : 'medium',
      deadline: req.deadline,
      status: 'todo',
    });

    // 2. Update request status to 'assigned'
    updateClientRequestStatus(req.id, 'assigned', '', task.id);
    setToastMsg(t('Request accepted and converted into a task'));
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleOpenReject = (req) => {
    setRejectingReq(req);
    setRejectionReason('');
  };

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (!rejectionReason.trim() || !rejectingReq) return;

    updateClientRequestStatus(rejectingReq.id, 'rejected', rejectionReason.trim());
    setRejectingReq(null);
    setToastMsg(t('Request rejected with feedback'));
    setTimeout(() => setToastMsg(''), 4000);
  };

  return (
    <div className="page-screen client-requests-page">
      <PageHeader
        eyebrow={t('Client & Delivery')}
        title={t('Client Requests')}
        description={t('Submit and track spontaneous design requests, emergency edits, and event-driven posts with structured approvals.')}
        actions={
          <button
            type="button"
            className="button button--primary"
            onClick={() => setShowNewModal(true)}
          >
            <svg aria-hidden="true" className="icon"><use href="#i-plus" /></svg>
            {t('Submit New Request')}
          </button>
        }
      />

      {toastMsg ? (
        <div className="s3-alert is-green client-requests__toast">
          <svg aria-hidden="true" className="icon"><use href="#i-check" /></svg>
          {toastMsg}
        </div>
      ) : null}

      <div className="cl-card table-wrap">
        <table className="table client-requests-table">
          <thead>
            <tr>
              <th>{t('Request Title')}</th>
              <th>{t('Brand')}</th>
              <th>{t('Request Type')}</th>
              <th>{t('Urgency')}</th>
              <th>{t('Target Deadline')}</th>
              <th>{t('Status')}</th>
              {isManager ? <th>{t('Actions')}</th> : null}
            </tr>
          </thead>
          <tbody>
            {visibleRequests.length === 0 ? (
              <tr>
                <td colSpan={isManager ? 7 : 6}>
                  <EmptyState
                    icon="#i-send"
                    title={t('No requests yet')}
                    text={t('Submit a new request when you need extra designs, urgent edits, or seasonal graphics.')}
                  />
                </td>
              </tr>
            ) : (
              visibleRequests.map((req) => (
                <tr key={req.id}>
                  <td>
                    <div className="client-requests-table__title">
                      <strong>{t(req.title)}</strong>
                      <small>{req.description}</small>
                    </div>
                  </td>
                  <td>
                    <span className="cl-label">{t(req.brandName)}</span>
                  </td>
                  <td>
                    <span className="pill is-gray">
                      {t(CLIENT_REQUEST_TYPES.find((ct) => ct.id === req.type)?.label || 'Extra Design')}
                    </span>
                  </td>
                  <td>
                    <span className={`pill is-${req.urgency === 'urgent' ? 'red' : 'blue'}`}>
                      {t(req.urgency === 'urgent' ? 'Urgent' : 'Standard')}
                    </span>
                  </td>
                  <td>{req.deadline}</td>
                  <td>
                    <span
                      className={`pill is-${
                        req.status === 'assigned'
                          ? 'green'
                          : req.status === 'rejected'
                          ? 'red'
                          : req.status === 'under_review'
                          ? 'amber'
                          : 'purple'
                      }`}
                    >
                      {t(
                        req.status === 'submitted'
                          ? 'Submitted'
                          : req.status === 'under_review'
                          ? 'Under Review'
                          : req.status === 'assigned'
                          ? 'Assigned'
                          : 'Rejected'
                      )}
                    </span>
                  </td>
                  {isManager ? (
                    <td>
                      {req.status === 'submitted' || req.status === 'under_review' ? (
                        <div className="s3-actions-row">
                          <button
                            type="button"
                            className="button button--primary button--sm"
                            onClick={() => handleAcceptAndConvert(req)}
                            title={t('Accept & Convert to Task')}
                          >
                            <svg aria-hidden="true" className="icon"><use href="#i-check" /></svg>
                            {t('Accept & Convert to Task')}
                          </button>
                          <button
                            type="button"
                            className="button button--ghost button--sm is-danger"
                            onClick={() => handleOpenReject(req)}
                            title={t('Reject Request')}
                          >
                            ✕
                          </button>
                        </div>
                      ) : req.status === 'assigned' ? (
                        <span className="client-requests-table__assigned-note">
                          ✓ {t('Assigned')}
                        </span>
                      ) : (
                        <span className="client-requests-table__rejected-note">
                          ✕ {t('Rejected')}
                        </span>
                      )}
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* New Request Modal */}
      {showNewModal ? (
        <div className="s3-modal-backdrop" onClick={() => setShowNewModal(false)}>
          <div
            className="s3-modal new-request-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
          >
            <header className="s3-modal__head">
              <h2 className="s3-modal__title">{t('Submit New Request')}</h2>
              <button
                type="button"
                className="s3-modal__close"
                onClick={() => setShowNewModal(false)}
              >
                ✕
              </button>
            </header>

            <form onSubmit={handleSubmit} className="new-request-form">
              <label className="s3-field">
                <span className="s3-field__label">{t('Request Title')}</span>
                <input
                  type="text"
                  required
                  className="s3-input"
                  placeholder={t('Request Title')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>

              {!isClient ? (
                <label className="s3-field">
                  <span className="s3-field__label">{t('Brand')}</span>
                  <select
                    className="s3-select"
                    value={selectedBrandId}
                    onChange={(e) => setSelectedBrandId(e.target.value)}
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {t(b.name)}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              <div className="new-request-grid">
                <label className="s3-field">
                  <span className="s3-field__label">{t('Request Type')}</span>
                  <select
                    className="s3-select"
                    value={reqType}
                    onChange={(e) => setReqType(e.target.value)}
                  >
                    {CLIENT_REQUEST_TYPES.map((ct) => (
                      <option key={ct.id} value={ct.id}>
                        {t(ct.label)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="s3-field">
                  <span className="s3-field__label">{t('Urgency')}</span>
                  <select
                    className="s3-select"
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                  >
                    <option value="standard">{t('Standard')}</option>
                    <option value="urgent">{t('Urgent')}</option>
                  </select>
                </label>
              </div>

              <label className="s3-field">
                <span className="s3-field__label">{t('Target Deadline')}</span>
                <input
                  type="date"
                  required
                  className="s3-input"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </label>

              <label className="s3-field">
                <span className="s3-field__label">{t('Request Description')}</span>
                <textarea
                  className="s3-input"
                  rows={4}
                  required
                  placeholder={t('Request Description')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>

              <footer className="s3-modal__foot">
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => setShowNewModal(false)}
                >
                  {t('Cancel')}
                </button>
                <button type="submit" className="button button--primary">
                  <svg aria-hidden="true" className="icon"><use href="#i-send" /></svg>
                  {t('Submit New Request')}
                </button>
              </footer>
            </form>
          </div>
        </div>
      ) : null}

      {/* Reject Modal */}
      {rejectingReq ? (
        <div className="s3-modal-backdrop" onClick={() => setRejectingReq(null)}>
          <div
            className="s3-modal reject-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
          >
            <header className="s3-modal__head">
              <h2 className="s3-modal__title">{t('Reject Request')}</h2>
              <button
                type="button"
                className="s3-modal__close"
                onClick={() => setRejectingReq(null)}
              >
                ✕
              </button>
            </header>

            <form onSubmit={handleConfirmReject} className="reject-form">
              <label className="s3-field">
                <span className="s3-field__label">{t('Rejection Reason (Required)')}</span>
                <textarea
                  className="s3-input"
                  rows={4}
                  required
                  placeholder={t('Explain why this request cannot be accommodated…')}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </label>

              <footer className="s3-modal__foot">
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => setRejectingReq(null)}
                >
                  {t('Cancel')}
                </button>
                <button type="submit" className="button button--primary is-danger">
                  {t('Reject Request')}
                </button>
              </footer>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
