import { GameState } from '../types';
import { GameEventHandler } from './types';

export interface EffectTriggeredData {
  templateId?: number;
  instanceId?: number;
  playerId?: number | string;
  PlayerId?: number | string;
  position?: { row: number; col: number };
}

export const effectTriggeredHandler: GameEventHandler<EffectTriggeredData> = {
  duration: 2000,
  apply: (prevState) => {
    // Effect trigger is visual / animation only; board state is unchanged by trigger itself
    return prevState;
  },
};
