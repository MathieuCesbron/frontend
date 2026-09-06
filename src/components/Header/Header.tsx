import React from 'react';
import './Header.css';

interface HeaderProps {
  playerId: string;
  isConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({ playerId, isConnected }) => {
  return (
    <div className="top-banner">
      <div className="player-label">
        Playing as: {playerId === '1' ? 'Player 1' : 'Player 2'}
      </div>

      {isConnected ? (
        <div className="connection-indicator connected" aria-hidden />
      ) : (
        <div className="reconnecting">
          <span className="reconnect-text">Reconnecting</span>
          <span className="reconnect-dot" />
        </div>
      )}
    </div>
  );
};
