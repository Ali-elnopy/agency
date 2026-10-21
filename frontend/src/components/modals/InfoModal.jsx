import React, { useState } from 'react';
import Modal from '../common/Modal';

export default function InfoModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon = '#i-check',
  iconColor = 'orange',
  children,
  actionText = 'Got it',
  onAction,
  closeOnAction = true,
  actionDisabled = false,
  actionBusy = false,
}) {
  const [running, setRunning] = useState(false);
  const busy = running || actionBusy;

  const handleAction = async () => {
    if (actionDisabled || busy) return;

    if (!onAction) {
      onClose();
      return;
    }

    const result = onAction();

    if (result && typeof result.then === 'function') {
      setRunning(true);
      try {
        await result;
        if (closeOnAction) onClose();
      } finally {
        setRunning(false);
      }
      return;
    }

    if (closeOnAction) onClose();
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
        <button
          type="button"
          className="button button--primary"
          onClick={handleAction}
          disabled={actionDisabled || busy}
          aria-busy={busy}
        >
          {actionText}
        </button>
      }
    >
      <div className="modal-lead">{children}</div>
    </Modal>
  );
}
