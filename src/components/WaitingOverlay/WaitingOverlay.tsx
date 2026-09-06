import React from 'react';
import './WaitingOverlay.css';

interface WaitingOverlayProps {
  message?: string | null;
}

export const WaitingOverlay: React.FC<WaitingOverlayProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="waiting-overlay">
      <div className="waiting-message">{message}</div>
    </div>
  );
};
