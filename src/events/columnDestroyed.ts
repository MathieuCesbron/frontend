import { GameState } from '../types';
import { GameEventHandler } from './types';

export interface ColumnDestroyedData {
  playerId: number | string;
  column: number;
}

export const columnDestroyedHandler: GameEventHandler<ColumnDestroyedData> = {
  duration: 300,
  apply: (prevState, data, playerId) => {
    const nextState: GameState = JSON.parse(JSON.stringify(prevState));
    const isMe =
      String(data.playerId) === String(playerId) ||
      (String(data.playerId) === 'PLAYER1' && String(playerId) === '1') ||
      (String(data.playerId) === '1' && String(playerId) === 'PLAYER1') ||
      (String(data.playerId) === 'PLAYER2' && String(playerId) === '2') ||
      (String(data.playerId) === '2' && String(playerId) === 'PLAYER2');
    const side = isMe ? 'player' : 'opponent';

    if (data.column !== undefined && data.column >= 0 && data.column < 4) {
      if (!nextState[side].columnsDestroyed) {
        nextState[side].columnsDestroyed = [false, false, false, false];
      }
      nextState[side].columnsDestroyed[data.column] = true;
    }

    return nextState;
  },
};
