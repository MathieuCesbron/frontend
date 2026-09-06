import { GameState } from '../types';

export interface GameEvent<T = any> {
  type: string;
  data: T;
}

export interface GameEventHandler<T = any> {
  apply: (prevState: GameState, data: T, playerId: string) => GameState;
  duration?: number;
}
