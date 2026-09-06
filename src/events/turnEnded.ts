import { GameState } from '../types';
import { GameEventHandler } from './types';

export const turnEndedHandler: GameEventHandler<void> = {
  duration: 50,
  apply: (prevState) => {
    const nextState: GameState = JSON.parse(JSON.stringify(prevState));
    nextState.phase = 'PLAYPHASE';
    return nextState;
  },
};
