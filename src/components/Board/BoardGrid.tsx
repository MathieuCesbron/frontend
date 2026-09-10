import React from 'react';

import { GridRow } from '../../types';
import { BoardCell } from './BoardCell';
import './BoardGrid.css';

interface BoardGridProps {
  board: [GridRow, GridRow];
  isP1: boolean;
  isOpponent: boolean;
  animatedInstanceId: string | null;
  activeEffectKeys: Record<string, boolean>;
  activeEffectIds: Record<string, boolean>;
  validMoveFromKeys?: Set<string>;
  selectedMoveFromKey?: string | null;
  validMoveToKeys?: Set<string>;
  attackerKeys?: Set<string>;
  selectedAttackerKey?: string | null;
  attackTargetKeys?: Set<string>;
  cardsDict: Record<number, any>;
  onCellClick: (absRow: number, absCol: number, isOpponent: boolean) => void;
  onHoverCard: (templateId: number | null) => void;
  onHoverAttacker?: (pos: { row: number; col: number } | null) => void;
}

export const BoardGrid: React.FC<BoardGridProps> = ({
  board,
  isP1,
  isOpponent,
  animatedInstanceId,
  activeEffectKeys,
  activeEffectIds,
  validMoveFromKeys,
  selectedMoveFromKey,
  validMoveToKeys,
  attackerKeys,
  selectedAttackerKey,
  attackTargetKeys,
  cardsDict,
  onCellClick,
  onHoverCard,
  onHoverAttacker,
}) => {
  const getAbsoluteCoords = (rowIndex: number, colIndex: number) => {
    let absRow: number;
    let absCol: number;

    if (isP1) {
      absCol = colIndex;
      absRow = isOpponent ? rowIndex : 2 + rowIndex;
    } else {
      absCol = 3 - colIndex;
      absRow = isOpponent ? 3 - rowIndex : 1 - rowIndex;
    }
    return { absRow, absCol };
  };

  const displayedBoard = isP1 ? board : [...board].reverse();

  return (
    <div className="board-grid">
      {displayedBoard.map((row, rowIndex) => {
        const displayedRow = isP1 ? row : [...row].reverse();

        return (
          <div key={rowIndex} className="board-row">
            {displayedRow.map((cell, colIndex) => {
              const { absRow, absCol } = getAbsoluteCoords(rowIndex, colIndex);
              const topCard = cell?.topCard;
              const trapCard = cell?.trapCard;

              const tId = topCard?.instanceId;
              const trId = trapCard?.instanceId;
              const posKey = `${absRow},${absCol}`;

              const isEffectTriggered = Boolean(
                activeEffectKeys[posKey] ||
                  (tId && activeEffectIds[String(tId)]) ||
                  (trId && activeEffectIds[String(trId)])
              );

              const isMoveSelectedSource = selectedMoveFromKey === posKey;
              const isMoveSource =
                Boolean(validMoveFromKeys?.has(posKey)) && !selectedMoveFromKey;
              const isMoveTarget = Boolean(validMoveToKeys?.has(posKey));

              const isAttacker = !isOpponent && Boolean(attackerKeys?.has(posKey));
              const isSelectedAttacker = !isOpponent && selectedAttackerKey === posKey;
              const isAttackTarget = Boolean(attackTargetKeys?.has(posKey));

              return (
                <BoardCell
                  key={colIndex}
                  cell={cell}
                  absRow={absRow}
                  absCol={absCol}
                  isOpponent={isOpponent}
                  animatedInstanceId={animatedInstanceId}
                  isEffectTriggered={isEffectTriggered}
                  isMoveSource={isMoveSource}
                  isMoveSelectedSource={isMoveSelectedSource}
                  isMoveTarget={isMoveTarget}
                  isAttacker={isAttacker}
                  isSelectedAttacker={isSelectedAttacker}
                  isAttackTarget={isAttackTarget}
                  cardsDict={cardsDict}
                  onCellClick={onCellClick}
                  onHoverCard={onHoverCard}
                  onHoverAttacker={onHoverAttacker}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
