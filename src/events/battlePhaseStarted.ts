import { GameState } from '../types';
import { GameEventHandler } from './types';

export const battlePhaseStartedHandler: GameEventHandler<void> = {
  duration: 50,
  apply: (prevState) => {
    const nextState: GameState = JSON.parse(JSON.stringify(prevState));
    nextState.phase = 'BATTLEPHASE';
    return nextState;
  },
};
