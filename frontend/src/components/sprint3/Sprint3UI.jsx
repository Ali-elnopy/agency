import React from 'react';

const ROLE_LABEL = {
  admin: 'Admin',
  account_manager: 'Account Manager',
  creative: 'Content Creator',
  client: 'Client',
};

export const ROLE_OPTIONS = [
  { id: 'admin', label: 'Admin' },
  { id: 'account_manager', label: 'Account Manager' },
  { id: 'creative', label: 'Content Creator' },
  { id: 'client', label: 'Client' },
];

export function roleLabel(role) {
  return ROLE_LABEL[role] ?? 'Admin';
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <section className="page-head page-head--actions s3-page-head">
      <div>
        {eyebrow ? <span className="cl-label">{eyebrow}</span> : null}
        <h1 className="page-head__title">{title}</h1>
        {description ? <p className="content-plan__lead">{description}</p> : null}
      </div>
      {actions ? <div className="page-head__actions">{actions}</div> : null}
    </section>
  );
}

export function Stat({ label, value, note, tone }) {
  return (
    <article className="s3-stat">
      <span>{label}</span>
      <strong className={tone ? `is-${tone}` : undefined}>{value}</strong>
      {note ? <small>{note}</small> : null}
    </article>
  );
}

export function EmptyState({ icon = '#i-file', title, text, action }) {
  return (
    <div className="s3-empty">
      <span className="brand-empty__icon">
        <svg aria-hidden="true" className="icon">
          <use href={icon} />
        </svg>
      </span>
      <h3>{title}</h3>
      {text ? <p>{text}</p> : null}
      {action}
    </div>
  );
}

export function StatusPill({ label, tone = 'is-gray' }) {
  return <span className={`pill ${tone}`}>{label}</span>;
}

export function Field({ label, hint, htmlFor, children, required }) {
  return (
    <label className="s3-field" htmlFor={htmlFor}>
      <span className="s3-field__label">
        {label} {required ? <em>*</em> : null}
      </span>
      {children}
      {hint ? <small className="s3-field__hint">{hint}</small> : null}
    </label>
  );
}

export function ModalActions({ children }) {
  return <div className="s3-modal-actions">{children}</div>;
}

export function Icon({ id, className = 'icon' }) {
  return (
    <svg aria-hidden="true" className={className}>
      <use href={id} />
    </svg>
  );
}
