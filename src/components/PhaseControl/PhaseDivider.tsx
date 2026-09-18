import React from 'react';
import { PendingEffect } from '../../types';
import './PhaseDivider.css';

interface PhaseDividerProps {
  activePlayerId: number;
  isMyTurn: boolean;
  phase: string;
  turn: number;
  pendingEffect?: PendingEffect | null;
  isMyPendingEffect?: boolean;
  isSelectingFusion?: boolean;
  fusionInstruction?: string | null;
  onPhaseClick: () => void;
}

export const PhaseDivider: React.FC<PhaseDividerProps> = ({
  activePlayerId,
  isMyTurn,
  phase,
  turn,
  pendingEffect,
  isMyPendingEffect,
  isSelectingFusion,
  fusionInstruction,
  onPhaseClick,
}) => {
  const isPlayPhase = phase === 'PLAYPHASE';
  const isBattlePhase = phase === 'BATTLEPHASE';

  let phaseButtonLabel: string;
  let isButtonDisabled: boolean;

  if (pendingEffect) {
    if (isMyPendingEffect) {
      phaseButtonLabel = 'Cancel';
      isButtonDisabled = pendingEffect.isMandatory ?? false;
    } else {
      phaseButtonLabel = 'Enemy Turn';
      isButtonDisabled = true;
    }
  } else if (isSelectingFusion) {
    phaseButtonLabel = 'Cancel';
    isButtonDisabled = false;
  } else if (!isMyTurn) {
    phaseButtonLabel = 'Enemy Turn';
    isButtonDisabled = true;
  } else if (isBattlePhase) {
    phaseButtonLabel = 'End Turn';
    isButtonDisabled = false;
  } else if (isPlayPhase) {
    phaseButtonLabel = turn === 1 ? 'End Turn' : 'To Battle';
    isButtonDisabled = false;
  } else {
    phaseButtonLabel = phase;
    isButtonDisabled = !isMyTurn;
  }

  const isCancel = Boolean((pendingEffect && isMyPendingEffect) || isSelectingFusion);

  return (
    <div className="divider-with-phase">
      <div
        className={`center-divider ${
          activePlayerId ? (isMyTurn ? 'active-player' : 'active-opponent') : ''
        }`}
      >
        {fusionInstruction && (
          <div className="divider-message fusion-instruction-message">
            {fusionInstruction}
          </div>
        )}
      </div>
      <button
        className={`phase-button ${isCancel ? 'cancel-button' : ''}`}
        onClick={onPhaseClick}
        disabled={isButtonDisabled}
        aria-label="Game phase"
      >
        {phaseButtonLabel}
      </button>
    </div>
  );
};
