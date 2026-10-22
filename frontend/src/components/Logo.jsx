import React, { useId } from 'react';

// One flowing wave: warm orange on the left, cooling into violet on the right.
const WAVE = 'M7 45C25 15 45 13 59 31C73 49 93 49 109 25';

/**
 * ORVIA brand mark — the single gradient "wave" stroke.
 *
 * One shared component so the mark is identical everywhere it shows up (auth
 * panels, dashboard sidebar, ...). Size it with CSS (`width`) or the `size`
 * prop; the SVG keeps its intrinsic 126 x 70 ratio.
 *
 * Pass `title=""` for purely decorative use (the mark then disappears from the
 * accessibility tree instead of announcing a duplicate "ORVIA").
 */
export default function Logo({ className = '', size, title = 'ORVIA' }) {
  // Gradient ids must be unique: several marks can render on the same page.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const gradient = `orvia-wave-${uid}`;
  const decorative = !title;

  return (
    <svg
      className={`logo-mark${className ? ` ${className}` : ''}`}
      viewBox="0 0 126 70"
      width={size || undefined}
      height={size ? Math.round((size * 70) / 126) : undefined}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : title}
      aria-hidden={decorative ? 'true' : undefined}
      focusable="false"
    >
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="0.35">
          <stop offset="0" stopColor="#ff8b4a" />
          <stop offset="0.42" stopColor="#f4632f" />
          <stop offset="0.6" stopColor="#a86be8" />
          <stop offset="1" stopColor="#6355e0" />
        </linearGradient>
      </defs>

      <path
        d={WAVE}
        fill="none"
        stroke={`url(#${gradient})`}
        strokeWidth="9"
        strokeLinecap="round"
      />
    </svg>
  );
}
