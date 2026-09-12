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
  isMoveSource?: boolean;
  isMoveSelectedSource?: boolean;
  isMoveTarget?: boolean;
  isAttacker?: boolean;
  isSelectedAttacker?: boolean;
  isAttackTarget?: boolean;
  cardsDict: Record<number, any>;
  onCellClick: (absRow: number, absCol: number, isOpponent: boolean) => void;
  onHoverCard: (templateId: number | null) => void;
  onHoverAttacker?: (pos: { row: number; col: number } | null) => void;
}

export const BoardCell: React.FC<BoardCellProps> = ({
  cell,
  absRow,
  absCol,
  isOpponent,
  animatedInstanceId,
  isEffectTriggered,
  isMoveSource,
  isMoveSelectedSource,
  isMoveTarget,
  isAttacker,
  isSelectedAttacker,
  isAttackTarget,
  cardsDict,
  onCellClick,
  onHoverCard,
  onHoverAttacker,
}) => {
  const topCard = cell?.topCard;
  const trapCard = cell?.trapCard;

  const tId = topCard?.instanceId;
  const isAnimated = Boolean(tId && String(tId) === animatedInstanceId);

  const cellClasses = [
    'board-cell',
    isMoveSource ? 'is-move-source' : '',
    isMoveSelectedSource ? 'is-move-selected-source' : '',
    isMoveTarget ? 'is-move-target' : '',
    isAttacker ? 'is-attacker' : '',
    isSelectedAttacker ? 'is-selected-attacker' : '',
    isAttackTarget ? 'is-attack-target' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cellClasses}
      onClick={() => onCellClick(absRow, absCol, isOpponent)}
    >
      <div className="tile-content">
        {trapCard && (
          <div
            className={`trap-slot card board-card trap-card ${
              isEffectTriggered && !topCard ? 'effect-triggered-glow' : ''
            }`}
            onMouseEnter={() => onHoverCard(trapCard.templateId)}
            onMouseLeave={() => onHoverCard(null)}
          >
            {'Set Trap'}
          </div>
        )}
        <div
          className={`top-slot ${topCard ? 'card board-card top-card' : ''} ${
            isAnimated ? 'card-drop-anim' : ''
          } ${isEffectTriggered ? 'effect-triggered-glow' : ''} ${
            isMoveSelectedSource ? 'move-selected-top' : ''
          } ${isMoveSource && !isMoveSelectedSource ? 'move-source-top' : ''} ${
            isSelectedAttacker ? 'selected-attacker-top' : ''
          } ${isAttacker && !isSelectedAttacker ? 'attacker-top' : ''} ${
            isAttackTarget ? 'attack-target-top' : ''
          }`}
          onMouseEnter={() => {
            if (topCard) onHoverCard(topCard.templateId);
            if (isAttacker) onHoverAttacker?.({ row: absRow, col: absCol });
          }}
          onMouseLeave={() => {
            onHoverCard(null);
            if (isAttacker) onHoverAttacker?.(null);
          }}
        >
          {topCard ? cardsDict[topCard.templateId]?.name || `Card ${topCard.templateId}` : ''}
        </div>
      </div>
    </div>
  );
};
