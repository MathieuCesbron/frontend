import React from 'react';
import { Card, Tile } from '../../types';
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
  isColumnAttackTarget?: boolean;
  isFusionMaterial?: boolean;
  isSelectedFusionMaterial?: boolean;
  isFusionSpawnTarget?: boolean;
  cardsDict: Record<number, any>;
  onCellClick: (absRow: number, absCol: number, isOpponent: boolean) => void;
  onHoverCard: (card: Card | null) => void;
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
  isColumnAttackTarget,
  isFusionMaterial,
  isSelectedFusionMaterial,
  isFusionSpawnTarget,
  cardsDict,
  onCellClick,
  onHoverCard,
  onHoverAttacker,
}) => {
  const topCard = isFusionSpawnTarget ? null : cell?.topCard;
  const shadowCard = cell?.shadowCard;

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
    isColumnAttackTarget ? 'is-column-attack-target' : '',
    isFusionMaterial ? 'is-fusion-material' : '',
    isSelectedFusionMaterial ? 'is-selected-fusion-material' : '',
    isFusionSpawnTarget ? 'is-fusion-spawn-target' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cellClasses}
      onClick={() => onCellClick(absRow, absCol, isOpponent)}
    >
      <div className="tile-content">
        {shadowCard && (
          <div
            className={`shadow-slot card board-card shadow-card ${
              shadowCard.isRevealed ? 'is-revealed' : ''
            } ${isEffectTriggered && !topCard ? 'effect-triggered-glow' : ''}`}
            onMouseEnter={() => {
              if (shadowCard.templateId > 0 && (shadowCard.isRevealed || !isOpponent)) {
                onHoverCard(shadowCard);
              }
            }}
            onMouseLeave={() => onHoverCard(null)}
          >
            {shadowCard.isRevealed && shadowCard.templateId > 0
              ? cardsDict[shadowCard.templateId]?.name || `Card ${shadowCard.templateId}`
              : 'Set Shadow'}
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
          } ${
            isColumnAttackTarget ? 'column-attack-target-top' : ''
          } ${
            isSelectedFusionMaterial ? 'selected-fusion-material-top' : ''
          } ${
            isFusionMaterial && !isSelectedFusionMaterial ? 'fusion-material-top' : ''
          } ${
            isFusionSpawnTarget ? 'fusion-spawn-target-top' : ''
          }`}
          onMouseEnter={() => {
            if (topCard) onHoverCard(topCard);
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
