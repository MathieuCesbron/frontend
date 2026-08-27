import React from 'react';
import { PlayerState, GameState } from '../types';

interface GameBoardProps {
  playerId: string;
  gameState: GameState;
  isConnected: boolean;
}

export default function GameBoard({ playerId, gameState, isConnected }: GameBoardProps) {

  const renderPlayerSide = (player: PlayerState, isOpponent: boolean) => {
    // Reverse field rows for opponent so their front row faces the center
    const displayedField = isOpponent ? [...player.field].reverse() : player.field;

    return (
      <div className={`player-area ${isOpponent ? 'opponent' : 'player'}`}>
        {isOpponent && (
          <div className="hand">
            {player.hand.map((card, idx) => (
              <div key={idx} className="card hidden-card"></div>
            ))}
          </div>
        )}

        <div className="board-layout">
          <div className="sidebar left-sidebar" style={{ flexDirection: isOpponent ? 'column-reverse' : 'column' }}>
            <div className="stats-box">
              <p>LP: {player.lp}</p>
            </div>
            <div className="deck-zone fusion-deck">
              <span>Fusion ({player.fusionDeckCount})</span>
            </div>
          </div>

          <div className="field-grid">
            {displayedField.map((row, rowIndex) => (
              <div key={rowIndex} className="field-row">
                {row.map((cell, colIndex) => (
                  <div key={colIndex} className="field-cell">
                    {cell ? <div className="card field-card">{cell.name}</div> : null}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="sidebar right-sidebar" style={{ flexDirection: isOpponent ? 'column-reverse' : 'column' }}>
            <div className="deck-zone trash">
              <span>Trash ({player.trashCount})</span>
            </div>
            <div className="deck-zone deck">
              <span>Deck ({player.deckCount})</span>
            </div>
          </div>
        </div>

        {!isOpponent && (
          <div className="hand">
            {player.hand.map((card, idx) => (
              <div key={idx} className="card hand-card">{card.name}</div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="game-container">
      {renderPlayerSide(gameState.opponent, true)}
      <div className="center-divider"></div>
      {renderPlayerSide(gameState.player, false)}
    </div>
  );
}
