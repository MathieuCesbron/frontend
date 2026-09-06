import { GameState } from '../types';
import { GameEventHandler } from './types';

export interface TurnStartedData {
  turn?: number;
  playerId?: number;
}

export const turnStartedHandler: GameEventHandler<TurnStartedData> = {
  duration: 50,
  apply: (prevState, data) => {
    const nextState: GameState = JSON.parse(JSON.stringify(prevState));
    nextState.phase = 'PLAYPHASE';
    if (data?.turn !== undefined) {
      nextState.turn = data.turn;
    }
    if (data?.playerId !== undefined) {
      nextState.activePlayerId = data.playerId;
    }
    return nextState;
  },
};
