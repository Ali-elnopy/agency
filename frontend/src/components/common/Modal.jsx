import React, { useEffect, useId, useRef } from 'react';
import './Modal.css';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon = '#i-plus',
  iconColor = 'orange',
  maxWidth = '540px',
  dismissible = true,
  children,
  footer,
}) {
  const containerRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Escape, focus trap, and focus restoration for keyboard/screen-reader users.
  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocused = document.activeElement;
    const node = containerRef.current;

    const getFocusable = () =>
      Array.from(node?.querySelectorAll(FOCUSABLE) ?? []).filter(
        (element) => element.offsetParent !== null,
      );

    const frame = window.requestAnimationFrame(() => {
      const [first] = getFocusable();
      (first ?? node)?.focus();
    });

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (dismissible) onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab') return;

      const items = getFocusable();
      if (!items.length) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [isOpen, dismissible]);

  // Lock background scroll when modal is open.
  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (!dismissible) return;

    if (containerRef.current && !containerRef.current.contains(e.target)) {
      onCloseRef.current();
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className="modal-container"
        ref={containerRef}
        tabIndex={-1}
        style={{ '--modal-max-width': maxWidth }}
      >
        <header className="modal-header">
          <div className="modal-header__meta">
            <span className={`modal-header__icon chip is-${iconColor}`}>
              <svg aria-hidden="true" className="icon">
                <use href={icon} />
              </svg>
            </span>
            <div>
              <h2 className="modal-header__title" id={titleId}>
                {title}
              </h2>
              {subtitle && <p className="modal-header__sub">{subtitle}</p>}
            </div>
          </div>

          {dismissible && (
            <button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              aria-label="Close dialog"
              title="Close"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </header>

        <div className="modal-body">{children}</div>

        {footer && <footer className="modal-footer">{footer}</footer>}
      </div>
    </div>
  );
}
