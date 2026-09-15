import { GameState } from '../types';
import { GameEventHandler } from './types';

export interface CardDestroyedData {
  instanceId?: number;
  position: { row: number; col: number };
  isTrap?: boolean;
}

export const cardDestroyedHandler: GameEventHandler<CardDestroyedData> = {
  duration: 350,
  apply: (prevState, data, playerId) => {
    const nextState: GameState = JSON.parse(JSON.stringify(prevState));
    if (!data.position) return nextState;

    const isPlayer = (playerId === '1' && data.position.row >= 2) || (playerId === '2' && data.position.row < 2);
    const side = isPlayer ? 'player' : 'opponent';
    const { row, col } = data.position;

    if (nextState.board?.[row]?.[col]) {
      if (data.isTrap) {
        nextState.board[row][col].trapCard = null;
      } else {
        const destroyedCard = nextState.board[row][col].topCard;
        nextState.board[row][col].topCard = null;
        if (destroyedCard) {
          nextState[side].grave.push(destroyedCard);
        }
      }
    }

    return nextState;
  },
};
