import React from 'react';
import Modal from '../common/Modal';

export default function ConfirmModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon = '#i-alert',
  iconColor = 'red',
  children,
  confirmText = 'Delete',
  onConfirm,
  busy = false,
}) {
  const handleConfirm = async () => {
    if (busy) return;

    const result = onConfirm?.();

    if (result && typeof result.then === 'function') {
      await result;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={busy ? () => {} : onClose}
      title={title}
      subtitle={subtitle}
      icon={icon}
      iconColor={iconColor}
      maxWidth="480px"
      footer={
        <>
          <button type="button" className="ws-btn ws-btn--ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className="ws-btn ws-btn--danger"
            onClick={handleConfirm}
            disabled={busy}
          >
            {busy ? 'Working…' : confirmText}
          </button>
        </>
      }
    >
      {children}
    </Modal>
  );
}
