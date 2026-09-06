import { GameState } from '../types';
import { GameEvent, GameEventHandler } from './types';
import { gameStartedHandler } from './gameStarted';
import { cardDrawnHandler } from './cardDrawn';
import { cardPlayedHandler } from './cardPlayed';
import { fusionPlayedHandler } from './fusionPlayed';
import { cardDestroyedHandler } from './cardDestroyed';
import { effectTriggeredHandler } from './effectTriggered';
import { lpUpdatedHandler } from './lpUpdated';
import { battlePhaseStartedHandler } from './battlePhaseStarted';
import { turnStartedHandler } from './turnStarted';
import { turnEndedHandler } from './turnEnded';

export * from './types';
export * from './gameStarted';
export * from './cardDrawn';
export * from './cardPlayed';
export * from './fusionPlayed';
export * from './cardDestroyed';
export * from './effectTriggered';
export * from './lpUpdated';
export * from './battlePhaseStarted';
export * from './turnStarted';
export * from './turnEnded';

export const eventHandlers: Record<string, GameEventHandler> = {
  GAME_STARTED: gameStartedHandler,
  CARD_DRAWN: cardDrawnHandler,
  CARD_PLAYED: cardPlayedHandler,
  FUSION_PLAYED: fusionPlayedHandler,
  CARD_DESTROYED: cardDestroyedHandler,
  EFFECT_TRIGGERED: effectTriggeredHandler,
  LP_UPDATED: lpUpdatedHandler,
  BATTLE_PHASE_STARTED: battlePhaseStartedHandler,
  TURN_STARTED: turnStartedHandler,
  TURN_ENDED: turnEndedHandler,
};

export function applyGameEvent(prevState: GameState, evt: GameEvent, playerId: string): GameState {
  const handler = eventHandlers[evt.type];
  if (handler) {
    return handler.apply(prevState, evt.data, playerId);
  }
  return prevState;
}

export function getEventDuration(evt: GameEvent): number {
  const handler = eventHandlers[evt.type];
  return handler?.duration ?? 50;
}
