import React, { useMemo, useState } from 'react';
import Modal from '../components/common/Modal';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';
import { useSprint3 } from '../context/sprint3Store';
import {
  QUESTION_TYPES,
  QUESTION_TYPE_LABEL,
  TEMPLATE_INDUSTRIES,
  sprint3Id,
} from '../data/sprint3';
import { EmptyState, Field, PageHeader, Stat, StatusPill } from '../components/sprint3/Sprint3UI';

const EMPTY_QUESTION = () => ({
  id: sprint3Id('q'),
  label: '',
  type: 'text',
  required: false,
  options: [],
});

const EMPTY_FORM = {
  name: '',
  industry: TEMPLATE_INDUSTRIES[0],
  description: '',
  questions: [EMPTY_QUESTION()],
};

function normalizeOptions(text) {
  return String(text ?? '')
    .split('\n')
    .map((option) => option.trim())
    .filter(Boolean);
}

export default function TemplateLibraryPage() {
  const { templates, saveTemplate, deleteTemplate, role, t } = useSprint3();
  const { toast, showToast } = useToast(4500);

  const [query, setQuery] = useState('');
  const [industry, setIndustry] = useState('all');
  const [editor, setEditor] = useState(null); // { id?, name, industry, description, questions }
  const [optionDrafts, setOptionDrafts] = useState({});
  const [errors, setErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  const canManage = role === 'admin';

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return templates
      .filter((template) => industry === 'all' || template.industry === industry)
      .filter(
        (template) =>
          !needle ||
          [template.name, template.industry, template.description]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(needle),
      );
  }, [templates, query, industry]);

  const totalQuestions = templates.reduce(
    (sum, template) => sum + (template.questions?.length ?? 0),
    0,
  );

  const openCreate = () => {
    setEditor({ ...EMPTY_FORM, questions: [EMPTY_QUESTION()] });
    setOptionDrafts({});
    setErrors({});
  };

  const openEdit = (template) => {
    setEditor({
      id: template.id,
      name: template.name,
      industry: template.industry,
      description: template.description ?? '',
      questions: (template.questions ?? []).map((question) => ({ ...question })),
    });
    setOptionDrafts(
      (template.questions ?? []).reduce((drafts, question) => {
        drafts[question.id] = (question.options ?? []).join('\n');
        return drafts;
      }, {}),
    );
    setErrors({});
  };

  const updateQuestion = (questionId, patch) => {
    setEditor((prev) => ({
      ...prev,
      questions: prev.questions.map((question) =>
        question.id === questionId ? { ...question, ...patch } : question,
      ),
    }));
  };

  const addQuestion = () => {
    setEditor((prev) => ({ ...prev, questions: [...prev.questions, EMPTY_QUESTION()] }));
  };

  const removeQuestion = (questionId) => {
    setEditor((prev) => ({
      ...prev,
      questions:
        prev.questions.length === 1
          ? prev.questions
          : prev.questions.filter((question) => question.id !== questionId),
    }));
    setOptionDrafts((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  const moveQuestion = (index, direction) => {
    setEditor((prev) => {
      const next = [...prev.questions];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...prev, questions: next };
    });
  };

  const handleSave = () => {
    if (!editor) return;
    const nextErrors = {};

    if (!editor.name.trim()) nextErrors.name = t('Template name is required.');

    const cleanQuestions = editor.questions.map((question) => ({
      ...question,
      label: question.label.trim(),
      options:
        question.type === 'single' || question.type === 'multi'
          ? normalizeOptions(optionDrafts[question.id] ?? (question.options ?? []).join('\n'))
          : [],
    }));

    if (!cleanQuestions.length) nextErrors.questions = t('Add at least one question.');
    if (cleanQuestions.some((question) => !question.label)) {
      nextErrors.questions = t('Every question needs a label.');
    }
    if (
      cleanQuestions.some(
        (question) =>
          (question.type === 'single' || question.type === 'multi') &&
          question.options.length < 2,
      )
    ) {
      nextErrors.questions = t('Choice questions need at least two options.');
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const saved = saveTemplate({
      id: editor.id,
      name: editor.name.trim(),
      industry: editor.industry,
      description: editor.description.trim(),
      questions: cleanQuestions,
    });

    setEditor(null);
    showToast(
      saved && editor.id
        ? t('Template updated.')
        : t('Template created and ready to dispatch.'),
      'success',
    );
  };

  return (
    <div className="page-screen s3-page">
      <PageHeader
        eyebrow={t('Template Library')}
        title={t('Template Library')}
        description={t(
          'Build the questionnaire library once, then dispatch the right template to every brand.',
        )}
      />

      <div className="s3-stats">
        <Stat label={t('Templates')} value={templates.length} note={t('In the library')} />
        <Stat label={t('Questions')} value={totalQuestions} note={t('Across all templates')} />
        <Stat
          label={t('Industries')}
          value={new Set(templates.map((item) => item.industry)).size}
          note={t('Covered by the library')}
        />
      </div>

      <section className="s3-toolbar">
        <label className="s3-search">
          <svg aria-hidden="true" className="icon">
            <use href="#i-search" />
          </svg>
          <input
            type="search"
            className="form-input"
            placeholder={t('Search templates…')}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <span className="form-select-wrap s3-toolbar__select">
          <select
            className="form-select"
            value={industry}
            onChange={(event) => setIndustry(event.target.value)}
            aria-label={t('Filter by industry')}
          >
            <option value="all">{t('All industries')}</option>
            {TEMPLATE_INDUSTRIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <svg aria-hidden="true" className="icon">
            <use href="#i-chevron" />
          </svg>
        </span>
      </section>

      {filtered.length ? (
        <div className="s3-template-grid">
          {filtered.map((template) => (
            <article className="s3-card s3-template-card" key={template.id}>
              <header className="s3-card__head">
                <div>
                  <span className="s3-eyebrow">{template.industry}</span>
                  <h2>{template.name}</h2>
                </div>
                <StatusPill
                  label={`${template.questions?.length ?? 0} ${t('questions')}`}
                  tone="is-purple"
                />
              </header>

              <p className="s3-card__copy">{template.description || t('No description yet.')}</p>

              <ul className="s3-question-preview">
                {(template.questions ?? []).slice(0, 4).map((question) => (
                  <li key={question.id}>
                    <span className={`s3-type-chip is-${question.type}`}>
                      {QUESTION_TYPE_LABEL[question.type] ?? question.type}
                    </span>
                    <span>{question.label}</span>
                    {question.required ? <em>{t('Required')}</em> : null}
                  </li>
                ))}
                {(template.questions?.length ?? 0) > 4 ? (
                  <li className="s3-more">
                    +{(template.questions?.length ?? 0) - 4} {t('more questions')}
                  </li>
                ) : null}
              </ul>

              <footer className="s3-card__foot">
                <span className="s3-muted">
                  {t('Updated')} {new Date(template.updatedAt).toLocaleDateString()}
                </span>
                {canManage ? (
                  <span className="s3-card__actions">
                    <button
                      type="button"
                      className="button button--ghost button--sm"
                      onClick={() => openEdit(template)}
                    >
                      <svg aria-hidden="true" className="icon">
                        <use href="#i-pencil" />
                      </svg>
                      {t('Edit')}
                    </button>
                    <button
                      type="button"
                      className="button button--danger-ghost button--sm"
                      onClick={() => setDeleteTarget(template)}
                    >
                      <svg aria-hidden="true" className="icon">
                        <use href="#i-trash" />
                      </svg>
                      {t('Delete')}
                    </button>
                  </span>
                ) : null}
              </footer>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="#i-file"
          title={t('No templates match this view')}
          text={t('Clear the filters or create a new template for the library.')}
          action={
            canManage ? (
              <button type="button" className="button button--primary" onClick={openCreate}>
                {t('New template')}
              </button>
            ) : null
          }
        />
      )}

      {editor ? (
        <Modal
          isOpen
          onClose={() => setEditor(null)}
          title={editor.id ? t('Edit template') : t('New template')}
          subtitle={t('Questions are reused for every brand you dispatch this template to.')}
          icon="#i-file"
          maxWidth="780px"
          footer={
            <>
              <button type="button" className="button button--ghost" onClick={() => setEditor(null)}>
                {t('Cancel')}
              </button>
              <button type="button" className="button button--primary" onClick={handleSave}>
                {t('Save template')}
              </button>
            </>
          }
        >
          <div className="s3-form-grid">
            <Field label={t('Template name')} required htmlFor="tpl-name">
              <input
                id="tpl-name"
                className="form-input"
                value={editor.name}
                onChange={(event) =>
                  setEditor((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="E-commerce Brand Discovery"
              />
              {errors.name ? <span className="set-error">{errors.name}</span> : null}
            </Field>

            <Field label={t('Industry')} required htmlFor="tpl-industry">
              <span className="form-select-wrap">
                <select
                  id="tpl-industry"
                  className="form-select"
                  value={editor.industry}
                  onChange={(event) =>
                    setEditor((prev) => ({ ...prev, industry: event.target.value }))
                  }
                >
                  {TEMPLATE_INDUSTRIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <svg aria-hidden="true" className="icon">
                  <use href="#i-chevron" />
                </svg>
              </span>
            </Field>

            <Field label={t('Description')} htmlFor="tpl-description">
              <textarea
                id="tpl-description"
                className="form-textarea"
                rows={2}
                value={editor.description}
                onChange={(event) =>
                  setEditor((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder={t('What this questionnaire is used for…')}
              />
            </Field>
          </div>

          <div className="s3-builder">
            <header className="s3-builder__head">
              <div>
                <h3>{t('Questions')}</h3>
                <p>{t('Drag-free ordering: use the arrows to move questions up or down.')}</p>
              </div>
              <button type="button" className="button button--ghost button--sm" onClick={addQuestion}>
                <svg aria-hidden="true" className="icon">
                  <use href="#i-plus" />
                </svg>
                {t('Add question')}
              </button>
            </header>

            {errors.questions ? <span className="set-error">{errors.questions}</span> : null}

            <div className="s3-question-list">
              {editor.questions.map((question, index) => {
                const needsOptions = question.type === 'single' || question.type === 'multi';

                return (
                  <div className="s3-question" key={question.id}>
                    <div className="s3-question__top">
                      <span className="s3-question__index">{index + 1}</span>
                      <input
                        className="form-input"
                        value={question.label}
                        onChange={(event) =>
                          updateQuestion(question.id, { label: event.target.value })
                        }
                        placeholder={t('Question text')}
                        aria-label={t('Question text')}
                      />
                      <span className="form-select-wrap s3-question__type">
                        <select
                          className="form-select"
                          value={question.type}
                          onChange={(event) =>
                            updateQuestion(question.id, { type: event.target.value })
                          }
                          aria-label={t('Question type')}
                        >
                          {QUESTION_TYPES.map((type) => (
                            <option key={type.id} value={type.id}>
                              {t(type.label)}
                            </option>
                          ))}
                        </select>
                        <svg aria-hidden="true" className="icon">
                          <use href="#i-chevron" />
                        </svg>
                      </span>
                    </div>

                    <div className="s3-question__meta">
                      <label className="s3-check">
                        <input
                          type="checkbox"
                          checked={question.required}
                          onChange={(event) =>
                            updateQuestion(question.id, { required: event.target.checked })
                          }
                        />
                        <span>{t('Required')}</span>
                      </label>

                      <span className="s3-question__tools">
                        <button
                          type="button"
                          className="s3-mini-btn"
                          onClick={() => moveQuestion(index, -1)}
                          disabled={index === 0}
                          aria-label={t('Move up')}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="s3-mini-btn"
                          onClick={() => moveQuestion(index, 1)}
                          disabled={index === editor.questions.length - 1}
                          aria-label={t('Move down')}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className="s3-mini-btn is-danger"
                          onClick={() => removeQuestion(question.id)}
                          aria-label={t('Remove question')}
                        >
                          <svg aria-hidden="true" className="icon">
                            <use href="#i-trash" />
                          </svg>
                        </button>
                      </span>
                    </div>

                    {needsOptions ? (
                      <textarea
                        className="form-textarea"
                        rows={3}
                        value={
                          optionDrafts[question.id] ?? (question.options ?? []).join('\n')
                        }
                        onChange={(event) =>
                          setOptionDrafts((prev) => ({
                            ...prev,
                            [question.id]: event.target.value,
                          }))
                        }
                        placeholder={t('One option per line')}
                        aria-label={t('Options')}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </Modal>
      ) : null}

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={t('Delete template?')}
        subtitle={
          deleteTarget
            ? `${deleteTarget.name} ${t('will be removed from the library.')}`
            : ''
        }
        icon="#i-trash"
        iconColor="amber"
        maxWidth="460px"
        footer={
          <>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => setDeleteTarget(null)}
            >
              {t('Cancel')}
            </button>
            <button
              type="button"
              className="button button--danger"
              onClick={() => {
                deleteTemplate(deleteTarget.id);
                setDeleteTarget(null);
                showToast(t('Template deleted.'), 'success');
              }}
            >
              {t('Delete')}
            </button>
          </>
        }
      >
        <p className="modal-copy">
          {t(
            'Sent portals keep their answers; only new dispatches will stop offering this template.',
          )}
        </p>
      </Modal>

      <Toast message={toast?.message} tone={toast?.tone} />
    </div>
  );
}
