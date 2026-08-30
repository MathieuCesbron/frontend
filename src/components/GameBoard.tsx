import React, { useState, useEffect } from 'react';
import { PlayerState, GameState } from '../types';

interface GameBoardProps {
  playerId: string;
  gameState: GameState;
  isConnected: boolean;
  sendAction: (actionType: string, payload: any) => void;
  latestEvent: any;
}

export default function GameBoard({ playerId, gameState, isConnected, sendAction, latestEvent }: GameBoardProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [animatedCardId, setAnimatedCardId] = useState<string | null>(null);
  
  useEffect(() => {
    if (latestEvent?.type === 'CARD_PLAYED') {
      const { cardId } = latestEvent.data;
      setAnimatedCardId(String(cardId));
      setTimeout(() => setAnimatedCardId(null), 1000);
      setSelectedCardId(null);
    }
  }, [latestEvent]);

  const isP1 = playerId === '1';

  const handleCellClick = (absRow: number, absCol: number, isOpponent: boolean) => {
    if (isOpponent) return; // Cannot play on opponent's side
    if (selectedCardId === null) return;
    
    sendAction('PLAY_CARD', {
      player_id: isP1 ? 1 : 2,
      card_id: parseInt(selectedCardId, 10),
      position: { row: absRow, col: absCol }
    });
  };

  const renderPlayerSide = (player: PlayerState, isOpponent: boolean) => {
    // P1 sees the board from top-down so we reverse rows and cols to make P1 face up.
    // P2 sees the board from bottom-up so rows and cols are already in correct orientation for P2.
    const displayedField = isP1 ? [...player.field].reverse() : player.field;

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
              <span>Fusion ({player.fusionDeck.length})</span>
            </div>
          </div>

          <div className="field-grid">
            {displayedField.map((row, rowIndex) => {
              const displayedRow = isP1 ? [...row].reverse() : row;
              // Map displayed index back to absolute index
              const absRow = isP1 ? (1 - rowIndex) : (isOpponent ? 1 - rowIndex : 2 + rowIndex);
              
              return (
                <div key={rowIndex} className="field-row">
                  {displayedRow.map((cell, colIndex) => {
                    const absCol = isP1 ? (3 - colIndex) : colIndex;
                    const cId = cell?.id;
                    const isAnimated = cId && cId === animatedCardId;
                    return (
                      <div 
                        key={colIndex} 
                        className="field-cell" 
                        onClick={() => handleCellClick(absRow, absCol, isOpponent)}
                      >
                        {cell ? <div className={`card field-card ${isAnimated ? 'card-drop-anim' : ''}`}>{cell.name}</div> : null}
                      </div>
                    )
                  })}
                </div>
              );
            })}
          </div>

          <div className="sidebar right-sidebar" style={{ flexDirection: isOpponent ? 'column-reverse' : 'column' }}>
            <div className="deck-zone trash">
              <span>Trash ({player.trash.length})</span>
            </div>
            <div className="deck-zone deck">
              <span>Deck ({player.deckCount})</span>
            </div>
          </div>
        </div>

        {!isOpponent && (
          <div className="hand">
            {player.hand.map((card, idx) => {
              const isSelected = selectedCardId === card.id;
              return (
                <div 
                  key={idx} 
                  className={`card hand-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedCardId(isSelected ? null : card.id)}
                >
                  {card.name}
                </div>
              );
            })}
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
