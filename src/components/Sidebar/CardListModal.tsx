import React, { useEffect, useRef } from 'react';
import { Card } from '../../types';
import './CardListModal.css';

interface CardListModalProps {
  cards: Card[];
  cardsDict: Record<number, any>;
  onClose: () => void;
  onHoverCard?: (templateId: number | null) => void;
  onSelectCard?: (card: Card) => void;
  title?: string;
  placement?: 'left' | 'right';
}

export const CardListModal: React.FC<CardListModalProps> = ({
  cards,
  cardsDict,
  onClose,
  onHoverCard,
  onSelectCard,
  title = 'Graveyard',
  placement = 'right',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // If the click is inside the modal or on a deck zone button, don't close via this handler
      if (modalRef.current && !modalRef.current.contains(target)) {
        if (!target.closest('.deck-zone')) {
          onClose();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      className={`card-list-modal-container placement-${placement}`}
      ref={modalRef}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="card-list-modal-header">
        <h4>{title} ({cards.length})</h4>
      </div>

      {cards.length === 0 ? (
        <p className="card-list-empty">Empty</p>
      ) : (
        <div className="card-list-cards-grid">
          {cards.map((card, idx) => {
            const cardInfo = cardsDict[card.templateId];
            const name = cardInfo?.name || `Card ${card.templateId}`;
            const canSummon = Boolean(card.materialCombinations && card.materialCombinations.length > 0);
            return (
              <div
                key={`${card.instanceId}-${idx}`}
                className={`card-list-card-item ${canSummon ? 'can-summon' : ''}`}
                onClick={() => {
                  if (canSummon && onSelectCard) {
                    onSelectCard(card);
                  }
                }}
                onMouseEnter={() => onHoverCard?.(card.templateId)}
                onMouseLeave={() => onHoverCard?.(null)}
              >
                <span>{name}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
