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
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [animatedInstanceId, setAnimatedInstanceId] = useState<string | null>(null);
  const [cardsDict, setCardsDict] = useState<Record<number, any>>({});
  const [hoveredTemplateId, setHoveredTemplateId] = useState<number | null>(null);

  useEffect(() => {
    fetch('/cards.json')
      .then(res => res.json())
      .then(data => {
        const dict: Record<number, any> = {};
        data.forEach((c: any) => {
          dict[c.templateId] = c;
        });
        setCardsDict(dict);
      })
      .catch(err => console.error("Could not load card data", err));
  }, []);

  useEffect(() => {
    if (latestEvent?.type === 'CARD_PLAYED') {
      const { instanceId } = latestEvent.data;
      setAnimatedInstanceId(String(instanceId));
      setTimeout(() => setAnimatedInstanceId(null), 1000);
      setSelectedInstanceId(null);
    }
  }, [latestEvent]);

  const isP1 = playerId === '1';

  const isPlayPhase = gameState.phase === 'PLAYPHASE';
  const isBattlePhase = gameState.phase === 'BATTLEPHASE';

  const handlePhaseButtonClick = () => {
    if (isPlayPhase) {
      sendAction('TO_BATTLE', {
        player_id: parseInt(playerId, 10),
      });
    }
  };

  const phaseButtonLabel = isBattlePhase ? 'End Turn' : (isPlayPhase ? 'To Battle' : gameState.phase);

  const handleCellClick = (absRow: number, absCol: number, isOpponent: boolean) => {
    if (isOpponent) return; // Cannot play on opponent's side
    if (selectedInstanceId === null) return;
    
    sendAction('PLAY_CARD', {
      player_id: isP1 ? 1 : 2,
      instance_id: parseInt(selectedInstanceId, 10),
      position: { row: absRow, col: absCol }
    });
  };

  const renderPlayerSide = (player: PlayerState, isOpponent: boolean) => {
    // P1 sees the board from top-down so we reverse rows and cols to make P1 face up.
    // P2 sees the board from bottom-up so rows and cols are already in correct orientation for P2.
    const displayedBoard = isP1 ? [...player.board].reverse() : player.board;

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

          <div className="board-grid">
            {displayedBoard.map((row, rowIndex) => {
              const displayedRow = isP1 ? [...row].reverse() : row;
              // Map displayed index back to absolute index
              const absRow = isP1 ? (1 - rowIndex) : (isOpponent ? 1 - rowIndex : 2 + rowIndex);
              
              return (
                <div key={rowIndex} className="board-row">
                  {displayedRow.map((cell, colIndex) => {
                    const absCol = isP1 ? (3 - colIndex) : colIndex;
                    const topCard = cell?.topCard;
                    const trapCard = cell?.trapCard;
                    
                    const tId = topCard?.instanceId;
                    const isAnimated = tId && String(tId) === animatedInstanceId;

                    return (
                      <div 
                        key={colIndex} 
                        className="board-cell" 
                        onClick={() => handleCellClick(absRow, absCol, isOpponent)}
                      >
                        <div className="tile-content">
                          <div 
                            className={`trap-slot ${trapCard ? 'card board-card trap-card' : ''}`}
                            onMouseEnter={() => trapCard && setHoveredTemplateId(trapCard.templateId)}
                            onMouseLeave={() => setHoveredTemplateId(null)}
                          >
                            {trapCard ? 'Set Trap' : ''}
                          </div>
                          <div 
                            className={`top-slot ${topCard ? 'card board-card top-card' : ''} ${isAnimated ? 'card-drop-anim' : ''}`}
                            onMouseEnter={() => topCard && setHoveredTemplateId(topCard.templateId)}
                            onMouseLeave={() => setHoveredTemplateId(null)}
                          >
                            {topCard ? (cardsDict[topCard.templateId]?.name || `Card ${topCard.templateId}`) : ''}
                          </div>
                        </div>
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
              const isSelected = selectedInstanceId === String(card.instanceId);
              return (
                <div 
                  key={idx} 
                  className={`card hand-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedInstanceId(isSelected ? null : String(card.instanceId))}
                  onMouseEnter={() => setHoveredTemplateId(card.templateId)}
                  onMouseLeave={() => setHoveredTemplateId(null)}
                >
                  {cardsDict[card.templateId]?.name || `Card ${card.templateId}`}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <div className="game-container" style={{ flex: 1 }}>
        {renderPlayerSide(gameState.opponent, true)}
        {/* divider + phase button (divider stays centered; button positioned to the right) */}
        <div className="divider-with-phase">
          <div className={`center-divider ${gameState.activePlayerId ? (gameState.activePlayerId === parseInt(playerId, 10) ? 'active-player' : 'active-opponent') : ''}`} />
          <button
            className="phase-button"
            onClick={handlePhaseButtonClick}
            aria-label="Game phase"
          >
            {phaseButtonLabel}
          </button>
        </div>
        {renderPlayerSide(gameState.player, false)}
      </div>

      {/* Card Details Sidebar */}
      <div style={{ width: '300px', borderLeft: '1px solid #ccc', padding: '16px', background: '#f9f9f9', overflowY: 'auto' }}>
        {hoveredTemplateId && cardsDict[hoveredTemplateId] ? (
          <div>
            <h3>{cardsDict[hoveredTemplateId].name}</h3>
            <p style={{fontStyle: 'italic', marginBottom: '8px'}}>{cardsDict[hoveredTemplateId].type}</p>
            {cardsDict[hoveredTemplateId].atk !== undefined && (
              <p><strong>ATK:</strong> {cardsDict[hoveredTemplateId].atk}</p>
            )}
            {cardsDict[hoveredTemplateId].attribute && (
              <p><strong>Attribute:</strong> {cardsDict[hoveredTemplateId].attribute}</p>
            )}
            <p style={{ marginTop: '16px', whiteSpace: 'pre-wrap' }}>{cardsDict[hoveredTemplateId].description}</p>
          </div>
        ) : (
          <p style={{ color: '#888' }}>Hover over a card to see details.</p>
        )}
      </div>
    </div>
  );
}
