import { useState, useMemo, useEffect, useCallback } from 'react';
import { Position, AttackTarget, Card, GridRow } from '../types';

interface UseBattleAttackProps {
  board: [GridRow, GridRow];
  isP1: boolean;
  playerNum: number;
  isMyTurn: boolean;
  isBattlePhase: boolean;
  sendAction: (actionType: string, payload: any) => void;
}

export interface AttackerInfo {
  card: Card;
  pos: Position;
  targets: AttackTarget[];
}

export function useBattleAttack({
  board,
  isP1,
  playerNum,
  isMyTurn,
  isBattlePhase,
  sendAction,
}: UseBattleAttackProps) {
  const [selectedAttackerPos, setSelectedAttackerPos] = useState<Position | null>(null);
  const [hoveredAttackerPos, setHoveredAttackerPos] = useState<Position | null>(null);

  // Compute map of all player cards that can attack
  const attackerMap = useMemo(() => {
    const map = new Map<string, AttackerInfo>();
    if (!board) return map;

    board.forEach((row, rIdx) => {
      row.forEach((tile, cIdx) => {
        const topCard = tile?.topCard;
        if (topCard?.attackTargets && topCard.attackTargets.length > 0) {
          const absRow = isP1 ? 2 + rIdx : rIdx;
          const absCol = cIdx;
          const posKey = `${absRow},${absCol}`;
          map.set(posKey, {
            card: topCard,
            pos: { row: absRow, col: absCol },
            targets: topCard.attackTargets,
          });
        }
      });
    });
    return map;
  }, [board, isP1]);

  const attackerKeys = useMemo(() => new Set(attackerMap.keys()), [attackerMap]);

  const selectedAttackerKey = selectedAttackerPos
    ? `${selectedAttackerPos.row},${selectedAttackerPos.col}`
    : null;
  const hoveredAttackerKey = hoveredAttackerPos
    ? `${hoveredAttackerPos.row},${hoveredAttackerPos.col}`
    : null;

  const activeAttackerKey = selectedAttackerKey || hoveredAttackerKey;

  const attackTargetKeys = useMemo(() => {
    const set = new Set<string>();
    if (!activeAttackerKey) return set;
    const attackerInfo = attackerMap.get(activeAttackerKey);
    if (!attackerInfo?.targets) return set;

    attackerInfo.targets.forEach((target) => {
      if (target.type === 'POSITION' && target.position) {
        set.add(`${target.position.row},${target.position.col}`);
      }
    });
    return set;
  }, [activeAttackerKey, attackerMap]);

  // Reset attacker selection if turn or phase changes
  useEffect(() => {
    if (!isBattlePhase || !isMyTurn) {
      setSelectedAttackerPos(null);
      setHoveredAttackerPos(null);
    }
  }, [isBattlePhase, isMyTurn]);

  // Reset attacker selection if selected card is no longer an attacker
  useEffect(() => {
    if (selectedAttackerKey && !attackerMap.has(selectedAttackerKey)) {
      setSelectedAttackerPos(null);
    }
  }, [selectedAttackerKey, attackerMap]);

  const handleHoverAttacker = useCallback((pos: Position | null) => {
    setHoveredAttackerPos(pos);
  }, []);

  const handleAttackCellClick = useCallback(
    (absRow: number, absCol: number, isOpponent: boolean): boolean => {
      if (!isBattlePhase || !isMyTurn) {
        return false;
      }

      const posKey = `${absRow},${absCol}`;

      // 1. If clicking on one of the valid attack targets
      if (attackTargetKeys.has(posKey)) {
        const attackerInfo = activeAttackerKey ? attackerMap.get(activeAttackerKey) : null;
        if (attackerInfo) {
          sendAction('ATTACK', {
            playerId: playerNum,
            attacker: attackerInfo.pos,
            target: {
              type: 'POSITION',
              position: { row: absRow, col: absCol },
            },
          });
          setSelectedAttackerPos(null);
          setHoveredAttackerPos(null);
          return true;
        }
      }

      // 2. If clicking on one of player's attackers
      if (!isOpponent && attackerMap.has(posKey)) {
        setSelectedAttackerPos((prev) =>
          prev && prev.row === absRow && prev.col === absCol ? null : { row: absRow, col: absCol }
        );
        return true;
      }

      // 3. Clicking elsewhere during battle phase deselects current attacker
      setSelectedAttackerPos(null);
      return true;
    },
    [isBattlePhase, isMyTurn, attackTargetKeys, activeAttackerKey, attackerMap, sendAction, playerNum]
  );

  return {
    attackerKeys,
    selectedAttackerKey,
    attackTargetKeys,
    handleHoverAttacker,
    handleAttackCellClick,
  };
}
