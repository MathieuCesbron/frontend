import React from 'react';
import { Card } from '../../types';
import './Hand.css';

interface HandProps {
  cards: Card[];
  isOpponent: boolean;
  selectedInstanceId?: string | null;
  cardsDict: Record<number, any>;
  onSelectCard?: (instanceId: string) => void;
  onHoverCard?: (templateId: number | null) => void;
}

export const Hand: React.FC<HandProps> = ({
  cards,
  isOpponent,
  selectedInstanceId,
  cardsDict,
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
        const cardInfo = cardsDict[card.templateId];
        const cardName = cardInfo?.name || `Card ${card.templateId}`;

        return (
          <div
            key={idx}
            className={`card hand-card ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelectCard?.(String(card.instanceId))}
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
