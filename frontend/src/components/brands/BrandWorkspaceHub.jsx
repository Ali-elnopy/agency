import React from 'react';

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
    description: 'The approved strategy, drafted by the creator and reviewed by the account manager.',
    icon: '#i-chart',
    tone: 'is-purple',
  },
  {
    id: 'direction',
    label: 'Monthly Plans',
    description: 'Platform and month selectors, plan directions and the content plan.',
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
  {
    id: 'team',
    label: 'Edit Team',
    description: 'The people working on this brand and their roles.',
    icon: '#i-users',
    tone: 'is-amber',
  },
];

export default function BrandWorkspaceHub({ brand, counts, onOpen, onEditTeam }) {
  return (
    <div className="bw-hub">
      <div className="bw-hub-intro">
        <div>
          <span className="bw-hub-hero__eyebrow">Brand Workspace</span>
          <p className="bw-hub-intro__sub">
            Everything about {brand.name} in one place — brief, strategy, monthly plans, assets,
            platforms and the team.
          </p>
        </div>
        <button type="button" className="bw-hub-settings" onClick={onEditTeam} title="Edit team">
          <svg aria-hidden="true" className="icon">
            <use href="#i-settings" />
          </svg>
        </button>
      </div>

      <div className="bw-hub-grid">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            className="bw-hub-card"
            onClick={() => (section.id === 'team' ? onEditTeam() : onOpen(section.id))}
          >
            <span className={`bw-hub-card__icon ${section.tone}`}>
              <svg aria-hidden="true" className="icon">
                <use href={section.icon} />
              </svg>
            </span>
            <strong className="bw-hub-card__title">{section.label}</strong>
            <span className="bw-hub-card__description">{section.description}</span>
            <span className="bw-hub-card__meta">{counts[section.id] ?? ''}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
