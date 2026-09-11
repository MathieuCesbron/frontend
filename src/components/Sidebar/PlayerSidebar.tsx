import React from 'react';
import { PlayerState } from '../../types';
import './PlayerSidebar.css';

interface PlayerSidebarProps {
  player: PlayerState;
  isOpponent: boolean;
  side: 'left' | 'right';
}

export const PlayerSidebar: React.FC<PlayerSidebarProps> = ({ player, isOpponent, side }) => {
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
          <div className="deck-zone fusion-deck">
            <span>Fusion ({player.fusionDeck.length})</span>
          </div>
        </>
      ) : (
        <>
          <div className="deck-zone grave">
            <span>Grave ({player.grave.length})</span>
          </div>
          <div className="deck-zone deck">
            <span>Deck ({player.deckCount})</span>
          </div>
        </>
      )}
    </div>
  );
};
