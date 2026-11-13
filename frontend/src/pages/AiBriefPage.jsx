import React, { useEffect, useMemo, useState } from 'react';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';
import useAuth from '../hooks/useAuth';
import { useBrands } from '../context/brandsStore';
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

export const BRIEF_SECTIONS_SPEC = [
  {
    key: 'brandOverview',
    legacyKey: 'overview',
    number: '01',
    title: 'Brand Overview',
    titleAr: 'نظرة عامة على البراند',
    desc: 'نظرة عامة على البراند والنشاط والمنتجات والخدمات.',
  },
  {
    key: 'targetAudience',
    legacyKey: 'audience',
    number: '02',
    title: 'Target Audience',
    titleAr: 'الجمهور المستهدف',
    desc: 'الجمهور المستهدف والمناطق الجغرافية.',
  },
  {
    key: 'brandGoals',
    legacyKey: 'goals',
    number: '03',
    title: 'Brand Goals',
    titleAr: 'أهداف البراند',
    desc: 'أهداف البراند التسويقية والتجارية.',
  },
  {
    key: 'competitiveAdvantage',
    legacyKey: 'competitors',
    number: '04',
    title: 'Competitive Advantage',
    titleAr: 'نقاط التميز والمنافسة',
    desc: 'نقاط التميز والمنافسة.',
  },
  {
    key: 'brandCommunication',
    legacyKey: 'tone',
    number: '05',
    title: 'Brand Communication',
    titleAr: 'شخصية البراند ونبرة الصوت',
    desc: 'شخصية البراند وطريقة التواصل ونبرة الصوت.',
  },
  {
    key: 'marketingStrategy',
    legacyKey: 'strategy',
    number: '06',
    title: 'Marketing Strategy',
    titleAr: 'الاستراتيجية التسويقية',
    desc: 'الاتجاهات والاستراتيجيات التسويقية المقترحة.',
  },
  {
    key: 'contentDirection',
    legacyKey: 'messages',
    number: '07',
    title: 'Content Direction',
    titleAr: 'اتجاه المحتوى',
    desc: 'اتجاه المحتوى وأفكار التصوير وأنواعه.',
  },
];

function arrayToText(arr) {
  if (!arr) return '';
  if (Array.isArray(arr)) return arr.join('\n');
  return String(arr);
}

function textToArray(text) {
  if (!text) return [];
  return text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

function getSectionContent(sections, spec) {
  if (!sections) {
    return { clientInformation: [], aiAnalysis: [], recommendations: [] };
  }
  const raw = sections[spec.key] ?? (spec.legacyKey ? sections[spec.legacyKey] : null);
  if (!raw) {
    return { clientInformation: [], aiAnalysis: [], recommendations: [] };
  }
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    return {
      clientInformation: Array.isArray(raw.clientInformation)
        ? raw.clientInformation
        : raw.clientInformation ? [String(raw.clientInformation)] : [],
      aiAnalysis: Array.isArray(raw.aiAnalysis)
        ? raw.aiAnalysis
        : raw.aiAnalysis ? [String(raw.aiAnalysis)] : [],
      recommendations: Array.isArray(raw.recommendations)
        ? raw.recommendations
        : raw.recommendations ? [String(raw.recommendations)] : [],
    };
  }
  return {
    clientInformation: [String(raw)],
    aiAnalysis: ['تحليل استراتيجي مستخلص من المعطيات الأولية.'],
    recommendations: ['تنفيذ الخطة التشغيلية وفق المحاور المحددة.'],
  };
}

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

  const { brands = [] } = useBrands();
  const accessibleBrandIds = useMemo(() => new Set(brands.map((b) => b.id)), [brands]);

  const submitted = useMemo(
    () => dispatches.filter((dispatch) => dispatch.status === 'submitted' && (!brands.length || accessibleBrandIds.has(dispatch.brandId))),
    [dispatches, accessibleBrandIds, brands.length],
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
    ? BRIEF_SECTIONS_SPEC.filter((spec) => {
        const sec = getSectionContent(draft.sections, spec);
        return !sec.clientInformation.length && !sec.aiAnalysis.length && !sec.recommendations.length;
      })
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
      });
      setGenerating(false);
      showToast(t('Draft brief generated. Review each section before approving.'), 'success');
    }, 1300);
  };

  const updateSectionArray = (sectionKey, arrayKey, textValue) => {
    const items = textToArray(textValue);
    setDraft((prev) => {
      const spec = BRIEF_SECTIONS_SPEC.find((s) => s.key === sectionKey);
      const current = getSectionContent(prev?.sections, spec);
      return {
        ...prev,
        sections: {
          ...prev?.sections,
          [sectionKey]: {
            ...current,
            [arrayKey]: items,
          },
        },
      };
    });
    setErrors((prev) => ({ ...prev, [sectionKey]: '' }));
  };

  const handleSave = () => {
    if (!brief || !draft) return;
    saveBrief(brief.id, { sections: draft.sections });
    showToast(t('Brief saved as a draft.'), 'success');
  };

  const handleApprove = () => {
    if (!brief || !draft) return;

    const nextErrors = {};
    BRIEF_SECTIONS_SPEC.forEach((spec) => {
      const sec = getSectionContent(draft.sections, spec);
      if (!sec.clientInformation.length && !sec.aiAnalysis.length && !sec.recommendations.length) {
        nextErrors[spec.key] = t('This section is required before approval.');
      }
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setApproveOpen(false);
      showToast(t('Complete every brief section before approving.'), 'danger');
      return;
    }

    saveBrief(brief.id, { sections: draft.sections });
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
          label={t('Briefs approved')}
          value={briefs.filter((item) => item.status === 'approved').length}
          note={t('Approved by Account Manager')}
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
                    </span>
                    <p className={value ? undefined : 'is-muted'}>
                      {value ? answerText(value, t) : t('Not answered')}
                    </p>
                  </div>
                );
              })}
            </div>

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
                  {BRIEF_SECTIONS_SPEC.map((spec) => {
                    const content = getSectionContent(draft.sections, spec);
                    return (
                      <div
                        key={spec.key}
                        className="s3-brief-section-card"
                        style={{
                          background: 'var(--panel)',
                          border: '1px solid var(--line)',
                          borderRadius: 16,
                          padding: '16px 20px',
                          marginBottom: 16,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 14,
                            paddingBottom: 10,
                            borderBottom: '1px solid var(--line)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                background: '#111827',
                                color: '#FFFFFF',
                                fontSize: 12.5,
                                fontWeight: 800,
                              }}
                            >
                              {spec.number}
                            </span>
                            <div>
                              <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 800, color: 'var(--ink)' }}>
                                {spec.title}
                                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--faint)', marginInlineStart: 8 }}>
                                  ({spec.titleAr})
                                </span>
                              </h3>
                              <p style={{ margin: '2px 0 0', fontSize: 11.5, color: 'var(--muted)' }}>
                                {spec.desc}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* 3 Arrays Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                          {/* Array 1: clientInformation */}
                          <div style={{ background: 'var(--card-bg, #FFFFFF)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                              <span style={{ background: '#EFF6FF', color: '#1D4ED8', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>
                                clientInformation
                              </span>
                              <small style={{ color: 'var(--faint)', fontSize: 10.5 }}>
                                {t('Client Facts (Onboarding)')}
                              </small>
                            </div>
                            <textarea
                              className="form-textarea"
                              rows={4}
                              value={arrayToText(content.clientInformation)}
                              onChange={(e) => updateSectionArray(spec.key, 'clientInformation', e.target.value)}
                              disabled={!canEdit || isApproved}
                              placeholder={t('Facts provided by client in onboarding…')}
                              style={{ fontSize: 12, lineHeight: 1.5 }}
                            />
                          </div>

                          {/* Array 2: aiAnalysis */}
                          <div style={{ background: 'var(--card-bg, #FFFFFF)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                              <span style={{ background: '#FAF5FF', color: '#7E22CE', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>
                                aiAnalysis
                              </span>
                              <small style={{ color: 'var(--faint)', fontSize: 10.5 }}>
                                {t('AI Strategic Analysis')}
                              </small>
                            </div>
                            <textarea
                              className="form-textarea"
                              rows={4}
                              value={arrayToText(content.aiAnalysis)}
                              onChange={(e) => updateSectionArray(spec.key, 'aiAnalysis', e.target.value)}
                              disabled={!canEdit || isApproved}
                              placeholder={t('AI analytical insights…')}
                              style={{ fontSize: 12, lineHeight: 1.5 }}
                            />
                          </div>

                          {/* Array 3: recommendations */}
                          <div style={{ background: 'var(--card-bg, #FFFFFF)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                              <span style={{ background: '#F0FDF4', color: '#15803D', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>
                                recommendations
                              </span>
                              <small style={{ color: 'var(--faint)', fontSize: 10.5 }}>
                                {t('AI Recommendations')}
                              </small>
                            </div>
                            <textarea
                              className="form-textarea"
                              rows={4}
                              value={arrayToText(content.recommendations)}
                              onChange={(e) => updateSectionArray(spec.key, 'recommendations', e.target.value)}
                              disabled={!canEdit || isApproved}
                              placeholder={t('Actionable recommendations…')}
                              style={{ fontSize: 12, lineHeight: 1.5 }}
                            />
                          </div>
                        </div>
                        {errors[spec.key] ? <span className="set-error" style={{ marginTop: 6, display: 'block' }}>{errors[spec.key]}</span> : null}
                      </div>
                    );
                  })}
                </div>

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
