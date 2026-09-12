import React, { useState, useCallback, useEffect } from 'react';
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
  const [activeModal, setActiveModal] = useState<'opponent-grave' | 'player-grave' | 'player-fusion' | null>(null);

  const cardsDict = useCardDefinitions();

  useEffect(() => {
    if (gameState.player.fusionDeck?.length) {
      gameState.player.fusionDeck.forEach((c) => {
        if (c.pattern && cardsDict[c.templateId] && !cardsDict[c.templateId].pattern) {
          cardsDict[c.templateId].pattern = c.pattern;
        }
      });
    }
  }, [gameState.player.fusionDeck, cardsDict]);

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

  // The server sends an absolute 4-row board. Slice the viewer's
  // side (2 rows) to keep existing hooks/components unchanged.
  const playerSideBoard = isP1
    ? (gameState.player.board.slice(2, 4) as [any, any])
    : (gameState.player.board.slice(0, 2) as [any, any]);

  const {
    attackerKeys,
    selectedAttackerKey,
    attackTargetKeys,
    canDirectAttack,
    handleHoverAttacker,
    handleAttackCellClick,
    handleDirectAttack,
  } = useBattleAttack({
    board: playerSideBoard,
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
    // Determine which two absolute rows to display for this side.
    const start = isP1 === isOpponent ? 0 : 2;
    const boardForGrid = player.board.slice(start, start + 2) as [any, any];
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
          <PlayerSidebar
            player={player}
            isOpponent={isOpponent}
            side="left"
            cardsDict={cardsDict}
            onHoverCard={setHoveredTemplateId}
            isFusionOpen={!isOpponent && activeModal === 'player-fusion'}
            onToggleFusion={() =>
              setActiveModal((prev) => (prev === 'player-fusion' ? null : 'player-fusion'))
            }
            onCloseFusion={() => setActiveModal(null)}
          />

          <BoardGrid
            board={boardForGrid}
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

          <PlayerSidebar
            player={player}
            isOpponent={isOpponent}
            side="right"
            cardsDict={cardsDict}
            onHoverCard={setHoveredTemplateId}
            isGraveOpen={isOpponent ? activeModal === 'opponent-grave' : activeModal === 'player-grave'}
            onToggleGrave={() =>
              setActiveModal((prev) =>
                prev === (isOpponent ? 'opponent-grave' : 'player-grave')
                  ? null
                  : isOpponent
                  ? 'opponent-grave'
                  : 'player-grave'
              )
            }
            onCloseGrave={() => setActiveModal(null)}
          />
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

      <CardInspector
        hoveredTemplateId={hoveredTemplateId}
        cardsDict={cardsDict}
        isBlurred={Boolean(waitingMessage)}
      />

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
    </div>
  );
}
