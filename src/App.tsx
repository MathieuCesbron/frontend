import React, { useState } from 'react'
import GameBoard from './components/GameBoard'
import { useGameSocket } from './hooks/useGameSocket'

export default function App(): JSX.Element {
  const urlParams = new URLSearchParams(window.location.search);
  const initialPlayerId = urlParams.get('player_id') || '';
  
  const [playerId, setPlayerId] = useState(initialPlayerId);
  const { gameState, isConnected, sendAction, latestEvent } = useGameSocket(playerId);

  if (!playerId) {
    return (
      <div className="app" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20px', padding: '20px', justifyContent: 'center' }}>
        <button onClick={() => setPlayerId('1')} style={{ padding: '10px 20px', cursor: 'pointer', fontSize: '16px' }}>Join as Player 1</button>
        <button onClick={() => setPlayerId('2')} style={{ padding: '10px 20px', cursor: 'pointer', fontSize: '16px' }}>Join as Player 2</button>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="top-banner">
        <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
          Playing as: {playerId === '1' ? 'Player 1' : 'Player 2'}
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
        <GameBoard playerId={playerId} gameState={gameState} isConnected={isConnected} sendAction={sendAction} latestEvent={latestEvent} />
      </div>
    </div>
  )
}
