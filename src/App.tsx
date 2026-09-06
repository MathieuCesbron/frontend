import React, { useState } from 'react';
import GameBoard from './components/GameBoard';
import { Header } from './components/Header/Header';
import { useGameSocket } from './hooks/useGameSocket';

export default function App(): JSX.Element {
  const urlParams = new URLSearchParams(window.location.search);
  const initialPlayerId = urlParams.get('playerId') || '';

  const [playerId, setPlayerId] = useState(initialPlayerId);
  const { gameState, isConnected, sendAction, latestEvent, waitingMessage } = useGameSocket(playerId);

  if (!playerId) {
    return (
      <div className="app" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20px', padding: '20px', justifyContent: 'center' }}>
        <button onClick={() => setPlayerId('1')} style={{ padding: '10px 20px', cursor: 'pointer', fontSize: '16px' }}>Join as Player 1</button>
        <button onClick={() => setPlayerId('2')} style={{ padding: '10px 20px', cursor: 'pointer', fontSize: '16px' }}>Join as Player 2</button>
      </div>
    );
  }

  return (
    <div className="app">
      <Header playerId={playerId} isConnected={isConnected} />
      <GameBoard
        playerId={playerId}
        gameState={gameState}
        isConnected={isConnected}
        sendAction={sendAction}
        latestEvent={latestEvent}
        waitingMessage={waitingMessage}
      />
    </div>
  );
}
