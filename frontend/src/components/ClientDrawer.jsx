import React from 'react';
import ClientForm from './ClientForm';

/**
 * Right-hand onboarding drawer. The form itself is shared with the standalone
 * edit screen so both stay identical.
 */
export default function ClientDrawer({ open, mode = 'add', initial, onClose, onSave }) {
  React.useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="cl-overlay" role="presentation" onMouseDown={onClose}>
      <aside
        className="cl-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'edit' ? 'Edit client' : 'Add client'}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <ClientForm mode={mode} initial={initial} onCancel={onClose} onSave={onSave} />
      </aside>
    </div>
  );
}
