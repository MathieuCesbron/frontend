import React from 'react';
import { Tile } from '../../types';
import './BoardCell.css';

interface BoardCellProps {
  cell: Tile;
  absRow: number;
  absCol: number;
  isOpponent: boolean;
  animatedInstanceId: string | null;
  isEffectTriggered: boolean;
  cardsDict: Record<number, any>;
  onCellClick: (absRow: number, absCol: number, isOpponent: boolean) => void;
  onHoverCard: (templateId: number | null) => void;
}

export const BoardCell: React.FC<BoardCellProps> = ({
  cell,
  absRow,
  absCol,
  isOpponent,
  animatedInstanceId,
  isEffectTriggered,
  cardsDict,
  onCellClick,
  onHoverCard,
}) => {
  const topCard = cell?.topCard;
  const trapCard = cell?.trapCard;

  const tId = topCard?.instanceId;
  const isAnimated = Boolean(tId && String(tId) === animatedInstanceId);

  return (
    <div
      className="board-cell"
      onClick={() => onCellClick(absRow, absCol, isOpponent)}
    >
      <div className="tile-content">
        <div
          className={`trap-slot ${trapCard ? 'card board-card trap-card' : ''} ${
            isEffectTriggered && !topCard ? 'effect-triggered-glow' : ''
          }`}
          onMouseEnter={() => trapCard && onHoverCard(trapCard.templateId)}
          onMouseLeave={() => onHoverCard(null)}
        >
          {trapCard ? 'Set Trap' : ''}
        </div>
        <div
          className={`top-slot ${topCard ? 'card board-card top-card' : ''} ${
            isAnimated ? 'card-drop-anim' : ''
          } ${isEffectTriggered ? 'effect-triggered-glow' : ''}`}
          onMouseEnter={() => topCard && onHoverCard(topCard.templateId)}
          onMouseLeave={() => onHoverCard(null)}
        >
          {topCard ? cardsDict[topCard.templateId]?.name || `Card ${topCard.templateId}` : ''}
        </div>
      </div>
    </div>
  );
};
