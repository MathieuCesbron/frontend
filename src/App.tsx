import React, { useState } from 'react';
import GameBoard from './components/GameBoard';
import { Header } from './components/Header/Header';
import { useGameSocket } from './hooks/useGameSocket';

export default function App(): JSX.Element {
  const urlParams = new URLSearchParams(window.location.search);
  const initialPlayerId = urlParams.get('playerId') || '';
  const initialVsAi = urlParams.get('vsAi') === 'true';

  const [playerId, setPlayerId] = useState<string>(initialPlayerId);
  const [isAiMode, setIsAiMode] = useState<boolean>(initialVsAi);

  const { gameState, isConnected, sendAction, latestEvent, waitingMessage } = useGameSocket(playerId, isAiMode);

  if (!playerId) {
    return (
      <div className="app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={() => {
              setIsAiMode(true);
              setPlayerId('1');
            }}
            style={{ width: '100%', padding: '10px 20px', cursor: 'pointer', fontSize: '16px' }}
          >
            Match VS AI
          </button>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
            <button
              onClick={() => {
                setIsAiMode(false);
                setPlayerId('1');
              }}
              style={{ padding: '10px 20px', cursor: 'pointer', fontSize: '16px' }}
            >
              Join as Player 1
            </button>
            <button
              onClick={() => {
                setIsAiMode(false);
                setPlayerId('2');
              }}
              style={{ padding: '10px 20px', cursor: 'pointer', fontSize: '16px' }}
            >
              Join as Player 2
            </button>
          </div>
        </div>
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
