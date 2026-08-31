import { useEffect, useRef, useState } from 'react';
import { GameState, MOCK_STATE } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';

export function useGameSocket(playerId: string) {
  const [gameState, setGameState] = useState<GameState>(MOCK_STATE);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [latestEvent, setLatestEvent] = useState<any>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef<number>(0);
  
  // Timers
  const reconnectTimer = useRef<number | null>(null);
  const heartbeatTimer = useRef<number | null>(null);
  const pongTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!playerId) return;

    let closedByUser = false;

    function startHeartbeat() {
      stopHeartbeat();
      // Send a ping every 10 seconds
      heartbeatTimer.current = window.setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          try {
            wsRef.current.send(JSON.stringify({ type: 'PING' }));
            
            // NEW: Start the 5-second doom timer right after sending the ping
            pongTimeoutRef.current = window.setTimeout(() => {
              console.warn('Ping timeout: No pong received. Forcing reconnect...');
              wsRef.current?.close(); // This triggers onclose, which handles the reconnect!
            }, 5000);
            
          } catch {
            // ignore send errors
          }
        }
      }, 10000);
    }

    function stopHeartbeat() {
      if (heartbeatTimer.current) {
        clearInterval(heartbeatTimer.current);
        heartbeatTimer.current = null;
      }
      // NEW: Also clear the doom timer
      if (pongTimeoutRef.current) {
        clearTimeout(pongTimeoutRef.current);
        pongTimeoutRef.current = null;
      }
    }

    function scheduleReconnect() {
      if (reconnectTimer.current) return;
      reconnectAttempts.current += 1;
      const attempt = reconnectAttempts.current;
      const delay = Math.min(10000, 500 * Math.pow(2, attempt));
      
      reconnectTimer.current = window.setTimeout(() => {
        reconnectTimer.current = null;
        connect();
      }, delay);
      console.log(`Reconnecting in ${delay}ms (attempt ${attempt})`);
    }

    function connect() {
      const ws = new WebSocket(`${WS_URL}?player_id=${playerId}`);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectAttempts.current = 0;
        setIsConnected(true);
        console.log(`Connected to game server as ${playerId}`);
        startHeartbeat();
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          console.log(message)
          
          if (message.type === 'PONG') {
            if (pongTimeoutRef.current) {
              clearTimeout(pongTimeoutRef.current);
              pongTimeoutRef.current = null;
            }
            return; // Stop processing here so it doesn't try to update game state
          }

          // Game state logic
          if (message.type === 'GAME_STATE') {
            setGameState(message.data);
          } else if (message.type === 'EVENTS') {
            // Can handle an array of events
            if (Array.isArray(message.data) && message.data.length > 0) {
              setLatestEvent(message.data[message.data.length - 1]);
              
              // Reduce events to update the local GameState
              setGameState((prevState) => {
                // Deep clone the state to avoid mutating React state directly
                const nextState = JSON.parse(JSON.stringify(prevState));

                message.data.forEach((evt: any) => {
                  if (evt.type === 'CARD_PLAYED') {
                    const { templateId, instanceId, ownerId, source, position, isTrap } = evt.data;
                    
                    // Determine whether this event affects 'player' or 'opponent'
                    const side = String(ownerId) === String(playerId) ? 'player' : 'opponent';

                    let cardToPlace = null;

                    // If played from HAND, remove it from the hand
                    if (source === 'HAND') {
                      const handIndex = nextState[side].hand.findIndex((c: any) => String(c.instanceId) === String(instanceId));
                      if (handIndex !== -1) {
                        // Extract the card object from hand
                        cardToPlace = nextState[side].hand.splice(handIndex, 1)[0];
                      } else {
                        // Fallback for opponent playing a hidden card (Censored: -1)
                        cardToPlace = { instanceId: instanceId, templateId: templateId }; 
                      }
                    }

                    // Place the card onto their grid
                    if (cardToPlace) {
                      nextState[side].field[position.row][position.col] = cardToPlace;
                    }
                  }
                });

                return nextState;
              });
            }
          }
        } catch (e) {
          console.error('Failed to parse message', e);
        }
      };

      ws.onerror = (e) => {
        console.error('WebSocket error', e);
      };

      ws.onclose = () => {
        setIsConnected(false);
        stopHeartbeat(); // This now clears both the ping and pong timers
        if (!closedByUser) scheduleReconnect();
        console.log('WebSocket closed');
      };
    }

    connect();

    return () => {
      closedByUser = true;
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
      stopHeartbeat();
      try {
        wsRef.current?.close();
      } catch {}
      wsRef.current = null;
    };
  }, [playerId]);

  // Include the sendAction helper discussed previously
  const sendAction = (actionType: string, payload: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'ACTION',
        data: { action: actionType, data: payload }
      }));
    }
  };

  return { gameState, isConnected, sendAction, latestEvent };
}