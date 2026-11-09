import React, { useEffect, useMemo, useState } from 'react';
import Logo from '../components/Logo';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';
import { useSprint3 } from '../context/sprint3Store';
import {
  QUESTION_TYPE_LABEL,
  formatStamp,
} from '../data/sprint3';
import { Icon, StatusPill } from '../components/sprint3/Sprint3UI';

function fileLabel(value) {
  if (!value) return '';
  return typeof value === 'object' ? `${value.name} · ${value.size}` : String(value);
}

export default function ClientPortalPage({ token }) {
  const {
    dispatches,
    templates,
    saveAnswers,
    submitAnswers,
    requestEdit,
    getDispatchByToken,
    lang,
    setLang,
    t,
  } = useSprint3();
  const { toast, showToast } = useToast(5000);

  const [selectedToken, setSelectedToken] = useState(token || '');

  const activeToken = token || selectedToken;

  const dispatch = useMemo(() => {
    if (activeToken) {
      const found = getDispatchByToken(activeToken);
      if (found) return found;
    }
    return dispatches[0] ?? null;
  }, [getDispatchByToken, activeToken, dispatches]);

  const template = useMemo(
    () => templates.find((item) => item.id === dispatch?.templateId) ?? null,
    [templates, dispatch],
  );

  const [answers, setAnswers] = useState(() => ({ ...(dispatch?.answers ?? {}) }));
  const [errors, setErrors] = useState({});
  const [editReason, setEditReason] = useState('');
  const [editError, setEditError] = useState('');
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    if (dispatch) {
      setAnswers({ ...(dispatch.answers ?? {}) });
      setErrors({});
      setEditReason('');
      setEditError('');
      setRequested(false);
    }
  }, [dispatch?.id]);

  const locked = dispatch?.status === 'submitted';
  const questions = template?.questions ?? [];
  const answeredCount = questions.filter((question) => {
    const value = answers[question.id];
    if (Array.isArray(value)) return value.length > 0;
    if (value && typeof value === 'object') return Boolean(value.name);
    return String(value ?? '').trim().length > 0;
  }).length;
  const progress = questions.length
    ? Math.round((answeredCount / questions.length) * 100)
    : 0;

  const setAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setErrors((prev) => ({ ...prev, [questionId]: '' }));
  };

  const toggleMulti = (questionId, option) => {
    setAnswers((prev) => {
      const current = Array.isArray(prev[questionId]) ? prev[questionId] : [];
      return {
        ...prev,
        [questionId]: current.includes(option)
          ? current.filter((item) => item !== option)
          : [...current, option],
      };
    });
    setErrors((prev) => ({ ...prev, [questionId]: '' }));
  };

  const validate = () => {
    const nextErrors = {};
    questions.forEach((question) => {
      if (!question.required) return;
      const value = answers[question.id];
      const empty = Array.isArray(value)
        ? value.length === 0
        : value && typeof value === 'object'
          ? !value.name
          : !String(value ?? '').trim();
      if (empty) nextErrors[question.id] = t('This answer is required.');
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSaveDraft = () => {
    if (!dispatch) return;
    saveAnswers(dispatch.id, answers);
    showToast(t('Draft saved. You can finish this later from the same link.'), 'success');
  };

  const handleSubmit = () => {
    if (!dispatch) return;
    if (!validate()) {
      showToast(t('Required answers are missing'), 'danger');
      return;
    }
    submitAnswers(dispatch.id, answers);
    showToast(t('Answers submitted. This questionnaire is now locked.'), 'success');
  };

  const handleRequestEdit = () => {
    if (!dispatch) return;
    if (!editReason.trim()) {
      setEditError(t('Reason is required'));
      return;
    }
    requestEdit(dispatch.id, editReason);
    setRequested(true);
    setEditReason('');
    setEditError('');
    showToast(t('Your account manager will unlock the questionnaire.'), 'info');
  };

  const toggleLanguage = () => setLang(lang === 'ar' ? 'en' : 'ar');

  if (!dispatch) {
    return (
      <div className="s3-portal">
        <header className="s3-portal__top">
          <span className="s3-portal__brand">
            <Logo />
            <strong>ORVIA</strong>
          </span>
          <button type="button" className="button button--ghost button--sm" onClick={toggleLanguage}>
            {lang === 'ar' ? 'English' : 'العربية'}
          </button>
        </header>
        <main className="s3-portal__main">
          <div className="s3-portal-card s3-portal-card--message">
            <span className="s3-portal__lock">
              <Icon id="#i-lock" />
            </span>
            <h1>{t('This link is not valid')}</h1>
            <p>
              {t(
                'The questionnaire link may have expired, or it belongs to a different workspace. Ask your account manager for a fresh link.',
              )}
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="s3-portal">
      <header className="s3-portal__top">
        <span className="s3-portal__brand">
          <Logo />
          <strong>ORVIA</strong>
          <span className="s3-portal__divider" aria-hidden="true" />
          <span className="s3-portal__client">{t('Client Portal')}</span>
        </span>
        <div className="s3-portal__top-actions">
          {dispatches.length > 1 ? (
            <span className="form-select-wrap s3-toolbar__select" style={{ minWidth: '180px' }}>
              <select
                className="form-select"
                value={dispatch.portalToken}
                onChange={(e) => setSelectedToken(e.target.value)}
                aria-label={t('Brand')}
              >
                {dispatches.map((d) => (
                  <option key={d.id} value={d.portalToken}>
                    {d.brandName} ({d.status === 'submitted' ? t('Submitted') : t('In progress')})
                  </option>
                ))}
              </select>
              <svg aria-hidden="true" className="icon">
                <use href="#i-chevron" />
              </svg>
            </span>
          ) : null}
          <StatusPill
            label={locked ? t('Answers locked') : t('In progress')}
            tone={locked ? 'is-green' : 'is-amber'}
          />
          <button type="button" className="button button--ghost button--sm" onClick={toggleLanguage}>
            {lang === 'ar' ? 'English' : 'العربية'}
          </button>
          <a href="#dashboard" className="button button--ghost button--sm">
            {t('Back to Dashboard')}
          </a>
        </div>
      </header>

      <main className="s3-portal__main">
        <div className="s3-portal-card">
          <header className="s3-portal__hero">
            <span className="s3-portal__brand-mark">{dispatch.brandName.slice(0, 2).toUpperCase()}</span>
            <div>
              <span className="s3-eyebrow">{dispatch.brandName}</span>
              <h1>{dispatch.templateName}</h1>
              <p>
                {t(
                  'Answer these questions so the ORVIA team can build your brief, strategy and content plan.',
                )}
              </p>
            </div>
          </header>

          {dispatch.note ? (
            <div className="s3-portal-note">
              <strong>{t('Note from your account manager')}</strong>
              <p>{dispatch.note}</p>
            </div>
          ) : null}

          {locked ? (
            <div className="s3-portal-locked">
              <Icon id="#i-check" />
              <div>
                <strong>{t('Your answers are submitted')}</strong>
                <p>
                  {t('Submitted')} {formatStamp(dispatch.submittedAt)} ·{' '}
                  {t('The form is read-only. Request an edit if something needs to change.')}
                </p>
              </div>
            </div>
          ) : (
            <div className="s3-portal-progress">
              <span>
                {answeredCount}/{questions.length} {t('answered')}
              </span>
              <span className="s3-progress" aria-hidden="true">
                <i style={{ width: `${progress}%` }} />
              </span>
              <strong>{progress}%</strong>
            </div>
          )}

          <div className="s3-portal-questions">
            {questions.map((question, index) => {
              const value = answers[question.id];
              const disabled = locked;

              return (
                <div className="s3-portal-question" key={question.id}>
                  <div className="s3-portal-question__head">
                    <span className="s3-portal-question__index">{String(index + 1).padStart(2, '0')}</span>
                    <div>
                      <strong>
                        {question.label}
                        {question.required ? <em className="s3-required">*</em> : null}
                      </strong>
                      <small>{t(QUESTION_TYPE_LABEL[question.type] ?? question.type)}</small>
                    </div>
                  </div>

                  {question.type === 'text' ? (
                    <input
                      className="form-input"
                      value={value ?? ''}
                      onChange={(event) => setAnswer(question.id, event.target.value)}
                      disabled={disabled}
                      placeholder={t('Type your answer')}
                    />
                  ) : null}

                  {question.type === 'textarea' ? (
                    <textarea
                      className="form-textarea"
                      rows={4}
                      value={value ?? ''}
                      onChange={(event) => setAnswer(question.id, event.target.value)}
                      disabled={disabled}
                      placeholder={t('Type your answer')}
                    />
                  ) : null}

                  {question.type === 'single' ? (
                    <div className="s3-portal-options">
                      {(question.options ?? []).map((option) => (
                        <label
                          key={option}
                          className={`s3-portal-option${value === option ? ' is-on' : ''}`}
                        >
                          <input
                            type="radio"
                            name={question.id}
                            checked={value === option}
                            onChange={() => setAnswer(question.id, option)}
                            disabled={disabled}
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  ) : null}

                  {question.type === 'multi' ? (
                    <div className="s3-portal-options">
                      {(question.options ?? []).map((option) => {
                        const current = Array.isArray(value) ? value : [];
                        return (
                          <label
                            key={option}
                            className={`s3-portal-option${current.includes(option) ? ' is-on' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={current.includes(option)}
                              onChange={() => toggleMulti(question.id, option)}
                              disabled={disabled}
                            />
                            <span>{option}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : null}

                  {question.type === 'file' ? (
                    <div className="s3-portal-file">
                      <label className={`s3-file-drop${disabled ? ' is-disabled' : ''}`}>
                        <input
                          type="file"
                          disabled={disabled}
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            setAnswer(question.id, {
                              name: file.name,
                              size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
                            });
                          }}
                        />
                        <Icon id="#i-upload" />
                        <span>{t('Choose a file')}</span>
                      </label>
                      {value ? <small>{fileLabel(value)}</small> : null}
                    </div>
                  ) : null}

                  {errors[question.id] ? (
                    <span className="set-error">{errors[question.id]}</span>
                  ) : null}
                </div>
              );
            })}
          </div>

          {locked ? (
            <div className="s3-portal-request">
              <h3>{t('Request an edit')}</h3>
              <p>
                {t(
                  'Editing after submission is only possible through your account manager. Tell them what needs to change.',
                )}
              </p>
              {requested || dispatch.editRequest ? (
                <div className="s3-portal-note">
                  <strong>{t('Edit requested')}</strong>
                  <p>{dispatch.editRequest?.reason || editReason}</p>
                </div>
              ) : (
                <>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={editReason}
                    onChange={(event) => {
                      setEditReason(event.target.value);
                      setEditError('');
                    }}
                    placeholder={t('Why do you need to edit?')}
                  />
                  {editError ? <span className="set-error">{editError}</span> : null}
                  <button type="button" className="button button--ghost" onClick={handleRequestEdit}>
                    <Icon id="#i-send" />
                    {t('Request an edit')}
                  </button>
                </>
              )}
            </div>
          ) : (
            <footer className="s3-portal__footer">
              <button type="button" className="button button--ghost" onClick={handleSaveDraft}>
                <Icon id="#i-file" />
                {t('Save draft')}
              </button>
              <button type="button" className="button button--primary" onClick={handleSubmit}>
                <Icon id="#i-send" />
                {t('Submit answers')}
              </button>
            </footer>
          )}
        </div>

        <p className="s3-portal__legal">
          {t('Protected client session')} · {dispatch.brandName} · ORVIA ©{' '}
          {new Date().getFullYear()}
        </p>
      </main>

      <Toast message={toast?.message} tone={toast?.tone} />
    </div>
  );
}
