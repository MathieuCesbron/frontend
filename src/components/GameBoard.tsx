import React, { useState, useEffect, useRef } from 'react';
import { PlayerState, GameState } from '../types';
import { GameEvent } from '../events';
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
  const [animatedInstanceId, setAnimatedInstanceId] = useState<string | null>(null);
  const [activeEffectKeys, setActiveEffectKeys] = useState<Record<string, boolean>>({});
  const [activeEffectIds, setActiveEffectIds] = useState<Record<string, boolean>>({});
  const [cardsDict, setCardsDict] = useState<Record<number, any>>({});
  const [hoveredTemplateId, setHoveredTemplateId] = useState<number | null>(null);
  const effectTimersRef = useRef<number[]>([]);

  useEffect(() => {
    fetch('/cards.json')
      .then((res) => res.json())
      .then((data) => {
        const dict: Record<number, any> = {};
        data.forEach((c: any) => {
          dict[c.templateId] = c;
        });
        setCardsDict(dict);
      })
      .catch((err) => console.error('Could not load card data', err));
  }, []);

  useEffect(() => {
    if (!latestEvent) return;

    if (latestEvent.type === 'CARD_PLAYED') {
      const { instanceId } = latestEvent.data;
      setAnimatedInstanceId(String(instanceId));
      setTimeout(() => setAnimatedInstanceId(null), 1000);
      setSelectedInstanceId(null);
    } else if (latestEvent.type === 'EFFECT_TRIGGERED') {
      const { position, instanceId } = latestEvent.data || {};
      const timers: number[] = [];

      if (position && position.row !== undefined && position.col !== undefined) {
        const posKey = `${position.row},${position.col}`;
        setActiveEffectKeys((prev) => ({ ...prev, [posKey]: true }));
        const timer = window.setTimeout(() => {
          setActiveEffectKeys((prev) => {
            const next = { ...prev };
            delete next[posKey];
            return next;
          });
        }, 2000);
        timers.push(timer);
      }

      if (instanceId !== undefined && instanceId !== -1) {
        const idKey = String(instanceId);
        setActiveEffectIds((prev) => ({ ...prev, [idKey]: true }));
        const timer = window.setTimeout(() => {
          setActiveEffectIds((prev) => {
            const next = { ...prev };
            delete next[idKey];
            return next;
          });
        }, 2000);
        timers.push(timer);
      }

      effectTimersRef.current.push(...timers);
    }
  }, [latestEvent]);

  useEffect(() => {
    return () => {
      effectTimersRef.current.forEach(clearTimeout);
      effectTimersRef.current = [];
    };
  }, []);

  const isP1 = playerId === '1';
  const isMyTurn = gameState.activePlayerId === parseInt(playerId, 10);
  const isPlayPhase = gameState.phase === 'PLAYPHASE';
  const isBattlePhase = gameState.phase === 'BATTLEPHASE';

  const handlePhaseButtonClick = () => {
    if (!isMyTurn) return;

    if (isPlayPhase) {
      if (gameState.turn === 1) {
        sendAction('END_TURN', { playerId: parseInt(playerId, 10) });
      } else {
        sendAction('TO_BATTLE', { playerId: parseInt(playerId, 10) });
      }
    } else if (isBattlePhase) {
      sendAction('END_TURN', { playerId: parseInt(playerId, 10) });
    }
  };

  const handleCellClick = (absRow: number, absCol: number, isOpponent: boolean) => {
    if (isOpponent) return;
    if (selectedInstanceId === null) return;

    sendAction('PLAY_CARD', {
      playerId: isP1 ? 1 : 2,
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
            cardsDict={cardsDict}
            onCellClick={handleCellClick}
            onHoverCard={setHoveredTemplateId}
          />

          <PlayerSidebar player={player} isOpponent={isOpponent} side="right" />
        </div>

        {!isOpponent && (
          <Hand
            cards={player.hand}
            isOpponent={false}
            selectedInstanceId={selectedInstanceId}
            cardsDict={cardsDict}
            onSelectCard={(id) => setSelectedInstanceId(selectedInstanceId === id ? null : id)}
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
