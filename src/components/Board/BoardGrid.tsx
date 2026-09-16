import React from 'react';

import { BOARD_COLS, GridRow } from '../../types';
import { BoardCell } from './BoardCell';
import './BoardGrid.css';

interface BoardGridProps {
  board: [GridRow, GridRow];
  isP1: boolean;
  isOpponent: boolean;
  columnsDestroyed?: boolean[];
  animatedInstanceId: string | null;
  activeEffectKeys: Record<string, boolean>;
  activeEffectIds: Record<string, boolean>;
  validMoveFromKeys?: Set<string>;
  selectedMoveFromKey?: string | null;
  validMoveToKeys?: Set<string>;
  attackerKeys?: Set<string>;
  selectedAttackerKey?: string | null;
  attackTargetKeys?: Set<string>;
  attackColumnTargets?: Set<number>;
  isDirectAttackTarget?: boolean;
  fusionMaterialKeys?: Set<string>;
  selectedFusionMaterialKeys?: Set<string>;
  fusionSpawnTargetKeys?: Set<string>;
  cardsDict: Record<number, any>;
  onCellClick: (absRow: number, absCol: number, isOpponent: boolean) => void;
  onColumnClick?: (absCol: number) => void;
  onDirectAttackClick?: () => void;
  onHoverCard: (templateId: number | null, effectivePower?: number | null) => void;
  onHoverAttacker?: (pos: { row: number; col: number } | null) => void;
}

export const BoardGrid: React.FC<BoardGridProps> = ({
  board,
  isP1,
  isOpponent,
  columnsDestroyed,
  animatedInstanceId,
  activeEffectKeys,
  activeEffectIds,
  validMoveFromKeys,
  selectedMoveFromKey,
  validMoveToKeys,
  attackerKeys,
  selectedAttackerKey,
  attackTargetKeys,
  attackColumnTargets,
  isDirectAttackTarget,
  fusionMaterialKeys,
  selectedFusionMaterialKeys,
  fusionSpawnTargetKeys,
  cardsDict,
  onCellClick,
  onColumnClick,
  onDirectAttackClick,
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
      absCol = BOARD_COLS - 1 - colIndex;
      absRow = isOpponent ? 3 - rowIndex : 1 - rowIndex;
    }
    return { absRow, absCol };
  };

  const displayedBoard = isP1 ? board : [...board].reverse();
  const showDirectAttackGlow = Boolean(isOpponent && isDirectAttackTarget);

  return (
    <div
      className={`board-grid ${showDirectAttackGlow ? 'is-direct-attack-target' : ''}`}
      onClick={(e) => {
        if (showDirectAttackGlow && onDirectAttackClick) {
          if (e.target === e.currentTarget) {
            onDirectAttackClick();
          }
        }
      }}
    >
      {isOpponent && (
        <div className="column-indicators-row opponent">
          {Array.from({ length: BOARD_COLS }, (_, colIndex) => {
            const absCol = isP1 ? colIndex : BOARD_COLS - 1 - colIndex;
            const isColumnTarget = Boolean(attackColumnTargets?.has(absCol));
            const isDestroyed = Boolean(columnsDestroyed?.[absCol]);

            return (
              <div
                key={colIndex}
                className={`column-indicator-cell ${isColumnTarget ? 'is-column-attack-target' : ''}`}
                onClick={(e) => {
                  if (isColumnTarget && onColumnClick) {
                    e.stopPropagation();
                    onColumnClick(absCol);
                  }
                }}
              >
                <div className="column-dot-wrapper">
                  <div
                    className={`column-dot ${isDestroyed ? 'is-destroyed' : ''} ${
                      isColumnTarget ? 'is-attack-target' : ''
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {displayedBoard.map((row, rowIndex) => {
        const displayedRow = isP1 ? row : [...row].reverse();

        return (
          <div key={rowIndex} className="board-row">
            {displayedRow.map((cell, colIndex) => {
              const { absRow, absCol } = getAbsoluteCoords(rowIndex, colIndex);
              const topCard = cell?.topCard;
                const shadowCard = cell?.shadowCard;

              const tId = topCard?.instanceId;
                const trId = shadowCard?.instanceId;
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
              const isColumnAttackTarget = Boolean(isOpponent && attackColumnTargets?.has(absCol));

              const isFusionMaterial = !isOpponent && Boolean(fusionMaterialKeys?.has(posKey));
              const isSelectedFusionMaterial = !isOpponent && Boolean(selectedFusionMaterialKeys?.has(posKey));
              const isFusionSpawnTarget = !isOpponent && Boolean(fusionSpawnTargetKeys?.has(posKey));

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
                  isColumnAttackTarget={isColumnAttackTarget}
                  isFusionMaterial={isFusionMaterial}
                  isSelectedFusionMaterial={isSelectedFusionMaterial}
                  isFusionSpawnTarget={isFusionSpawnTarget}
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

      {!isOpponent && (
        <div className="column-indicators-row player">
          {Array.from({ length: BOARD_COLS }, (_, colIndex) => {
            const absCol = isP1 ? colIndex : BOARD_COLS - 1 - colIndex;
            const isDestroyed = Boolean(columnsDestroyed?.[absCol]);

            return (
              <div key={colIndex} className="column-indicator-cell">
                <div className="column-dot-wrapper">
                  <div className={`column-dot ${isDestroyed ? 'is-destroyed' : ''}`} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
