import { GameState } from '../types';
import { GameEventHandler } from './types';

export interface LPUpdatedData {
  playerId: number | string;
  lp?: number;
  delta?: number;
}

export const lpUpdatedHandler: GameEventHandler<LPUpdatedData> = {
  duration: 300,
  apply: (prevState, data, playerId) => {
    const nextState: GameState = JSON.parse(JSON.stringify(prevState));
    const isMe = String(data.playerId) === String(playerId);
    const side = isMe ? 'player' : 'opponent';

    if (data.lp !== undefined) {
      nextState[side].lp = data.lp;
    }

    return nextState;
  },
};
