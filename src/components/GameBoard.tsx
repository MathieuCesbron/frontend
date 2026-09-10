import React, { useState, useCallback } from 'react';
import { PlayerState, GameState } from '../types';
import { GameEvent } from '../events';
import { useSelection } from '../selections';
import { useCardDefinitions } from '../hooks/useCardDefinitions';
import { useBoardEffects } from '../hooks/useBoardEffects';
import { useBattleAttack } from '../hooks/useBattleAttack';
import { WaitingOverlay } from './WaitingOverlay/WaitingOverlay';
import { PlayerSidebar } from './Sidebar/PlayerSidebar';
import { BoardGrid } from './Board/BoardGrid';
import { Hand } from './Hand/Hand';
import { PhaseDivider } from './PhaseControl/PhaseDivider';
import { CardInspector } from './CardInspector/CardInspector';
import './GameBoard.css';

interface GameBoardProps {
  playerId: string;
  gameState: GameState;
  isConnected: boolean;
  sendAction: (actionType: string, payload: any) => void;
  latestEvent: GameEvent | null;
  waitingMessage?: string | null;
}

export default function GameBoard({
  playerId,
  gameState,
  isConnected,
  sendAction,
  latestEvent,
  waitingMessage,
}: GameBoardProps) {
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [hoveredTemplateId, setHoveredTemplateId] = useState<number | null>(null);

  const cardsDict = useCardDefinitions();

  const handleCardPlayed = useCallback(() => {
    setSelectedInstanceId(null);
  }, []);

  const { animatedInstanceId, activeEffectKeys, activeEffectIds } = useBoardEffects(
    latestEvent,
    handleCardPlayed
  );

  const {
    isMyPendingEffect,
    highlights,
    handleCellClick: handleSelectionCellClick,
    handleHandCardClick: handleSelectionHandCardClick,
    handlePassEffect,
  } = useSelection({
    pendingEffect: gameState.pendingEffect,
    playerId,
    sendAction,
  });

  const isP1 = playerId === '1';
  const playerNum = isP1 ? 1 : 2;
  const isMyTurn = gameState.activePlayerId === playerNum;
  const isPlayPhase = gameState.phase === 'PLAYPHASE';
  const isBattlePhase = gameState.phase === 'BATTLEPHASE';

  const {
    attackerKeys,
    selectedAttackerKey,
    attackTargetKeys,
    canDirectAttack,
    handleHoverAttacker,
    handleAttackCellClick,
    handleDirectAttack,
  } = useBattleAttack({
    board: gameState.player.board,
    isP1,
    playerNum,
    isMyTurn,
    isBattlePhase,
    sendAction,
  });

  const handlePhaseButtonClick = () => {
    if (gameState.pendingEffect) {
      if (isMyPendingEffect && gameState.pendingEffect.isOptional) {
        handlePassEffect();
      }
      return;
    }

    if (!isMyTurn) return;

    if (isPlayPhase) {
      if (gameState.turn === 1) {
        sendAction('END_TURN', { playerId: playerNum });
      } else {
        sendAction('TO_BATTLE', { playerId: playerNum });
      }
    } else if (isBattlePhase) {
      sendAction('END_TURN', { playerId: playerNum });
    }
  };

  const handleCellClick = (absRow: number, absCol: number, isOpponent: boolean) => {
    if (isMyPendingEffect) {
      handleSelectionCellClick(absRow, absCol, isOpponent);
      return;
    }

    if (handleAttackCellClick(absRow, absCol, isOpponent)) {
      return;
    }

    if (isOpponent) return;
    if (selectedInstanceId === null) return;

    sendAction('PLAY_CARD', {
      playerId: playerNum,
      instanceId: parseInt(selectedInstanceId, 10),
      position: { row: absRow, col: absCol },
    });
  };

  const renderPlayerSide = (player: PlayerState, isOpponent: boolean) => {
    return (
      <div className={`player-area ${isOpponent ? 'opponent' : 'player'}`}>
        {isOpponent && (
          <Hand
            cards={player.hand}
            isOpponent={true}
            cardsDict={cardsDict}
          />
        )}

        <div className="board-layout">
          <PlayerSidebar player={player} isOpponent={isOpponent} side="left" />

          <BoardGrid
            board={player.board}
            isP1={isP1}
            isOpponent={isOpponent}
            animatedInstanceId={animatedInstanceId}
            activeEffectKeys={activeEffectKeys}
            activeEffectIds={activeEffectIds}
            validMoveFromKeys={highlights.validMoveFromKeys}
            selectedMoveFromKey={highlights.selectedMoveFromKey}
            validMoveToKeys={highlights.validMoveToKeys}
            attackerKeys={attackerKeys}
            selectedAttackerKey={selectedAttackerKey}
            attackTargetKeys={attackTargetKeys}
            isDirectAttackTarget={isOpponent && canDirectAttack}
            cardsDict={cardsDict}
            onCellClick={handleCellClick}
            onDirectAttackClick={handleDirectAttack}
            onHoverCard={setHoveredTemplateId}
            onHoverAttacker={handleHoverAttacker}
          />

          <PlayerSidebar player={player} isOpponent={isOpponent} side="right" />
        </div>

        {!isOpponent && (
          <Hand
            cards={player.hand}
            isOpponent={false}
            selectedInstanceId={selectedInstanceId}
            cardsDict={cardsDict}
            validDiscardIndices={highlights.validDiscardIndices}
            validDiscardInstanceIds={highlights.validDiscardInstanceIds}
            onSelectCard={(id, idx) => {
              if (isMyPendingEffect) {
                const handled = handleSelectionHandCardClick(
                  parseInt(id, 10),
                  idx
                );
                if (handled) return;
              }
              setSelectedInstanceId(
                selectedInstanceId === id ? null : id
              );
            }}
            onHoverCard={setHoveredTemplateId}
          />
        )}
      </div>
    );
  };

  return (
    <div className="game-board-layout">
      <WaitingOverlay message={waitingMessage} />

      <div className={`game-container ${waitingMessage ? 'board-blurred' : ''}`}>
        {renderPlayerSide(gameState.opponent, true)}

        <PhaseDivider
          activePlayerId={gameState.activePlayerId}
          isMyTurn={isMyTurn}
          phase={gameState.phase}
          turn={gameState.turn}
          pendingEffect={gameState.pendingEffect}
          isMyPendingEffect={isMyPendingEffect}
          onPhaseClick={handlePhaseButtonClick}
        />

        {renderPlayerSide(gameState.player, false)}
      </div>

      <CardInspector
        hoveredTemplateId={hoveredTemplateId}
        cardsDict={cardsDict}
        isBlurred={Boolean(waitingMessage)}
      />
    </div>
  );
}
