import React from 'react';
import { PlayerState, Card } from '../../types';
import { CardListModal } from './CardListModal';
import './PlayerSidebar.css';

interface PlayerSidebarProps {
  player: PlayerState;
  isOpponent: boolean;
  side: 'left' | 'right';
  cardsDict?: Record<number, any>;
  onHoverCard?: (card: Card | null) => void;
  onSelectFusionCard?: (card: Card) => void;
  onSelectGraveCard?: (card: Card) => void;
  selectableGraveInstanceIds?: Set<number>;
  isGraveOpen?: boolean;
  onToggleGrave?: () => void;
  onCloseGrave?: () => void;
  isFusionOpen?: boolean;
  onToggleFusion?: () => void;
  onCloseFusion?: () => void;
}

export const PlayerSidebar: React.FC<PlayerSidebarProps> = ({
  player,
  isOpponent,
  side,
  cardsDict = {},
  onHoverCard,
  onSelectFusionCard,
  onSelectGraveCard,
  selectableGraveInstanceIds,
  isGraveOpen = false,
  onToggleGrave,
  onCloseGrave,
  isFusionOpen = false,
  onToggleFusion,
  onCloseFusion,
}) => {
  const isLeft = side === 'left';
  const hasSummonableFusion =
    !isOpponent &&
    !isFusionOpen &&
    player.fusionDeck?.some(
      (c) => c.materialCombinations && c.materialCombinations.length > 0
    );
  const hasSelectableGrave =
    !isOpponent &&
    !isGraveOpen &&
    Boolean(
      selectableGraveInstanceIds &&
        selectableGraveInstanceIds.size > 0 &&
        player.grave?.some((c) => selectableGraveInstanceIds.has(c.instanceId))
    );

  return (
    <div
      className={`sidebar ${isLeft ? 'left-sidebar' : 'right-sidebar'}`}
      style={{ flexDirection: isOpponent ? 'column-reverse' : 'column' }}
    >
      {isLeft ? (
        <>
          {isOpponent ? (
            <div className="deck-zone fusion-deck">
              <span>Fusion ({player.fusionDeck.length})</span>
            </div>
          ) : (
            <div className="deck-zone-container">
              <div
                className={`deck-zone fusion-deck clickable ${isFusionOpen ? 'active' : ''} ${
                  hasSummonableFusion ? 'can-summon' : ''
                }`}
                onClick={onToggleFusion}
                title="Click to view Fusion Deck"
              >
                <span>Fusion ({player.fusionDeck.length})</span>
              </div>
              {isFusionOpen && (
                <CardListModal
                  cards={player.fusionDeck}
                  cardsDict={cardsDict}
                  onClose={onCloseFusion || (() => {})}
                  onHoverCard={onHoverCard}
                  onSelectCard={(card) => {
                    onSelectFusionCard?.(card);
                    onCloseFusion?.();
                  }}
                  title="Fusion Deck"
                  placement="left"
                />
              )}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="deck-zone-container">
            <div
              className={`deck-zone grave clickable ${isGraveOpen ? 'active' : ''} ${
                hasSelectableGrave ? 'can-select' : ''
              }`}
              onClick={onToggleGrave}
              title="Click to view Graveyard"
            >
              <span>Grave ({player.grave.length})</span>
            </div>
            {isGraveOpen && (
              <CardListModal
                cards={player.grave}
                cardsDict={cardsDict}
                onClose={onCloseGrave || (() => {})}
                onHoverCard={onHoverCard}
                onSelectCard={(card) => {
                  onSelectGraveCard?.(card);
                  onCloseGrave?.();
                }}
                selectableInstanceIds={selectableGraveInstanceIds}
                title={isOpponent ? "Opponent's Grave" : "Graveyard"}
              />
            )}
          </div>
          <div className="deck-zone deck">
            <span>Deck ({player.deckCount})</span>
          </div>
        </>
      )}
    </div>
  );
};
