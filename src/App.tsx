import React, { useState } from 'react'
import GameBoard from './components/GameBoard'
import { useGameSocket } from './hooks/useGameSocket'

export default function App(): JSX.Element {
  const urlParams = new URLSearchParams(window.location.search);
  const initialPlayerId = urlParams.get('player_id') || '';
  
  const [playerId, setPlayerId] = useState(initialPlayerId);
  const { gameState, isConnected } = useGameSocket(playerId);

  if (!playerId) {
    return (
      <div className="app" style={{ display: 'flex', gap: '20px', padding: '20px', justifyContent: 'center' }}>
        <button onClick={() => setPlayerId('player_A')} style={{ padding: '10px 20px', cursor: 'pointer', fontSize: '16px' }}>Join as Player A</button>
        <button onClick={() => setPlayerId('player_B')} style={{ padding: '10px 20px', cursor: 'pointer', fontSize: '16px' }}>Join as Player B</button>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="top-banner">
        <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
          Playing as: {playerId === 'player_A' ? 'Player A' : 'Player B'}
        </div>

        {isConnected ? (
          <div className={`connection-indicator connected`} aria-hidden />
        ) : (
          <div className="reconnecting">
            <span className="reconnect-text">Reconnecting</span>
            <span className="reconnect-dot" />
          </div>
        )}
      </div>
      <div className="game-container">
        <GameBoard playerId={playerId} gameState={gameState} isConnected={isConnected} />
      </div>
    </div>
  )
}
