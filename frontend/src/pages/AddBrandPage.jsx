import React, { useMemo, useState } from 'react';
import { useBrands } from '../context/brandsStore';
import { useWorkspace } from '../context/workspaceStore';
import { useSprint3 } from '../context/sprint3Store';
import {
  COUNTRIES,
  INDUSTRIES,
  TIMEZONES,
  initialsOf,
  isValidHttpUrl,
  timezoneLabelFor,
} from '../data/brands';

const DEFAULT_COUNTRY = COUNTRIES[0];

const EMPTY_FORM = {
  name: '',
  industry: '',
  country: DEFAULT_COUNTRY.name,
  timezone: DEFAULT_COUNTRY.timezone,
  driveFolderUrl: '',
  clientName: '',
  clientEmail: '',
};

export default function AddBrandPage({ onBack, onSaved }) {
  const { brands, addBrand } = useBrands();
  const { addTeam, setTeamBrands } = useWorkspace();
  const { t } = useSprint3();
  const [form, setForm] = useState(EMPTY_FORM);
  const [createTeam, setCreateTeam] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [createdResult, setCreatedResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const selectedTimezone = useMemo(
    () => TIMEZONES.find((timezone) => timezone.value === form.timezone),
    [form.timezone],
  );

  const update = (key) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const handleCountryChange = (event) => {
    const country = COUNTRIES.find((item) => item.name === event.target.value) ?? DEFAULT_COUNTRY;

    setForm((prev) => ({
      ...prev,
      country: country.name,
      timezone: country.timezone,
    }));
    setErrors((prev) => ({ ...prev, country: '', timezone: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    const name = form.name.trim();
    const industry = form.industry.trim();

    if (!name) {
      nextErrors.name = 'Brand name is required.';
    } else if (name.length > 150) {
      nextErrors.name = 'Brand name must not exceed 150 characters.';
    } else if (
      brands.some((brand) => brand.name.toLowerCase() === name.toLowerCase())
    ) {
      nextErrors.name = 'A brand with this name already exists.';
    }

    if (!industry) nextErrors.industry = 'Industry is required.';
    if (!form.country) nextErrors.country = 'Country is required.';
    if (!form.timezone) nextErrors.timezone = 'Timezone is required.';

    if (form.driveFolderUrl.trim() && !isValidHttpUrl(form.driveFolderUrl.trim())) {
      nextErrors.driveFolderUrl = 'Enter a valid Drive folder URL, starting with http:// or https://.';
    }

    // The API creates the client account together with the brand, so both
    // values are required by POST /brands.
    const clientName = form.clientName.trim();
    const clientEmail = form.clientEmail.trim();

    if (!clientName) nextErrors.clientName = 'Client contact name is required.';
    if (!clientEmail) {
      nextErrors.clientEmail = 'Client email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
      nextErrors.clientEmail = 'Enter a valid client email address.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      const created = await addBrand({
        name,
        industry,
        country: form.country,
        timezone: form.timezone,
        timezoneLabel: timezoneLabelFor(form.timezone),
        driveFolderUrl: form.driveFolderUrl.trim(),
        clientName,
        clientEmail,
      });

      const brand = created?.brand ?? created;
      const clientPassword = created?.clientTemporaryPassword ?? null;

      // Sprint 3: a brand usually needs a squad before strategy work starts.
      // The team is created after the brand so it can be linked immediately.
      if (createTeam) {
        try {
          const team = await addTeam({
            name: teamName.trim() || `${name} Team`,
            description: `Dedicated squad for ${name}.`,
          });

          if (team?.id !== undefined && team?.id !== null) {
            await setTeamBrands(team.id, [brand.id]);
          }
        } catch {
          // The brand exists; the team can be created later from Teams.
        }
      }

      // Keep the user on this screen with the one-time client credentials.
      // The temporary password is never shown again and no email is sent yet.
      setCreatedResult({ brand, clientEmail, clientPassword });
    } catch (error) {
      setSubmitError(error?.message ?? 'Could not create the brand.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(createdResult?.clientPassword ?? '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard unavailable: the password stays visible for manual copy.
    }
  };

  if (createdResult) {
    const { brand, clientEmail: createdEmail, clientPassword } = createdResult;

    return (
      <div className="page-screen brand-form-page">
        <section className="page-head">
          <h1 className="page-head__title">{t('Add Brand')}</h1>
        </section>

        <div className="brand-form-card">
          <h2 style={{ marginTop: 0 }}>✅ {t('Brand created successfully')}</h2>
          <p style={{ color: '#555' }}>
            {t('Brand')} <strong>{brand?.name}</strong> — {createdEmail}
          </p>

          {clientPassword ? (
            <div
              style={{
                border: '1px solid #F0A882',
                background: '#FFF4EC',
                borderRadius: 12,
                padding: '16px 20px',
                marginTop: 16,
              }}
            >
              <strong style={{ display: 'block', marginBottom: 8 }}>
                🔑 {t('Client portal login credentials')} ({t('shown only once')}):
              </strong>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <code
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 14,
                    background: '#fff',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #E5D5C8',
                    wordBreak: 'break-all',
                  }}
                >
                  {createdEmail} / {clientPassword}
                </code>
                <button
                  type="button"
                  className="button button--primary"
                  onClick={handleCopyPassword}
                >
                  {copied ? t('Copied!') : t('Copy password')}
                </button>
              </div>
              <p style={{ marginBottom: 0, color: '#8a5a3b', fontSize: 13 }}>
                ⚠️ {t('Save this password and share it with the client securely. It cannot be recovered later.')}
              </p>
            </div>
          ) : (
            <p style={{ color: '#8a5a3b' }}>
              ⚠️ {t('No client account was created for this brand (offline mode).')}
            </p>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button
              type="button"
              className="button button--primary"
              onClick={() => onSaved?.(brand, t('Brand created successfully.'))}
            >
              {t('Open brand workspace')} →
            </button>
            <button
              type="button"
              className="button"
              onClick={() => {
                setCreatedResult(null);
                setForm(EMPTY_FORM);
                setCreateTeam(false);
                setTeamName('');
              }}
            >
              + {t('Create another brand')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-screen brand-form-page">
      <section className="page-head">
        <h1 className="page-head__title">{t('Add Brand')}</h1>
      </section>

      <form className="brand-form-card" onSubmit={handleSubmit} noValidate>
        <div className="brand-form-preview">
          <span className="cl-brand__mark brand-form-preview__mark is-orange">
            {initialsOf(form.name)}
          </span>
          <div className="brand-form-preview__copy">
            <strong>{form.name.trim() || t('New brand workspace')}</strong>
            <p>
              {form.industry.trim() ? t(form.industry.trim()) : t('Industry')} · {t(form.country)} ·{' '}
              {selectedTimezone?.label.split(' · ')[0] || timezoneLabelFor(form.timezone)}
            </p>
          </div>
          <span className="brand-status is-active">
            <i className="brand-status__dot" aria-hidden="true" />
            {t('Active')}
          </span>
        </div>

        <div className="brand-form-grid">
          <div className="brand-field brand-field--full">
            <label htmlFor="brand-name">
              {t('Brand Name')} <span className="brand-required">*</span>
            </label>
            <input
              id="brand-name"
              className="form-input"
              placeholder={t('e.g. Hyper El Barka')}
              value={form.name}
              onChange={update('name')}
              aria-invalid={Boolean(errors.name)}
              autoFocus
            />
            {errors.name ? <span className="set-error">{t(errors.name)}</span> : null}
          </div>

          <div className="brand-field">
            <label htmlFor="brand-industry">
              {t('Industry')} <span className="brand-required">*</span>
            </label>
            <input
              id="brand-industry"
              className="form-input"
              placeholder={t('e.g. Fashion & Apparel')}
              value={form.industry}
              onChange={update('industry')}
              list="brand-industry-options"
              aria-invalid={Boolean(errors.industry)}
            />
            <datalist id="brand-industry-options">
              {INDUSTRIES.map((industry) => (
                <option key={industry} value={industry} />
              ))}
            </datalist>
            {errors.industry ? <span className="set-error">{t(errors.industry)}</span> : null}
          </div>

          <div className="brand-field">
            <label htmlFor="brand-country">
              {t('Country')} <span className="brand-required">*</span>
            </label>
            <span className="form-select-wrap">
              <select
                id="brand-country"
                className="form-select"
                value={form.country}
                onChange={handleCountryChange}
                aria-invalid={Boolean(errors.country)}
              >
                {COUNTRIES.map((country) => (
                  <option key={country.name} value={country.name}>
                    {t(country.name)}
                  </option>
                ))}
              </select>
              <svg aria-hidden="true" className="icon">
                <use href="#i-chevron" />
              </svg>
            </span>
            {errors.country ? <span className="set-error">{t(errors.country)}</span> : null}
          </div>

          <div className="brand-field">
            <label htmlFor="brand-timezone">
              {t('Timezone')} <span className="brand-required">*</span>
            </label>
            <span className="form-select-wrap">
              <select
                id="brand-timezone"
                className="form-select"
                value={form.timezone}
                onChange={update('timezone')}
                aria-invalid={Boolean(errors.timezone)}
              >
                {TIMEZONES.map((timezone) => (
                  <option key={timezone.value} value={timezone.value}>
                    {timezone.label}
                  </option>
                ))}
              </select>
              <svg aria-hidden="true" className="icon">
                <use href="#i-chevron" />
              </svg>
            </span>
            {errors.timezone ? <span className="set-error">{t(errors.timezone)}</span> : null}
          </div>

          <div className="brand-field">
            <label htmlFor="brand-drive">{t('Google Drive Folder URL')}</label>
            <input
              id="brand-drive"
              type="url"
              className="form-input"
              placeholder="https://drive.google.com/drive/folders/…"
              value={form.driveFolderUrl}
              onChange={update('driveFolderUrl')}
              aria-invalid={Boolean(errors.driveFolderUrl)}
            />
            {errors.driveFolderUrl ? (
              <span className="set-error">{t(errors.driveFolderUrl)}</span>
            ) : (
              <span className="brand-field__hint">
                {t('Shared folder for brand assets, references and final files.')}
              </span>
            )}
          </div>

          <div className="brand-field">
            <label htmlFor="brand-client-name">
              {t('Client Contact Name')} <span className="brand-required">*</span>
            </label>
            <input
              id="brand-client-name"
              className="form-input"
              placeholder={t('e.g. Sarah Jenkins')}
              value={form.clientName}
              onChange={update('clientName')}
              aria-invalid={Boolean(errors.clientName)}
            />
            {errors.clientName ? <span className="set-error">{t(errors.clientName)}</span> : null}
          </div>

          <div className="brand-field">
            <label htmlFor="brand-client-email">
              {t('Client Email')} <span className="brand-required">*</span>
            </label>
            <input
              id="brand-client-email"
              type="email"
              className="form-input"
              placeholder="client@brand.com"
              value={form.clientEmail}
              onChange={update('clientEmail')}
              aria-invalid={Boolean(errors.clientEmail)}
            />
            {errors.clientEmail ? (
              <span className="set-error">{t(errors.clientEmail)}</span>
            ) : (
              <span className="brand-field__hint">
                {t('Used to create the client portal account for this brand.')}
              </span>
            )}
          </div>
        </div>

        <div className="brand-form-note">
          <span className="brand-form-note__icon">
            <svg aria-hidden="true" className="icon">
              <use href="#i-calendar" />
            </svg>
          </span>
          <p>
            {t('The brand starts as Active and appears in the Brands workspace right away. You can create its first monthly plan from the brand dashboard.')}
          </p>
        </div>

        <div className="s3-team-option">
          <label className="s3-check">
            <input
              type="checkbox"
              checked={createTeam}
              onChange={(event) => setCreateTeam(event.target.checked)}
            />
            <span>
              <strong>{t('Create team for this brand')}</strong>
              <small>
                {t('A dedicated squad is created and linked to this brand right away.')}
              </small>
            </span>
          </label>
          {createTeam ? (
            <label className="s3-field">
              <span className="s3-field__label">{t('Team name')}</span>
              <input
                className="form-input"
                value={teamName}
                onChange={(event) => setTeamName(event.target.value)}
                placeholder={`${form.name.trim() || 'Brand'} Team`}
              />
            </label>
          ) : null}
        </div>

        <div className="brand-form__actions">
          {submitError ? <span className="set-error">{t(submitError)}</span> : null}
          <button type="button" className="button button--ghost" onClick={onBack}>
            {t('Cancel')}
          </button>
          <button type="submit" className="button button--primary" disabled={submitting}>
            <svg aria-hidden="true" className="icon">
              <use href="#i-plus" />
            </svg>
            {submitting ? t('Creating…') : t('Create Brand')}
          </button>
        </div>
      </form>
    </div>
  );
}
