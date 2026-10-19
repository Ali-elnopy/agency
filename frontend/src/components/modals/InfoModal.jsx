import React from 'react';
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
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      icon={icon}
      iconColor={iconColor}
      maxWidth="480px"
      footer={
        <button
          type="button"
          className="button button--primary"
          onClick={() => {
            if (onAction) onAction();
            onClose();
          }}
        >
          {actionText}
        </button>
      }
    >
      <div style={{ fontSize: '13.5px', color: 'var(--ink)', lineHeight: '1.6' }}>
        {children}
      </div>
    </Modal>
  );
}
