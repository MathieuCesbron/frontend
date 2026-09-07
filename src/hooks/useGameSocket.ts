import { useEffect, useRef, useState } from 'react';
import { GameState, MOCK_STATE, createInitialState } from '../types';
import { GameEvent, applyGameEvent, getEventDuration } from '../events';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';

export function useGameSocket(playerId: string) {
  const [gameState, setGameState] = useState<GameState>(MOCK_STATE);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [latestEvent, setLatestEvent] = useState<GameEvent | null>(null);
  const [waitingMessage, setWaitingMessage] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef<number>(0);
  
  // Timers & Event Queue
  const reconnectTimer = useRef<number | null>(null);
  const heartbeatTimer = useRef<number | null>(null);
  const pongTimeoutRef = useRef<number | null>(null);
  const eventQueueRef = useRef<GameEvent[]>([]);
  const isProcessingRef = useRef<boolean>(false);
  const queueTimerRef = useRef<number | null>(null);
  const latestSnapshotRef = useRef<GameState | null>(null);

  useEffect(() => {
    if (!playerId) return;

    let closedByUser = false;

    function clearEventQueue() {
      eventQueueRef.current = [];
      isProcessingRef.current = false;
      if (queueTimerRef.current) {
        clearTimeout(queueTimerRef.current);
        queueTimerRef.current = null;
      }
    }

    function processNextEvent() {
      if (isProcessingRef.current) return;

      if (eventQueueRef.current.length === 0) {
        if (latestSnapshotRef.current) {
          setGameState(latestSnapshotRef.current);
        }
        return;
      }

      isProcessingRef.current = true;
      const evt = eventQueueRef.current.shift()!;

      setLatestEvent(evt);

      setGameState((prevState) => applyGameEvent(prevState, evt, playerId));

      const duration = getEventDuration(evt);

      queueTimerRef.current = window.setTimeout(() => {
        queueTimerRef.current = null;
        isProcessingRef.current = false;
        processNextEvent();
      }, duration);
    }

    function startHeartbeat() {
      stopHeartbeat();
      heartbeatTimer.current = window.setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          try {
            wsRef.current.send(JSON.stringify({ type: 'PING' }));
            
            pongTimeoutRef.current = window.setTimeout(() => {
              console.warn('Ping timeout: No pong received. Forcing reconnect...');
              wsRef.current?.close();
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
          
          if (message.type === 'PONG') {
            if (pongTimeoutRef.current) {
              clearTimeout(pongTimeoutRef.current);
              pongTimeoutRef.current = null;
            }
            return;
          }

          if (message.type === 'WAITING') {
            clearEventQueue();
            setWaitingMessage(message.data?.message || 'Waiting for opponent...');
            setGameState(createInitialState());
            return;
          }

          if (message.type === 'UPDATE') {
            setWaitingMessage(null);
            const { events, snapshot } = message.data || {};

            if (snapshot) {
              latestSnapshotRef.current = snapshot;
            }

            if (Array.isArray(events) && events.length > 0) {
              const hasGameStarted = events.some((evt: any) => evt.type === 'GAME_STARTED');
              if (hasGameStarted) {
                clearEventQueue();
              }
              eventQueueRef.current.push(...events);
              processNextEvent();
            } else if (snapshot) {
              // If there are no event animations to run, reconcile immediately
              setGameState(snapshot);
            }
            return;
          }

          if (message.type === 'SNAPSHOT') {
            clearEventQueue();
            setWaitingMessage(null);
            latestSnapshotRef.current = message.data;
            setGameState(message.data);
          } else if (message.type === 'EVENTS') {
            setWaitingMessage(null);
            if (Array.isArray(message.data) && message.data.length > 0) {
              const hasGameStarted = message.data.some((evt: any) => evt.type === 'GAME_STARTED');
              if (hasGameStarted) {
                clearEventQueue();
              }
              eventQueueRef.current.push(...message.data);
              processNextEvent();
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
        stopHeartbeat();
        clearEventQueue();
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
      clearEventQueue();
      try {
        wsRef.current?.close();
      } catch {}
      wsRef.current = null;
    };
  }, [playerId]);

  // Include the sendAction helper
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