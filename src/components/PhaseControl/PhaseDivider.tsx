import React from 'react';
import './PhaseDivider.css';

interface PhaseDividerProps {
  activePlayerId: number;
  isMyTurn: boolean;
  phase: string;
  turn: number;
  onPhaseClick: () => void;
}

export const PhaseDivider: React.FC<PhaseDividerProps> = ({
  activePlayerId,
  isMyTurn,
  phase,
  turn,
  onPhaseClick,
}) => {
  const isPlayPhase = phase === 'PLAYPHASE';
  const isBattlePhase = phase === 'BATTLEPHASE';

  const phaseButtonLabel = !isMyTurn
    ? 'Enemy Turn'
    : isBattlePhase
    ? 'End Turn'
    : isPlayPhase
    ? turn === 1
      ? 'End Turn'
      : 'To Battle'
    : phase;

  return (
    <div className="divider-with-phase">
      <div
        className={`center-divider ${
          activePlayerId ? (isMyTurn ? 'active-player' : 'active-opponent') : ''
        }`}
      />
      <button
        className="phase-button"
        onClick={onPhaseClick}
        disabled={!isMyTurn}
        aria-label="Game phase"
      >
        {phaseButtonLabel}
      </button>
    </div>
  );
};
