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
    const localRow = data.position.row % 2;

    if (nextState[side]?.board?.[localRow]?.[data.position.col]) {
      if (data.isTrap) {
        nextState[side].board[localRow][data.position.col].trapCard = null;
      } else {
        const destroyedCard = nextState[side].board[localRow][data.position.col].topCard;
        nextState[side].board[localRow][data.position.col].topCard = null;
        if (destroyedCard) {
          nextState[side].trash.push(destroyedCard);
        }
      }
    }

    return nextState;
  },
};
