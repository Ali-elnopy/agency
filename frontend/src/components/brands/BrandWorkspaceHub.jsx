import React from 'react';
import { useSprint3 } from '../../context/sprint3Store';

const SECTIONS = [
  {
    id: 'brief',
    label: 'Brand Brief',
    description: 'Client data, the collected Q&A and every brief file version.',
    icon: '#i-file',
    tone: 'is-orange',
  },
  {
    id: 'strategy',
    label: 'Content Strategy',
    description: 'The approved strategy file, preview, upload and review workflow.',
    icon: '#i-chart',
    tone: 'is-purple',
  },
  {
    id: 'content',
    label: 'Content Management',
    description: 'Monthly content plans, campaigns, platforms and content items.',
    icon: '#i-calendar',
    tone: 'is-green',
  },
  {
    id: 'assets',
    label: 'Files & Assets',
    description: 'Logo, visual identity, videos, designs and the rest of the library.',
    icon: '#i-layers',
    tone: 'is-blue',
  },
  {
    id: 'social',
    label: 'Social Media Platforms',
    description: 'Every channel the brand publishes on, with its goals and content types.',
    icon: '#i-globe',
    tone: 'is-pink',
  },
];

export default function BrandWorkspaceHub({ brand, counts, onOpen }) {
  const { t } = useSprint3();

  return (
    <div className="bw-hub">
      <div className="bw-hub-intro">
        <span className="bw-hub-hero__eyebrow">{t('Brand Workspace')}</span>
        <p className="bw-hub-intro__sub">
          {t('Everything about')} {t(brand.name)} {t('in one place — brief, strategy, monthly plans, assets and platforms. Team membership is managed from the Teams screen.')}
        </p>
      </div>

      <div className="bw-hub-grid">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            className="bw-hub-card"
            onClick={() => onOpen(section.id)}
          >
            <span className={`bw-hub-card__icon ${section.tone}`}>
              <svg aria-hidden="true" className="icon">
                <use href={section.icon} />
              </svg>
            </span>
            <strong className="bw-hub-card__title">{t(section.label)}</strong>
            <span className="bw-hub-card__description">{t(section.description)}</span>
            <span className="bw-hub-card__meta">{t(counts[section.id] ?? '')}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
