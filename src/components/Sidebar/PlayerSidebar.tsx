import React from 'react';
import { PlayerState } from '../../types';
import { GraveyardModal } from './GraveyardModal';
import './PlayerSidebar.css';

interface PlayerSidebarProps {
  player: PlayerState;
  isOpponent: boolean;
  side: 'left' | 'right';
  cardsDict?: Record<number, any>;
  onHoverCard?: (templateId: number | null) => void;
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
  isGraveOpen = false,
  onToggleGrave,
  onCloseGrave,
  isFusionOpen = false,
  onToggleFusion,
  onCloseFusion,
}) => {
  const isLeft = side === 'left';

  return (
    <div
      className={`sidebar ${isLeft ? 'left-sidebar' : 'right-sidebar'}`}
      style={{ flexDirection: isOpponent ? 'column-reverse' : 'column' }}
    >
      {isLeft ? (
        <>
          <div className="stats-box">
            <p>LP: {player.lp}</p>
          </div>
          {isOpponent ? (
            <div className="deck-zone fusion-deck">
              <span>Fusion ({player.fusionDeck.length})</span>
            </div>
          ) : (
            <div className="deck-zone-container">
              <div
                className={`deck-zone fusion-deck clickable ${isFusionOpen ? 'active' : ''}`}
                onClick={onToggleFusion}
                title="Click to view Fusion Deck"
              >
                <span>Fusion ({player.fusionDeck.length})</span>
              </div>
              {isFusionOpen && (
                <GraveyardModal
                  cards={player.fusionDeck}
                  cardsDict={cardsDict}
                  onClose={onCloseFusion || (() => {})}
                  onHoverCard={onHoverCard}
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
              className={`deck-zone grave ${isGraveOpen ? 'active' : ''}`}
              onClick={onToggleGrave}
              title="Click to view Graveyard"
            >
              <span>Grave ({player.grave.length})</span>
            </div>
            {isGraveOpen && (
              <GraveyardModal
                cards={player.grave}
                cardsDict={cardsDict}
                onClose={onCloseGrave || (() => {})}
                onHoverCard={onHoverCard}
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
