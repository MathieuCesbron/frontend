import React, { useEffect, useRef } from 'react';
import { Card } from '../../types';
import './GraveyardModal.css';

interface GraveyardModalProps {
  cards: Card[];
  cardsDict: Record<number, any>;
  onClose: () => void;
  onHoverCard?: (templateId: number | null) => void;
  title?: string;
  placement?: 'left' | 'right';
}

export const GraveyardModal: React.FC<GraveyardModalProps> = ({
  cards,
  cardsDict,
  onClose,
  onHoverCard,
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
      className={`graveyard-modal-container placement-${placement}`}
      ref={modalRef}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="graveyard-modal-header">
        <h4>{title} ({cards.length})</h4>
      </div>

      {cards.length === 0 ? (
        <p className="graveyard-empty">Empty</p>
      ) : (
        <div className="graveyard-cards-grid">
          {cards.map((card, idx) => {
            const cardInfo = cardsDict[card.templateId];
            const name = cardInfo?.name || `Card ${card.templateId}`;
            return (
              <div
                key={`${card.instanceId}-${idx}`}
                className="graveyard-card-item"
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
