import React, { useState } from 'react';
import Toast from '../components/ui/Toast';
import Switch from '../components/ui/Switch';
import useToast from '../hooks/useToast';
import { useSprint3 } from '../context/sprint3Store';
import {
  AI_PROVIDERS,
  NOTIFICATION_CHANNELS,
} from '../data/sprint3';
import { PageHeader, StatusPill } from '../components/sprint3/Sprint3UI';

export default function DecisionSettingsPage() {
  const { settings, updateSettings, role, t } = useSprint3();
  const { toast, showToast } = useToast(4500);
  const canEdit = role === 'admin';

  const [form, setForm] = useState({
    aiProvider: settings.aiProvider ?? 'openai',
    channels: settings.channels ?? ['in_app'],
    autoLink: settings.autoLink !== false,
  });

  const toggleChannel = (channelId) => {
    setForm((prev) => ({
      ...prev,
      channels: prev.channels.includes(channelId)
        ? prev.channels.filter((item) => item !== channelId)
        : [...prev.channels, channelId],
    }));
  };

  const handleSave = () => {
    updateSettings(form);
    showToast(t('Settings saved'), 'success');
  };

  return (
    <div className="page-screen s3-page">
      <PageHeader
        eyebrow={t('Decision Settings')}
        title={t('Decision Settings')}
        description={t(
          'Lock the technical decisions now so the next phase can start without blocking the team.',
        )}
        actions={
          canEdit ? null : <StatusPill label={t('Read only for this role')} tone="is-amber" />
        }
      />

      <div className="s3-settings-grid">
        <section className="s3-card">
          <header className="s3-card__head">
            <div>
              <span className="s3-eyebrow">{t('AI provider')}</span>
              <h2>{t('Who generates the briefs?')}</h2>
              <p className="s3-muted">
                {t('Used by the AI brief generator and the clarifying-question engine.')}
              </p>
            </div>
            <span className="s3-settings-icon">
              <svg aria-hidden="true" className="icon">
                <use href="#i-zap" />
              </svg>
            </span>
          </header>

          <div className="s3-provider-list">
            {AI_PROVIDERS.map((provider) => (
              <label
                key={provider.id}
                className={`s3-provider${form.aiProvider === provider.id ? ' is-on' : ''}`}
              >
                <input
                  type="radio"
                  name="ai-provider"
                  checked={form.aiProvider === provider.id}
                  onChange={() =>
                    setForm((prev) => ({ ...prev, aiProvider: provider.id }))
                  }
                  disabled={!canEdit}
                />
                <span className="s3-provider__mark">{provider.label.slice(0, 2).toUpperCase()}</span>
                <span className="s3-provider__copy">
                  <strong>{provider.label}</strong>
                  <small>{provider.hint}</small>
                </span>
                <span className="s3-radio-dot" aria-hidden="true" />
              </label>
            ))}
          </div>
        </section>

        <section className="s3-card">
          <header className="s3-card__head">
            <div>
              <span className="s3-eyebrow">{t('Notification channels')}</span>
              <h2>{t('Where do we reach the client?')}</h2>
              <p className="s3-muted">
                {t('Active channels receive questionnaire, brief and approval notifications.')}
              </p>
            </div>
            <span className="s3-settings-icon is-green">
              <svg aria-hidden="true" className="icon">
                <use href="#i-bell" />
              </svg>
            </span>
          </header>

          <div className="s3-channel-list">
            {NOTIFICATION_CHANNELS.map((channel) => (
              <div className="s3-channel-row-item" key={channel.id}>
                <span className={`s3-channel-icon is-${channel.id}`}>
                  <svg aria-hidden="true" className="icon">
                    <use
                      href={
                        channel.id === 'email'
                          ? '#i-mail'
                          : channel.id === 'whatsapp'
                            ? '#i-phone'
                            : '#i-bell'
                      }
                    />
                  </svg>
                </span>
                <div>
                  <strong>{t(channel.label)}</strong>
                  <small>{t(channel.description)}</small>
                </div>
                <Switch
                  checked={form.channels.includes(channel.id)}
                  onChange={() => toggleChannel(channel.id)}
                  label={t(channel.label)}
                  disabled={!canEdit}
                />
              </div>
            ))}
          </div>

          <div className="s3-auto-link">
            <div>
              <strong>{t('Auto-link content plans')}</strong>
              <small>
                {t(
                  'When a strategy is approved, fill pillars and platforms into the monthly plan automatically.',
                )}
              </small>
            </div>
            <Switch
              checked={form.autoLink}
              onChange={(next) => setForm((prev) => ({ ...prev, autoLink: next }))}
              label={t('Auto-link content plans')}
              disabled={!canEdit}
            />
          </div>
        </section>
      </div>

      <div className="s3-settings-summary">
        <div>
          <span>{t('AI provider')}</span>
          <strong>
            {AI_PROVIDERS.find((provider) => provider.id === form.aiProvider)?.label}
          </strong>
        </div>
        <div>
          <span>{t('Active channels')}</span>
          <strong>
            {form.channels
              .map(
                (id) =>
                  NOTIFICATION_CHANNELS.find((channel) => channel.id === id)?.label ?? id,
              )
              .join(' · ') || t('None')}
          </strong>
        </div>
        <button
          type="button"
          className="button button--primary"
          onClick={handleSave}
          disabled={!canEdit}
        >
          <svg aria-hidden="true" className="icon">
            <use href="#i-check" />
          </svg>
          {t('Save settings')}
        </button>
      </div>

      <Toast message={toast?.message} tone={toast?.tone} />
    </div>
  );
}
