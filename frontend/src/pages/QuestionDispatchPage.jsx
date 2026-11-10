import React, { useMemo, useState } from 'react';
import Modal from '../components/common/Modal';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';
import { useBrands } from '../context/brandsStore';
import { useSprint3 } from '../context/sprint3Store';
import {
  DISPATCH_STATUS_LABEL,
  DISPATCH_STATUSES,
  QUESTION_TYPE_LABEL,
  NOTIFICATION_CHANNELS,
  formatStamp,
} from '../data/sprint3';
import { EmptyState, Field, PageHeader, Stat, StatusPill } from '../components/sprint3/Sprint3UI';

function toneForStatus(status) {
  return DISPATCH_STATUSES.find((item) => item.id === status)?.tone ?? 'is-gray';
}

function answerText(value) {
  if (Array.isArray(value)) return value.join(', ');
  if (value && typeof value === 'object') return value.name ?? 'File uploaded';
  return String(value ?? '');
}

export default function QuestionDispatchPage() {
  const { brands } = useBrands();
  const {
    templates,
    dispatches,
    createDispatch,
    updateDispatch,
    t,
    settings,
    role,
  } = useSprint3();
  const { toast, showToast } = useToast(5000);

  const activeBrands = brands.filter((brand) => brand.status !== 'archived');

  const [brandId, setBrandId] = useState(activeBrands[0]?.id ?? '');
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? '');
  const [note, setNote] = useState('');
  const [channels, setChannels] = useState(settings.channels ?? ['in_app']);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(null);
  const [answersFor, setAnswersFor] = useState(null);

  const canDispatch = role === 'admin' || role === 'account_manager';
  const brand = brands.find((item) => String(item.id) === String(brandId)) ?? null;
  const template = templates.find((item) => item.id === templateId) ?? null;

  const brandDispatches = useMemo(
    () =>
      dispatches
        .filter((dispatch) => String(dispatch.brandId) === String(brandId))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [dispatches, brandId],
  );

  const portalUrl = (token) => {
    if (typeof window === 'undefined') return `#portal?token=${token}`;
    return `${window.location.origin}${window.location.pathname}#portal?token=${token}`;
  };

  const toggleChannel = (channelId) => {
    setChannels((prev) =>
      prev.includes(channelId)
        ? prev.filter((item) => item !== channelId)
        : [...prev, channelId],
    );
  };

  const handleSend = () => {
    const nextErrors = {};
    if (!brand) nextErrors.brand = t('Select a brand first.');
    if (!template) nextErrors.template = t('Select a template first.');
    if (template && !(template.questions?.length > 0)) {
      nextErrors.template = t('This template has no questions yet.');
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const dispatch = createDispatch({
      brandId: brand.id,
      brandName: brand.name,
      templateId: template.id,
      templateName: template.name,
      industry: template.industry,
      note,
      channels,
    });

    setSent(dispatch);
    setNote('');
    showToast(
      t('Questions sent to the client portal.'),
      'success',
    );
  };

  const copyLink = async (token) => {
    const url = portalUrl(token);
    try {
      await navigator.clipboard.writeText(url);
      showToast(t('Portal link copied.'), 'success');
    } catch {
      window.prompt(t('Copy this portal link'), url);
    }
  };

  const simulateNotification = (dispatch) => {
    const labels = (dispatch.channels?.length ? dispatch.channels : ['in_app'])
      .map((id) => NOTIFICATION_CHANNELS.find((channel) => channel.id === id)?.label ?? id)
      .join(' · ');
    showToast(`${t('Notification simulated via')} ${labels}`, 'info');
  };

  const openPortal = (dispatch) => {
    window.open(portalUrl(dispatch.portalToken), '_blank', 'noopener');
  };

  return (
    <div className="page-screen s3-page">
      <PageHeader
        eyebrow={t('Question Dispatch')}
        title={t('Question Dispatch')}
        description={t(
          'Pick a brand and a template, then generate the client portal link and notify them.',
        )}
        actions={
          canDispatch ? null : <StatusPill label={t('Read only for this role')} tone="is-amber" />
        }
      />

      <div className="s3-stats">
        <Stat label={t('Templates available')} value={templates.length} note={t('Ready to dispatch')} />
        <Stat
          label={t('Sent requests')}
          value={dispatches.length}
          note={`${dispatches.filter((item) => item.status === 'submitted').length} ${t(
            'submitted',
          )}`}
        />
        <Stat
          label={t('Awaiting answers')}
          value={dispatches.filter((item) => item.status !== 'submitted').length}
          note={t('Draft or not started')}
        />
      </div>

      <div className="s3-split">
        <section className="s3-card s3-dispatch-compose">
          <header className="s3-card__head">
            <div>
              <span className="s3-eyebrow">{t('New request')}</span>
              <h2>{t('Send questions')}</h2>
            </div>
            <svg aria-hidden="true" className="icon s3-head-icon">
              <use href="#i-send" />
            </svg>
          </header>

          <Field label={t('Brand')} required htmlFor="dispatch-brand">
            <span className="form-select-wrap">
              <select
                id="dispatch-brand"
                className="form-select"
                value={brandId}
                onChange={(event) => {
                  setBrandId(event.target.value);
                  setSent(null);
                }}
                disabled={!canDispatch}
              >
                <option value="">{t('Select a brand')}</option>
                {activeBrands.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <svg aria-hidden="true" className="icon">
                <use href="#i-chevron" />
              </svg>
            </span>
            {errors.brand ? <span className="set-error">{errors.brand}</span> : null}
          </Field>

          <Field label={t('Template')} required htmlFor="dispatch-template">
            <span className="form-select-wrap">
              <select
                id="dispatch-template"
                className="form-select"
                value={templateId}
                onChange={(event) => {
                  setTemplateId(event.target.value);
                  setSent(null);
                }}
                disabled={!canDispatch}
              >
                <option value="">{t('Select a template')}</option>
                {templates.map((item) => (
                  <option key={item.id} value={item.id}>
                    {t(item.name)} · {t(item.industry)}
                  </option>
                ))}
              </select>
              <svg aria-hidden="true" className="icon">
                <use href="#i-chevron" />
              </svg>
            </span>
            {errors.template ? <span className="set-error">{errors.template}</span> : null}
          </Field>

          <Field label={t('Message to the client')} htmlFor="dispatch-note">
            <textarea
              id="dispatch-note"
              className="form-textarea"
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={t('Optional context for the client…')}
              disabled={!canDispatch}
            />
          </Field>

          <div className="s3-field">
            <span className="s3-field__label">{t('Notification channels')}</span>
            <div className="s3-channel-row">
              {NOTIFICATION_CHANNELS.map((channel) => (
                <label
                  key={channel.id}
                  className={`s3-channel${channels.includes(channel.id) ? ' is-on' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={channels.includes(channel.id)}
                    onChange={() => toggleChannel(channel.id)}
                    disabled={!canDispatch}
                  />
                  <span>{t(channel.label)}</span>
                </label>
              ))}
            </div>
          </div>

          {template ? (
            <div className="s3-preview-box">
              <div className="s3-preview-box__head">
                <strong>{t(template.name)}</strong>
                <span>{template.questions?.length ?? 0} {t('questions')}</span>
              </div>
              <ol className="s3-preview-questions">
                {(template.questions ?? []).map((question) => (
                  <li key={question.id}>
                    <span>{t(question.label)}</span>
                    <em>
                      {t(QUESTION_TYPE_LABEL[question.type] ?? question.type)}
                      {question.required ? ` · ${t('Required')}` : ''}
                    </em>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          <div className="s3-form-actions">
            <button
              type="button"
              className="button button--primary"
              onClick={handleSend}
              disabled={!canDispatch}
            >
              <svg aria-hidden="true" className="icon">
                <use href="#i-send" />
              </svg>
              {t('Send questions')}
            </button>
          </div>

          {sent ? (
            <div className="s3-success">
              <div className="s3-success__head">
                <span className="s3-success__icon">
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-check" />
                  </svg>
                </span>
                <div>
                  <strong>{t('Portal link is ready')}</strong>
                  <p>
                    {t('Sent to')} {sent.brandName}. {t('Share the link with the client.')}
                  </p>
                </div>
              </div>
              <code className="s3-link">{portalUrl(sent.portalToken)}</code>
              <div className="s3-success__actions">
                <button
                  type="button"
                  className="button button--ghost button--sm"
                  onClick={() => copyLink(sent.portalToken)}
                >
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-file" />
                  </svg>
                  {t('Copy link')}
                </button>
                <button
                  type="button"
                  className="button button--dark button--sm"
                  onClick={() => openPortal(sent)}
                >
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-external" />
                  </svg>
                  {t('Open portal')}
                </button>
                <button
                  type="button"
                  className="button button--ghost button--sm"
                  onClick={() => simulateNotification(sent)}
                >
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-bell" />
                  </svg>
                  {t('Simulate notification')}
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <section className="s3-card">
          <header className="s3-card__head">
            <div>
              <span className="s3-eyebrow">{brand ? brand.name : t('Requests')}</span>
              <h2>{t('Sent requests')}</h2>
            </div>
            <StatusPill label={`${brandDispatches.length}`} tone="is-blue" />
          </header>

          {brandDispatches.length ? (
            <div className="s3-request-list">
              {brandDispatches.map((dispatch) => (
                <article className="s3-request" key={dispatch.id}>
                  <div className="s3-request__top">
                    <div>
                      <strong>{t(dispatch.templateName)}</strong>
                      <small>
                        {t(dispatch.industry)} · {t('sent')} {formatStamp(dispatch.sentAt)}
                      </small>
                    </div>
                    <StatusPill
                      label={t(DISPATCH_STATUS_LABEL[dispatch.status] ?? dispatch.status)}
                      tone={toneForStatus(dispatch.status)}
                    />
                  </div>

                  {dispatch.note ? <p className="s3-request__note">{t(dispatch.note)}</p> : null}

                  {dispatch.submittedAt ? (
                    <span className="s3-muted">
                      {t('Submitted')} {formatStamp(dispatch.submittedAt)}
                    </span>
                  ) : null}

                  {dispatch.editRequest ? (
                    <div className="s3-edit-request">
                      <strong>{t('Edit requested')}</strong>
                      <p>{dispatch.editRequest.reason}</p>
                      <small>{formatStamp(dispatch.editRequest.at)}</small>
                    </div>
                  ) : null}

                  <footer className="s3-request__actions">
                    <button
                      type="button"
                      className="button button--ghost button--xs"
                      onClick={() => setAnswersFor(dispatch)}
                    >
                      <svg aria-hidden="true" className="icon">
                        <use href="#i-eye" />
                      </svg>
                      {t('View answers')}
                    </button>
                    <button
                      type="button"
                      className="button button--ghost button--xs"
                      onClick={() => copyLink(dispatch.portalToken)}
                    >
                      {t('Copy link')}
                    </button>
                    <button
                      type="button"
                      className="button button--dark button--xs"
                      onClick={() => openPortal(dispatch)}
                    >
                      {t('Open portal')}
                    </button>
                    {dispatch.status === 'submitted' ? (
                      <button
                        type="button"
                        className="button button--ghost button--xs"
                        onClick={() => {
                          updateDispatch(dispatch.id, { status: 'draft' });
                          showToast(t('Answers unlocked for editing.'), 'info');
                        }}
                      >
                        {t('Reopen')}
                      </button>
                    ) : null}
                  </footer>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="#i-send"
              title={t('No requests yet')}
              text={t('Send the first questionnaire to open this brand’s client portal.')}
            />
          )}
        </section>
      </div>

      {answersFor ? (
        <Modal
          isOpen
          onClose={() => setAnswersFor(null)}
          title={`${answersFor.brandName} · ${answersFor.templateName}`}
          subtitle={`${t('Submitted')} ${formatStamp(answersFor.submittedAt)}`}
          icon="#i-eye"
          maxWidth="680px"
          footer={
            <button type="button" className="button button--primary" onClick={() => setAnswersFor(null)}>
              {t('Close')}
            </button>
          }
        >
          {(() => {
            const template =
              templates.find((item) => item.id === answersFor.templateId) ?? null;
            if (!template?.questions?.length) {
              return <p className="modal-copy">{t('The template behind this request was deleted.')}</p>;
            }

            return (
              <div className="s3-answer-list">
                {template.questions.map((question) => {
                  const value = answersFor.answers?.[question.id];
                  return (
                    <div className="s3-answer" key={question.id}>
                      <span className="s3-answer__label">
                        {question.label}
                        {question.required ? <em>*</em> : null}
                      </span>
                      <p className={value ? undefined : 'is-muted'}>
                        {value ? answerText(value) : t('Not answered')}
                      </p>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </Modal>
      ) : null}

      <Toast message={toast?.message} tone={toast?.tone} />
    </div>
  );
}
