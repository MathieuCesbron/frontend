import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  const [selectedMoveFrom, setSelectedMoveFrom] = useState<{ row: number; col: number } | null>(null);
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
  const playerNum = isP1 ? 1 : 2;
  const isMyTurn = gameState.activePlayerId === playerNum;
  const isPlayPhase = gameState.phase === 'PLAYPHASE';
  const isBattlePhase = gameState.phase === 'BATTLEPHASE';

  const pendingEffect = gameState.pendingEffect;
  const isMyPendingEffect = Boolean(
    pendingEffect &&
      (String(pendingEffect.playerId) === String(playerId) || pendingEffect.playerId === playerNum)
  );
  const isMoveEffect = Boolean(isMyPendingEffect && pendingEffect?.selectionType === 'MOVE');

  // Clear move selection whenever move effect mode is not active
  useEffect(() => {
    if (!isMoveEffect) {
      setSelectedMoveFrom(null);
    }
  }, [isMoveEffect, pendingEffect]);

  const moveSelections = useMemo(() => {
    if (!isMoveEffect || !pendingEffect?.selections) return [];
    return pendingEffect.selections
      .map((s: any) => {
        const from = s.from || s.From;
        const to = s.to || s.To;
        if (!from || !to) return null;
        const fromRow = from.row !== undefined ? from.row : from.Row;
        const fromCol = from.col !== undefined ? from.col : from.Col;
        const toRow = to.row !== undefined ? to.row : to.Row;
        const toCol = to.col !== undefined ? to.col : to.Col;
        if (
          fromRow === undefined ||
          fromCol === undefined ||
          toRow === undefined ||
          toCol === undefined
        ) {
          return null;
        }
        return {
          from: { row: Number(fromRow), col: Number(fromCol) },
          to: { row: Number(toRow), col: Number(toCol) },
        };
      })
      .filter(
        (m: any): m is { from: { row: number; col: number }; to: { row: number; col: number } } =>
          m !== null
      );
  }, [isMoveEffect, pendingEffect]);

  const validMoveFromKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const m of moveSelections) {
      keys.add(`${m.from.row},${m.from.col}`);
    }
    return keys;
  }, [moveSelections]);

  const selectedMoveFromKey = selectedMoveFrom
    ? `${selectedMoveFrom.row},${selectedMoveFrom.col}`
    : null;

  const validMoveToKeys = useMemo(() => {
    if (!selectedMoveFrom) return new Set<string>();
    const keys = new Set<string>();
    for (const m of moveSelections) {
      if (m.from.row === selectedMoveFrom.row && m.from.col === selectedMoveFrom.col) {
        keys.add(`${m.to.row},${m.to.col}`);
      }
    }
    return keys;
  }, [moveSelections, selectedMoveFrom]);

  const handlePassEffect = () => {
    if (!isMyPendingEffect) return;
    sendAction('RESOLVE_EFFECT', {
      playerId: playerNum,
      passed: true,
    });
    setSelectedMoveFrom(null);
  };

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
    if (isMoveEffect) {
      const clickedKey = `${absRow},${absCol}`;

      if (selectedMoveFrom) {
        // Did the user click on a valid target destination?
        if (validMoveToKeys.has(clickedKey)) {
          sendAction('RESOLVE_EFFECT', {
            playerId: playerNum,
            selection: {
              from: selectedMoveFrom,
              to: { row: absRow, col: absCol },
            },
            passed: false,
          });
          setSelectedMoveFrom(null);
          return;
        }

        // Did the user click on the currently selected source card? Deselect it.
        if (selectedMoveFromKey === clickedKey) {
          setSelectedMoveFrom(null);
          return;
        }

        // Did the user click on another valid source card? Switch selection.
        if (validMoveFromKeys.has(clickedKey)) {
          setSelectedMoveFrom({ row: absRow, col: absCol });
          return;
        }

        // Clicked elsewhere on the board
        setSelectedMoveFrom(null);
        return;
      }

      // No card selected yet: select this source card if valid
      if (validMoveFromKeys.has(clickedKey)) {
        setSelectedMoveFrom({ row: absRow, col: absCol });
      }
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
            validMoveFromKeys={validMoveFromKeys}
            selectedMoveFromKey={selectedMoveFromKey}
            validMoveToKeys={validMoveToKeys}
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
