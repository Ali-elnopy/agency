import React from 'react';
import Logo from './Logo';

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
  return (
    <aside className="showcase">
      <header className="showcase__top">
        <span className="engine-pill">
          <i />
          Creative Flow Engine 4.2
        </span>

        <span className="showcase__stats">
          99.98% SLA Availability
          <span className="showcase__dot">·</span>
          12.4k Campaigns Live
        </span>
      </header>

      <div className="showcase__hero">
        <Logo className="showcase__art" title="" />

        <blockquote className="showcase__quote">
          <span className="showcase__quote-mark" aria-hidden="true">
            &ldquo;
          </span>
          From brief to <em>impact.</em>
          <span className="showcase__quote-mark" aria-hidden="true">
            &rdquo;
          </span>
        </blockquote>

        <p className="showcase__copy">
          The collaborative engine powering high-velocity agency deliverables and effortless client
          approvals.
        </p>
      </div>

      <div className="showcase__ticker">
        {TICKER.map((row, index) => (
          <ul key={index} className="showcase__row">
            {row.map((item) => (
              <li key={item.label} className={item.tone || undefined}>
                {item.label}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </aside>
  );
}
