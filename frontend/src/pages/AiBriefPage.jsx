import React, { useEffect, useMemo, useState } from 'react';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';
import useAuth from '../hooks/useAuth';
import { useSprint3 } from '../context/sprint3Store';
import {
  BRIEF_STATUSES,
  QUESTION_TYPE_LABEL,
  formatStamp,
} from '../data/sprint3';
import {
  EmptyState,
  PageHeader,
  Stat,
  StatusPill,
} from '../components/sprint3/Sprint3UI';

const SECTION_ORDER = ['overview', 'goals', 'audience', 'competitors', 'tone', 'messages'];
const SECTION_LABEL = {
  overview: 'Brand overview',
  goals: 'Goals',
  audience: 'Audience',
  competitors: 'Competitors',
  tone: 'Tone of voice',
  messages: 'Key messages',
};
const SECTION_HINT = {
  overview: 'One paragraph describing the brand and its promise.',
  goals: 'What the content must achieve this quarter.',
  audience: 'Who we are speaking to and what they care about.',
  competitors: 'The brands we are measured against and the gap we can own.',
  tone: 'How the brand sounds across every channel.',
  messages: 'The ideas every deliverable should reinforce.',
};

function answerText(value, t = (s) => s) {
  if (Array.isArray(value)) return value.map((v) => t(v)).join('، ');
  if (value && typeof value === 'object') return t(value.name) ?? t('File uploaded');
  const str = String(value ?? '');
  return t(str);
}

export default function AiBriefPage({ onOpenStrategy }) {
  const { user } = useAuth();
  const {
    dispatches,
    templates,
    briefs,
    generateBrief,
    saveBrief,
    approveBrief,
    getBriefForBrand,
    settings,
    role,
    t,
  } = useSprint3();
  const { toast, showToast } = useToast(5000);

  const submitted = useMemo(
    () => dispatches.filter((dispatch) => dispatch.status === 'submitted'),
    [dispatches],
  );

  const [dispatchId, setDispatchId] = useState(submitted[0]?.id ?? '');
  const [generating, setGenerating] = useState(false);
  const [draft, setDraft] = useState(null);
  const [errors, setErrors] = useState({});
  const [approveOpen, setApproveOpen] = useState(false);

  const dispatch = submitted.find((item) => item.id === dispatchId) ?? submitted[0] ?? null;
  const template = templates.find((item) => item.id === dispatch?.templateId) ?? null;
  const brief = dispatch ? getBriefForBrand(dispatch.brandId) : null;

  const canEdit = role === 'admin' || role === 'account_manager';
  const isApproved = brief?.status === 'approved';

  useEffect(() => {
    if (!brief) {
      setDraft(null);
      return;
    }
    setDraft({
      sections: { ...brief.sections },
      clarifying: (brief.clarifying ?? []).map((item) => ({ ...item })),
    });
  }, [brief]);

  const answeredQuestions = template?.questions ?? [];
  const answeredCount = answeredQuestions.filter((question) => {
    const value = dispatch?.answers?.[question.id];
    if (Array.isArray(value)) return value.length > 0;
    if (value && typeof value === 'object') return Boolean(value.name);
    return String(value ?? '').trim().length > 0;
  }).length;

  const missingSections = draft
    ? SECTION_ORDER.filter((key) => !String(draft.sections[key] ?? '').trim())
    : [];

  const handleGenerate = () => {
    if (!dispatch) return;
    setGenerating(true);
    setErrors({});

    window.setTimeout(() => {
      const generated = generateBrief({
        brandId: dispatch.brandId,
        brandName: dispatch.brandName,
        dispatchId: dispatch.id,
        provider: settings.aiProvider,
      });
      setDraft({
        sections: { ...generated.sections },
        clarifying: generated.clarifying.map((item) => ({ ...item })),
      });
      setGenerating(false);
      showToast(t('Draft brief generated. Review each section before approving.'), 'success');
    }, 1300);
  };

  const updateSection = (key, value) => {
    setDraft((prev) => ({
      ...prev,
      sections: { ...prev.sections, [key]: value },
    }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const updateClarifying = (id, answer) => {
    setDraft((prev) => ({
      ...prev,
      clarifying: prev.clarifying.map((item) =>
        item.id === id ? { ...item, answer } : item,
      ),
    }));
  };

  const handleSave = () => {
    if (!brief || !draft) return;
    saveBrief(brief.id, { sections: draft.sections, clarifying: draft.clarifying });
    showToast(t('Brief saved as a draft.'), 'success');
  };

  const handleApprove = () => {
    if (!brief || !draft) return;

    const nextErrors = {};
    SECTION_ORDER.forEach((key) => {
      if (!String(draft.sections[key] ?? '').trim()) {
        nextErrors[key] = t('This section is required before approval.');
      }
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setApproveOpen(false);
      showToast(t('Complete every brief section before approving.'), 'danger');
      return;
    }

    saveBrief(brief.id, { sections: draft.sections, clarifying: draft.clarifying });
    approveBrief(brief.id, user?.fullName || 'Account Manager');
    setApproveOpen(false);
    showToast(t('Brief approved and locked.'), 'success');
  };

  const openStrategy = () => {
    if (!dispatch) return;
    onOpenStrategy?.(dispatch.brandId, brief?.id);
  };

  return (
    <div className="page-screen s3-page">
      <PageHeader
        eyebrow={t('AI Briefs')}
        title={t('AI Brief Generation & Approval')}
        description={t(
          'Read the client’s answers, generate a brief, fill the gaps and approve it with an auditable signature.',
        )}
        actions={
          brief?.status === 'approved' ? (
            <button type="button" className="button button--dark" onClick={openStrategy}>
              <svg aria-hidden="true" className="icon">
                <use href="#i-chart" />
              </svg>
              {t('Open strategy')}
            </button>
          ) : null
        }
      />

      <div className="s3-stats">
        <Stat
          label={t('Submitted questionnaires')}
          value={submitted.length}
          note={t('Ready for AI processing')}
        />
        <Stat
          label={t('Briefs generated')}
          value={briefs.length}
          note={`${briefs.filter((item) => item.status === 'approved').length} ${t('approved')}`}
        />
        <Stat
          label={t('Clarifications open')}
          value={draft
            ? draft.clarifying.filter((item) => !item.answer?.trim()).length
            : 0}
          note={t('Questions the client still owes us')}
        />
      </div>

      {submitted.length ? (
        <div className="s3-brief-layout">
          <section className="s3-card s3-brief-answers">
            <header className="s3-card__head">
              <div>
                <span className="s3-eyebrow">{t('Client answers')}</span>
                <h2>{t(dispatch.brandName)}</h2>
                <p className="s3-muted">
                  {t(dispatch.templateName)} · {t('Submitted')} {formatStamp(dispatch.submittedAt)}
                </p>
              </div>
              <span className="form-select-wrap">
                <select
                  className="form-select"
                  value={dispatch.id}
                  onChange={(event) => setDispatchId(event.target.value)}
                  aria-label={t('Questionnaire')}
                >
                  {submitted.map((item) => (
                    <option key={item.id} value={item.id}>
                      {t(item.brandName)} · {t(item.templateName)}
                    </option>
                  ))}
                </select>
                <svg aria-hidden="true" className="icon">
                  <use href="#i-chevron" />
                </svg>
              </span>
            </header>

            <div className="s3-answer-progress">
              <span>
                {answeredCount}/{answeredQuestions.length} {t('answered')}
              </span>
              <span className="s3-progress" aria-hidden="true">
                <i
                  style={{
                    width: `${
                      answeredQuestions.length
                        ? Math.round((answeredCount / answeredQuestions.length) * 100)
                        : 0
                    }%`,
                  }}
                />
              </span>
            </div>

            <div className="s3-answer-list">
              {answeredQuestions.map((question) => {
                const value = dispatch.answers?.[question.id];
                return (
                  <div className="s3-answer" key={question.id}>
                    <span className="s3-answer__label">
                      {t(question.label)}
                      <em>{t(QUESTION_TYPE_LABEL[question.type] ?? question.type)}</em>
                    </span>
                    <p className={value ? undefined : 'is-muted'}>
                      {value ? answerText(value, t) : t('Not answered')}
                    </p>
                  </div>
                );
              })}
            </div>

            {canEdit ? (
              <button
                type="button"
                className="button button--primary s3-generate"
                onClick={handleGenerate}
                disabled={generating}
              >
                <svg aria-hidden="true" className="icon">
                  <use href="#i-zap" />
                </svg>
                {generating
                  ? t('Generating…')
                  : brief
                    ? t('Regenerate brief with AI')
                    : t('Generate brief with AI')}
              </button>
            ) : null}

            {generating ? (
              <div className="s3-ai-loading">
                <span className="s3-ai-orb" aria-hidden="true" />
                <div>
                  <strong>{t('Reading the client answers…')}</strong>
                  <p>{t('Structuring goals, audience, competitors and tone.')}</p>
                </div>
              </div>
            ) : null}
          </section>

          <section className="s3-card s3-brief-editor">
            <header className="s3-card__head">
              <div>
                <span className="s3-eyebrow">{t('AI brief')}</span>
                <h2>
                  {t(dispatch.brandName)}
                  {brief ? (
                    <StatusPill
                      label={t(
                        BRIEF_STATUSES.find((item) => item.id === brief.status)?.label ??
                          brief.status,
                      )}
                      tone={brief.status === 'approved' ? 'is-green' : 'is-amber'}
                    />
                  ) : null}
                </h2>
              </div>
              {brief ? (
                <span className="s3-muted">{t('Provider')}: {brief.provider}</span>
              ) : null}
            </header>

            {!brief ? (
              <EmptyState
                icon="#i-zap"
                title={t('No brief generated yet')}
                text={t(
                  'Run the AI generator to turn the client answers into an editable brief.',
                )}
                action={
                  canEdit ? (
                    <button
                      type="button"
                      className="button button--primary"
                      onClick={handleGenerate}
                      disabled={generating}
                    >
                      <svg aria-hidden="true" className="icon">
                        <use href="#i-zap" />
                      </svg>
                      {generating ? t('Generating…') : t('Generate brief with AI')}
                    </button>
                  ) : null
                }
              />
            ) : draft ? (
              <>
                {isApproved ? (
                  <div className="s3-approved-banner">
                    <span className="s3-approved-banner__icon">
                      <svg aria-hidden="true" className="icon">
                        <use href="#i-check" />
                      </svg>
                    </span>
                    <div>
                      <strong>{t('Approved brief')}</strong>
                      <p>
                        {t('Approved by')} <b>{t(brief.approverName)}</b> ·{' '}
                        {formatStamp(brief.approvedAt)}
                      </p>
                    </div>
                  </div>
                ) : null}

                {missingSections.length ? (
                  <div className="s3-warning">
                    <svg aria-hidden="true" className="icon">
                      <use href="#i-alert" />
                    </svg>
                    <span>
                      {missingSections.length} {t('brief sections still need input before approval.')}
                    </span>
                  </div>
                ) : null}

                <div className="s3-brief-sections">
                  {SECTION_ORDER.map((key) => (
                    <label className="s3-brief-section" key={key}>
                      <span className="s3-brief-section__head">
                        <strong>{t(SECTION_LABEL[key])}</strong>
                        <small>{t(SECTION_HINT[key])}</small>
                      </span>
                      <textarea
                        className="form-textarea"
                        rows={key === 'overview' ? 3 : 4}
                        value={t(draft.sections[key]) || draft.sections[key] || ''}
                        onChange={(event) => updateSection(key, event.target.value)}
                        disabled={!canEdit || isApproved}
                        placeholder={t(SECTION_HINT[key])}
                      />
                      {errors[key] ? <span className="set-error">{errors[key]}</span> : null}
                    </label>
                  ))}
                </div>

                {draft.clarifying.length ? (
                  <div className="s3-clarifying">
                    <header>
                      <h3>{t('Clarifying questions')}</h3>
                      <p>
                        {t(
                          'The AI flagged missing data. Record the client’s answers so the strategy can use them.',
                        )}
                      </p>
                    </header>
                    {draft.clarifying.map((item) => (
                      <label className="s3-clarify" key={item.id}>
                        <span>{t(item.question)}</span>
                        <input
                          className="form-input"
                          value={t(item.answer) ?? item.answer ?? ''}
                          onChange={(event) => updateClarifying(item.id, event.target.value)}
                          placeholder={t('Client answer…')}
                          disabled={!canEdit}
                        />
                      </label>
                    ))}
                  </div>
                ) : null}

                {canEdit && !isApproved ? (
                  <footer className="s3-form-actions s3-form-actions--between">
                    <button type="button" className="button button--ghost" onClick={handleSave}>
                      {t('Save brief')}
                    </button>
                    <button
                      type="button"
                      className="button button--primary"
                      onClick={() => setApproveOpen(true)}
                    >
                      <svg aria-hidden="true" className="icon">
                        <use href="#i-check" />
                      </svg>
                      {t('Approve brief')}
                    </button>
                  </footer>
                ) : null}
              </>
            ) : null}
          </section>
        </div>
      ) : (
        <EmptyState
          icon="#i-send"
          title={t('Answer the client questions first')}
          text={t('Send a questionnaire from Question Dispatch and wait for the client to submit.')}
        />
      )}

      {approveOpen ? (
        <div className="s3-confirm">
          <div className="s3-confirm__card">
            <span className="s3-confirm__icon">
              <svg aria-hidden="true" className="icon">
                <use href="#i-shield" />
              </svg>
            </span>
            <h2>{t('Approve this brief?')}</h2>
            <p>
              {t(
                'Approving locks the brief and records your name, date and time as the approver. The strategy editor will use this version.',
              )}
            </p>
            <div className="s3-confirm__meta">
              <span>{t('Approver')}</span>
              <strong>{user?.fullName || 'Account Manager'}</strong>
              <span>{t('Timestamp')}</span>
              <strong>{formatStamp(new Date().toISOString())}</strong>
            </div>
            <div className="s3-modal-actions">
              <button
                type="button"
                className="button button--ghost"
                onClick={() => setApproveOpen(false)}
              >
                {t('Cancel')}
              </button>
              <button type="button" className="button button--primary" onClick={handleApprove}>
                {t('Approve brief')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <Toast message={toast?.message} tone={toast?.tone} />
    </div>
  );
}
