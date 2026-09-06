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
  cardsDict: Record<number, any>;
  onCellClick: (absRow: number, absCol: number, isOpponent: boolean) => void;
  onHoverCard: (templateId: number | null) => void;
}

export const BoardGrid: React.FC<BoardGridProps> = ({
  board,
  isP1,
  isOpponent,
  animatedInstanceId,
  activeEffectKeys,
  activeEffectIds,
  cardsDict,
  onCellClick,
  onHoverCard,
}) => {
  const displayedBoard = isP1 ? [...board].reverse() : board;

  const getAbsoluteCoords = (rowIndex: number, colIndex: number) => {
    let absRow: number;
    let absCol: number;

    if (isP1) {
      absCol = 3 - colIndex;
      absRow = isOpponent ? 3 - rowIndex : 1 - rowIndex;
    } else {
      absCol = colIndex;
      absRow = isOpponent ? rowIndex : 2 + rowIndex;
    }
    return { absRow, absCol };
  };

  return (
    <div className="board-grid">
      {displayedBoard.map((row, rowIndex) => {
        const displayedRow = isP1 ? [...row].reverse() : row;

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

              return (
                <BoardCell
                  key={colIndex}
                  cell={cell}
                  absRow={absRow}
                  absCol={absCol}
                  isOpponent={isOpponent}
                  animatedInstanceId={animatedInstanceId}
                  isEffectTriggered={isEffectTriggered}
                  cardsDict={cardsDict}
                  onCellClick={onCellClick}
                  onHoverCard={onHoverCard}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
