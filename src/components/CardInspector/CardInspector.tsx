import React from 'react';
import './CardInspector.css';

interface CardInspectorProps {
  hoveredTemplateId: number | null;
  cardsDict: Record<number, any>;
  isBlurred?: boolean;
}

export const CardInspector: React.FC<CardInspectorProps> = ({
  hoveredTemplateId,
  cardsDict,
  isBlurred,
}) => {
  const card = hoveredTemplateId ? cardsDict[hoveredTemplateId] : null;

  return (
    <div className={`card-inspector ${isBlurred ? 'board-blurred' : ''}`}>
      {card ? (
        <div>
          <h3>{card.name}</h3>
          <p className="card-type">{card.type}</p>
          {card.atk !== undefined && (
            <p>
              <strong>ATK:</strong> {card.atk}
            </p>
          )}
          {card.attribute && (
            <p>
              <strong>Attribute:</strong> {card.attribute}
            </p>
          )}
          <p className="card-description">{card.description}</p>
        </div>
      ) : (
        <p className="empty-hint">Hover over a card to see details.</p>
      )}
    </div>
  );
};
