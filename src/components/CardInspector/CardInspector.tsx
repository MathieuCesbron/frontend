import React from 'react';
import { Card, CardDefinition, Pattern, PatternCell } from '../../types';
import './CardInspector.css';

interface CardInspectorProps {
  // Instance view from the server, carrying overrides of the static definition.
  hoveredCard: Card | null;
  cardsDict: Record<number, CardDefinition>;
  isBlurred?: boolean;
}

const FusionPattern: React.FC<{ pattern: Pattern }> = ({ pattern }) => {
  const cells = pattern.patternCells;
  if (!cells || cells.length === 0) return null;

  const minRow = Math.min(...cells.map((c) => c.position.row));
  const maxRow = Math.max(...cells.map((c) => c.position.row));
  const minCol = Math.min(...cells.map((c) => c.position.col));
  const maxCol = Math.max(...cells.map((c) => c.position.col));

  const numCols = maxCol - minCol + 1;

  const cellMap = new Map<string, PatternCell>();
  cells.forEach((cell) => {
    cellMap.set(`${cell.position.row},${cell.position.col}`, cell);
  });

  const gridItems: { key: string; cell: PatternCell | null }[] = [];
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      const cell = cellMap.get(`${r},${c}`) || null;
      gridItems.push({ key: `${r},${c}`, cell });
    }
  }

  return (
    <div className="fusion-pattern-container">
      <div
        className="fusion-pattern-grid"
        style={{
          gridTemplateColumns: `repeat(${numCols}, auto)`,
        }}
      >
        {gridItems.map(({ key, cell }) =>
          cell ? (
            <div key={key} className="fusion-pattern-cell">
              {cell.attribute ? cell.attribute.toUpperCase() : 'ANY'}
            </div>
          ) : (
            <div key={key} className="fusion-pattern-cell empty" aria-hidden="true" />
          )
        )}
      </div>
    </div>
  );
};

export const CardInspector: React.FC<CardInspectorProps> = ({
  hoveredCard,
  cardsDict,
  isBlurred,
}) => {
  const card = hoveredCard ? cardsDict[hoveredCard.templateId] : null;
  const effectivePower = hoveredCard?.effectivePower ?? null;
  const attributeOverride = hoveredCard?.attribute ?? null;

  return (
    <div className={`card-inspector ${isBlurred ? 'board-blurred' : ''}`}>
      {card ? (
        <div>
          <h3>{card.name}</h3>
          <p className="card-type">{card.type}</p>
          {card.power !== undefined && (
            <p>
              <strong>Power:</strong>{' '}
              {effectivePower !== null ? (
                <span className="effective-power">{effectivePower}</span>
              ) : (
                <span>{card.power}</span>
              )}
            </p>
          )}
          {card.attribute && (
            <p>
              <strong>Attribute:</strong>{' '}
              {attributeOverride !== null ? (
                <span className="effective-attribute">{attributeOverride}</span>
              ) : (
                <span>{card.attribute}</span>
              )}
            </p>
          )}
          {card.pattern && card.pattern.patternCells && card.pattern.patternCells.length > 0 && (
            <div className="card-pattern-section">
              <strong>Pattern:</strong>
              <FusionPattern pattern={card.pattern} />
            </div>
          )}
          <p className="card-description">{card.description}</p>
        </div>
      ) : (
        <p className="empty-hint">Hover over a card to see details.</p>
      )}
    </div>
  );
};
