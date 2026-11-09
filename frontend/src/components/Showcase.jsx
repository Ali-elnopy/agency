import React from 'react';
import Logo from './Logo';
import { useSprint3 } from '../context/sprint3Store';

// Two rows of workflow words, exactly as the design's bottom ticker shows them.
const TICKER = [
  [
    { label: 'Clients' },
    { label: 'Teams' },
    { label: 'Workflow' },
    { label: 'Review', tone: 'is-orange' },
  ],
  [{ label: 'Approvals', tone: 'is-teal' }, { label: 'Analyze' }],
];

export default function Showcase() {
  const { t } = useSprint3();

  return (
    <aside className="showcase">
      <header className="showcase__top">
        <span className="engine-pill">
          <i />
          {t('Creative Flow Engine 4.2')}
        </span>

        <span className="showcase__stats">
          {t('99.98% SLA Availability')}
          <span className="showcase__dot">·</span>
          {t('12.4k Campaigns Live')}
        </span>
      </header>

      <div className="showcase__hero">
        <Logo className="showcase__art" title="" />

        <blockquote className="showcase__quote">
          <span className="showcase__quote-mark" aria-hidden="true">
            &ldquo;
          </span>
          {t('From brief to')} <em>{t('impact.')}</em>
          <span className="showcase__quote-mark" aria-hidden="true">
            &rdquo;
          </span>
        </blockquote>

        <p className="showcase__copy">
          {t('The collaborative engine powering high-velocity agency deliverables and effortless client approvals.')}
        </p>
      </div>

      <div className="showcase__ticker">
        {TICKER.map((row, index) => (
          <ul key={index} className="showcase__row">
            {row.map((item) => (
              <li key={item.label} className={item.tone || undefined}>
                {t(item.label)}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </aside>
  );
}
