import React, { useState } from 'react';
import Modal from '../common/Modal';
import {
  COUNTRIES,
  INDUSTRIES,
  TIMEZONES,
  timezoneLabelFor,
  isValidHttpUrl,
} from '../../data/brands';
import { useWorkspace } from '../../context/workspaceStore';

export default function EditBrandModal({ brand, onClose, onSave }) {
  const { teams = [], users = [] } = useWorkspace() || {};

  const accountManagers = users.filter(
    (u) => u.active !== false && (u.backendRole === 'ACCOUNT_MANAGER' || u.systemAccess === 'account_manager'),
  );

  const [form, setForm] = useState({
    name: brand?.name ?? '',
    industry: brand?.industry ?? '',
    country: brand?.country ?? COUNTRIES[0].name,
    timezone: brand?.timezone ?? COUNTRIES[0].timezone,
    websiteUrl: brand?.websiteUrl ?? brand?.website ?? '',
    driveFolderUrl: brand?.driveFolderUrl ?? '',
    description: brand?.description ?? '',
    status: brand?.status ?? 'active',
    teamId: brand?.teamId != null ? String(brand.teamId) : '',
    accountManagerId: brand?.accountManagerId != null ? String(brand.accountManagerId) : '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const update = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
    setError('');
  };

  const handleCountryChange = (event) => {
    const country = COUNTRIES.find((item) => item.name === event.target.value) ?? COUNTRIES[0];
    setForm((prev) => ({
      ...prev,
      country: country.name,
      timezone: country.timezone,
    }));
    setErrors((prev) => ({ ...prev, country: '', timezone: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const nextErrors = {};

    if (!name) {
      nextErrors.name = 'Brand name is required.';
    } else if (name.length > 150) {
      nextErrors.name = 'Brand name must not exceed 150 characters.';
    }

    if (form.websiteUrl.trim() && !isValidHttpUrl(form.websiteUrl.trim())) {
      nextErrors.websiteUrl = 'Enter a valid URL (starting with http:// or https://).';
    }

    if (form.driveFolderUrl.trim() && !isValidHttpUrl(form.driveFolderUrl.trim())) {
      nextErrors.driveFolderUrl = 'Enter a valid Drive URL (starting with http:// or https://).';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await onSave({
        name,
        industry: form.industry.trim() || null,
        country: form.country,
        timezone: form.timezone,
        timezoneLabel: timezoneLabelFor(form.timezone),
        websiteUrl: form.websiteUrl.trim() || null,
        website: form.websiteUrl.trim() || null,
        driveFolderUrl: form.driveFolderUrl.trim() || null,
        description: form.description.trim() || null,
        status: form.status,
        teamId: form.teamId ? Number(form.teamId) : null,
        accountManagerId: form.accountManagerId ? Number(form.accountManagerId) : null,
      });
      onClose();
    } catch (err) {
      setError(err?.message || 'Could not update brand. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={submitting ? () => {} : onClose}
      title="Edit Brand"
      subtitle={`Update details, assignments and workspace settings for ${brand.name}.`}
      icon="#i-briefcase"
      iconColor="orange"
      maxWidth="620px"
      dismissible={!submitting}
      footer={
        <>
          <button type="button" className="button button--ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            type="button"
            className="button button--primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            <svg aria-hidden="true" className="icon">
              <use href="#i-check" />
            </svg>
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="stack" style={{ gap: '16px' }}>
        {error ? <div className="modal-error bw-error">{error}</div> : null}

        <div className="form-field">
          <label className="form-label" htmlFor="eb-name">
            Brand Name *
          </label>
          <input
            id="eb-name"
            className={`form-input${errors.name ? ' is-invalid' : ''}`}
            value={form.name}
            onChange={update('name')}
            placeholder="e.g. Acme Studio"
            autoFocus
          />
          {errors.name ? <small className="form-error">{errors.name}</small> : null}
        </div>

        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-field">
            <label className="form-label" htmlFor="eb-industry">
              Industry
            </label>
            <span className="form-select-wrap">
              <select
                id="eb-industry"
                className="form-select"
                value={form.industry}
                onChange={update('industry')}
              >
                <option value="">Select industry…</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </span>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="eb-status">
              Status
            </label>
            <span className="form-select-wrap">
              <select
                id="eb-status"
                className="form-select"
                value={form.status}
                onChange={update('status')}
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="archived">Archived</option>
              </select>
            </span>
          </div>
        </div>

        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-field">
            <label className="form-label" htmlFor="eb-country">
              Country
            </label>
            <span className="form-select-wrap">
              <select
                id="eb-country"
                className="form-select"
                value={form.country}
                onChange={handleCountryChange}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </span>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="eb-timezone">
              Timezone
            </label>
            <span className="form-select-wrap">
              <select
                id="eb-timezone"
                className="form-select"
                value={form.timezone}
                onChange={update('timezone')}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label} ({tz.offset})
                  </option>
                ))}
              </select>
            </span>
          </div>
        </div>

        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-field">
            <label className="form-label" htmlFor="eb-team">
              Assigned Team
            </label>
            <span className="form-select-wrap">
              <select
                id="eb-team"
                className="form-select"
                value={form.teamId}
                onChange={update('teamId')}
              >
                <option value="">No Team Assigned</option>
                {teams.map((t) => (
                  <option key={t.id} value={String(t.id)}>
                    {t.name}
                  </option>
                ))}
              </select>
            </span>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="eb-manager">
              Account Manager
            </label>
            <span className="form-select-wrap">
              <select
                id="eb-manager"
                className="form-select"
                value={form.accountManagerId}
                onChange={update('accountManagerId')}
              >
                <option value="">No Manager Assigned</option>
                {accountManagers.map((am) => (
                  <option key={am.id} value={String(am.id)}>
                    {am.fullName}
                  </option>
                ))}
              </select>
            </span>
          </div>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="eb-website">
            Website URL
          </label>
          <input
            id="eb-website"
            type="url"
            className={`form-input${errors.websiteUrl ? ' is-invalid' : ''}`}
            value={form.websiteUrl}
            onChange={update('websiteUrl')}
            placeholder="https://example.com"
          />
          {errors.websiteUrl ? <small className="form-error">{errors.websiteUrl}</small> : null}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="eb-drive">
            Assets / Google Drive Folder URL
          </label>
          <input
            id="eb-drive"
            type="url"
            className={`form-input${errors.driveFolderUrl ? ' is-invalid' : ''}`}
            value={form.driveFolderUrl}
            onChange={update('driveFolderUrl')}
            placeholder="https://drive.google.com/drive/folders/..."
          />
          {errors.driveFolderUrl ? <small className="form-error">{errors.driveFolderUrl}</small> : null}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="eb-description">
            Description / Overview
          </label>
          <textarea
            id="eb-description"
            className="form-input"
            rows={3}
            value={form.description}
            onChange={update('description')}
            placeholder="Brand brief summary, target audience, brand voice..."
          />
        </div>
      </form>
    </Modal>
  );
}
