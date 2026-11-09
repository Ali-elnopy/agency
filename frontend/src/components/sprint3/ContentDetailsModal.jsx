import React, { useMemo, useState } from 'react';
import Modal from '../common/Modal';
import { useBrands } from '../../context/brandsStore';
import { useSprint3 } from '../../context/sprint3Store';
import { CONTENT_TYPE_LABEL, TOV_OPTIONS, formatDate } from '../../data/brands';
import { linesOf } from '../../data/sprint3';

export default function ContentDetailsModal({ content, brand, strategy, onClose, onSaved }) {
  const { updateContent } = useBrands();
  const { getContentMeta, saveContentMeta, getCampaigns, t } = useSprint3();
  const meta = getContentMeta(content.id);

  const campaigns = getCampaigns(brand.id);
  const pillars = useMemo(
    () => linesOf(strategy?.sections?.pillars?.body ?? ''),
    [strategy],
  );
  const platforms = useMemo(
    () => Array.from(new Set([...(strategy?.platforms ?? []), meta.platform].filter(Boolean))),
    [strategy, meta.platform],
  );

  const [form, setForm] = useState({
    caption: content.caption ?? '',
    keyMessage: meta.keyMessage ?? '',
    tone: content.tov ?? TOV_OPTIONS[0],
    references: (meta.references ?? []).join('\n'),
    notes: content.notes ?? meta.notes ?? '',
    pillar: meta.pillar ?? content.pillar ?? '',
    campaignId: meta.campaignId ?? content.campaignId ?? '',
    platform: meta.platform ?? content.platform ?? '',
    attachments: meta.attachments ?? [],
  });

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const persist = (detailsStatus) => {
    const references = linesOf(form.references);
    updateContent(content.id, {
      caption: form.caption.trim(),
      notes: form.notes.trim(),
      tov: form.tone,
      pillar: form.pillar,
      campaignId: form.campaignId,
      platform: form.platform,
      keyMessage: form.keyMessage.trim(),
      references,
      attachments: form.attachments,
      detailsStatus,
    });
    saveContentMeta(content.id, {
      pillar: form.pillar,
      campaignId: form.campaignId,
      platform: form.platform,
      keyMessage: form.keyMessage.trim(),
      tone: form.tone,
      references,
      notes: form.notes.trim(),
      attachments: form.attachments,
      detailsStatus,
    });
    onSaved?.(detailsStatus);
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={content.title}
      subtitle={`${brand.name} · ${CONTENT_TYPE_LABEL[content.type] ?? content.type} · ${formatDate(
        content.publishDate,
      )}`}
      icon="#i-pencil"
      maxWidth="760px"
      footer={
        <>
          <button type="button" className="button button--ghost" onClick={onClose}>
            {t('Cancel')}
          </button>
          <button
            type="button"
            className="button button--ghost"
            onClick={() => persist('draft')}
          >
            {t('Save draft')}
          </button>
          <button
            type="button"
            className="button button--primary"
            onClick={() => persist('saved')}
          >
            <svg aria-hidden="true" className="icon">
              <use href="#i-check" />
            </svg>
            {t('Save details')}
          </button>
        </>
      }
    >
      <div className="s3-details-grid">
        <label className="s3-field s3-field--full">
          <span className="s3-field__label">{t('Caption')}</span>
          <textarea
            className="form-textarea"
            rows={4}
            value={form.caption}
            onChange={(event) => update('caption', event.target.value)}
            placeholder={t('The final caption the audience will read…')}
          />
        </label>

        <label className="s3-field">
          <span className="s3-field__label">{t('Key message')}</span>
          <input
            className="form-input"
            value={form.keyMessage}
            onChange={(event) => update('keyMessage', event.target.value)}
            placeholder={t('One sentence the post must land')}
          />
        </label>

        <label className="s3-field">
          <span className="s3-field__label">{t('Tone')}</span>
          <span className="form-select-wrap">
            <select
              className="form-select"
              value={form.tone}
              onChange={(event) => update('tone', event.target.value)}
            >
              {TOV_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <svg aria-hidden="true" className="icon">
              <use href="#i-chevron" />
            </svg>
          </span>
        </label>

        <label className="s3-field">
          <span className="s3-field__label">{t('Pillar')}</span>
          <span className="form-select-wrap">
            <select
              className="form-select"
              value={form.pillar}
              onChange={(event) => update('pillar', event.target.value)}
            >
              <option value="">{t('No pillar')}</option>
              {Array.from(new Set([...pillars, form.pillar].filter(Boolean))).map((pillar) => (
                <option key={pillar} value={pillar}>
                  {pillar}
                </option>
              ))}
            </select>
            <svg aria-hidden="true" className="icon">
              <use href="#i-chevron" />
            </svg>
          </span>
        </label>

        <label className="s3-field">
          <span className="s3-field__label">{t('Platform')}</span>
          <span className="form-select-wrap">
            <select
              className="form-select"
              value={form.platform}
              onChange={(event) => update('platform', event.target.value)}
            >
              <option value="">{t('No platform')}</option>
              {platforms.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
            <svg aria-hidden="true" className="icon">
              <use href="#i-chevron" />
            </svg>
          </span>
        </label>

        <label className="s3-field s3-field--full">
          <span className="s3-field__label">{t('Campaign')}</span>
          <span className="form-select-wrap">
            <select
              className="form-select"
              value={form.campaignId}
              onChange={(event) => update('campaignId', event.target.value)}
            >
              <option value="">{t('Not in a campaign')}</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>
            <svg aria-hidden="true" className="icon">
              <use href="#i-chevron" />
            </svg>
          </span>
          <small className="s3-field__hint">
            {t('An item can belong to one campaign at most.')}
          </small>
        </label>

        <label className="s3-field s3-field--full">
          <span className="s3-field__label">{t('References')}</span>
          <textarea
            className="form-textarea"
            rows={3}
            value={form.references}
            onChange={(event) => update('references', event.target.value)}
            placeholder={t('One reference per line')}
          />
        </label>

        <label className="s3-field s3-field--full">
          <span className="s3-field__label">{t('Notes')}</span>
          <textarea
            className="form-textarea"
            rows={3}
            value={form.notes}
            onChange={(event) => update('notes', event.target.value)}
            placeholder={t('Internal notes for the production team…')}
          />
        </label>

        <div className="s3-field s3-field--full">
          <span className="s3-field__label">{t('Attachments')}</span>
          <div className="s3-attachments">
            {form.attachments.map((file) => (
              <span className="s3-attachment" key={file.name}>
                <svg aria-hidden="true" className="icon">
                  <use href="#i-file" />
                </svg>
                <span>{file.name}</span>
                <small>{file.size}</small>
                <button
                  type="button"
                  className="s3-mini-btn is-danger"
                  onClick={() =>
                    update(
                      'attachments',
                      form.attachments.filter((item) => item.name !== file.name),
                    )
                  }
                  aria-label={`${t('Remove')} ${file.name}`}
                >
                  ×
                </button>
              </span>
            ))}
            <label className="s3-file-inline">
              <input
                type="file"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  update('attachments', [
                    ...form.attachments,
                    {
                      name: file.name,
                      size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
                    },
                  ]);
                  event.target.value = '';
                }}
              />
              <svg aria-hidden="true" className="icon">
                <use href="#i-upload" />
              </svg>
              {t('Add attachment')}
            </label>
          </div>
        </div>
      </div>
    </Modal>
  );
}
