import React from 'react';
import { Card } from '../../types';
import './Hand.css';

interface HandProps {
  cards: Card[];
  isOpponent: boolean;
  selectedInstanceId?: string | null;
  cardsDict: Record<number, any>;
  validDiscardIndices?: Set<number>;
  validDiscardInstanceIds?: Set<number>;
  onSelectCard?: (instanceId: string, index: number) => void;
  onHoverCard?: (templateId: number | null) => void;
}

export const Hand: React.FC<HandProps> = ({
  cards,
  isOpponent,
  selectedInstanceId,
  cardsDict,
  validDiscardIndices,
  validDiscardInstanceIds,
  onSelectCard,
  onHoverCard,
}) => {
  if (isOpponent) {
    return (
      <div className="hand">
        {cards.map((_, idx) => (
          <div key={idx} className="card hidden-card" />
        ))}
      </div>
    );
  }

  return (
    <div className="hand">
      {cards.map((card, idx) => {
        const isSelected = selectedInstanceId === String(card.instanceId);
        const isDiscardValid = Boolean(
          (validDiscardIndices && validDiscardIndices.has(idx)) ||
            (validDiscardInstanceIds &&
              validDiscardInstanceIds.has(card.instanceId))
        );
        const cardInfo = cardsDict[card.templateId];
        const cardName = cardInfo?.name || `Card ${card.templateId}`;

        return (
          <div
            key={idx}
            className={`card hand-card ${isSelected ? 'selected' : ''} ${
              isDiscardValid ? 'discard-target' : ''
            }`}
            onClick={() => onSelectCard?.(String(card.instanceId), idx)}
            onMouseEnter={() => onHoverCard?.(card.templateId)}
            onMouseLeave={() => onHoverCard?.(null)}
          >
            {cardName}
          </div>
        );
      })}
    </div>
  );
};
