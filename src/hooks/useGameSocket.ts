import { useEffect, useRef, useState } from 'react';
import { GameState, MOCK_STATE } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';

export function useGameSocket(playerId: string) {
  const [gameState, setGameState] = useState<GameState>(MOCK_STATE);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [latestEvent, setLatestEvent] = useState<any>(null);
  const [waitingMessage, setWaitingMessage] = useState<string | null>(null);
  
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
      const ws = new WebSocket(`${WS_URL}?playerId=${playerId}`);
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

          if (message.type === 'WAITING') {
            setWaitingMessage(message.data?.message || 'Waiting for opponent...');
            return;
          }

          // Game state logic
          if (message.type === 'SNAPSHOT') {
            setWaitingMessage(null);
            setGameState(message.data);
          } else if (message.type === 'EVENTS') {
            setWaitingMessage(null);
            // Can handle an array of events
            if (Array.isArray(message.data) && message.data.length > 0) {
              setLatestEvent(message.data[message.data.length - 1]);
              
              // Reduce events to update the local GameState
              setGameState((prevState) => {
                // Deep clone the state to avoid mutating React state directly
                const nextState = JSON.parse(JSON.stringify(prevState));

                message.data.forEach((evt: any) => {
                  if (evt.type === 'GAME_STARTED') {
                    const isP1 = String(playerId) === String(evt.data.player1Id ?? 1);
                    const myFusion = isP1 ? evt.data.player1FusionDeck : evt.data.player2FusionDeck;
                    const oppFusion = isP1 ? evt.data.player2FusionDeck : evt.data.player1FusionDeck;
                    const myDeckCount = isP1 ? evt.data.player1DeckCount : evt.data.player2DeckCount;
                    const oppDeckCount = isP1 ? evt.data.player2DeckCount : evt.data.player1DeckCount;

                    nextState.player.deckCount = myDeckCount ?? nextState.player.deckCount;
                    nextState.player.fusionDeck = myFusion ?? nextState.player.fusionDeck;
                    nextState.opponent.deckCount = oppDeckCount ?? nextState.opponent.deckCount;
                    nextState.opponent.fusionDeck = oppFusion ?? nextState.opponent.fusionDeck;

                    if (evt.data.startingPlayerId !== undefined) {
                      nextState.activePlayerId = evt.data.startingPlayerId;
                    }
                    nextState.turn = 1;
                    nextState.phase = 'PLAYPHASE';
                  } else if (evt.type === 'CARD_PLAYED') {
                    const { templateId, instanceId, ownerId, source, position, isTrap } = evt.data;
                    
                    // Determine whether this event affects 'player' or 'opponent'
                    const side = String(ownerId) === String(playerId) ? 'player' : 'opponent';

                    let cardToPlace = null;

                    // If played from HAND, remove it from the hand
                    if (source === 'HAND') {
                      const handIndex = nextState[side].hand.findIndex((c: any) => String(c.instanceId) === String(instanceId));
                      if (handIndex !== -1) {
                        cardToPlace = nextState[side].hand.splice(handIndex, 1)[0];
                        // If the server provided a concrete templateId in the event (not a censored -1),
                        // prefer that templateId over the placeholder from the hand.
                        if (templateId !== undefined && templateId !== -1) {
                          cardToPlace.templateId = templateId;
                        }
                        // update instanceId to the event's value (may be -1 for censored view)
                        if (instanceId !== undefined) {
                          cardToPlace.instanceId = instanceId;
                        }
                      } else {
                        // Fallback for opponent playing a hidden card (Censored: 0)
                        if (nextState[side].hand.length > 0) {
                          nextState[side].hand.pop();
                        }
                        cardToPlace = { instanceId: instanceId, templateId: templateId };
                      }
                    }

                    // Place the card onto their grid
                    if (cardToPlace) {
                      const localRow = position.row % 2;
                      if (!nextState[side].board[localRow][position.col]) {
                        nextState[side].board[localRow][position.col] = { topCard: null, trapCard: null };
                      }
                      
                      if (isTrap) {
                        nextState[side].board[localRow][position.col].trapCard = cardToPlace;
                      } else {
                        nextState[side].board[localRow][position.col].topCard = cardToPlace;
                      }
                    }
                  } else if (evt.type === 'BATTLE_PHASE_STARTED') {
                    nextState.phase = 'BATTLEPHASE';
                  } else if (evt.type === 'TURN_STARTED') {
                    nextState.phase = 'PLAYPHASE';
                    if (evt.data?.turn !== undefined) {
                      nextState.turn = evt.data.turn;
                    }
                    if (evt.data?.playerId !== undefined) {
                      nextState.activePlayerId = evt.data.playerId;
                    }
                  } else if (evt.type === 'TURN_ENDED') {
                    nextState.phase = 'PLAYPHASE';
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
        setWaitingMessage(null);
        stopHeartbeat(); // This now clears both the ping and pong timers
        if (!closedByUser) scheduleReconnect();
        console.log('WebSocket closed');
      };
    }

    connect();

    return () => {
      closedByUser = true;
      setWaitingMessage(null);
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

  return { gameState, isConnected, sendAction, latestEvent, waitingMessage };
}