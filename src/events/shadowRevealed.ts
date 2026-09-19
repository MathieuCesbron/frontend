import { GameState } from '../types';
import { GameEventHandler } from './types';

export interface ShadowRevealedData {
  templateId: number;
  instanceId: number;
  playerId?: number | string;
  position: { row: number; col: number };
}

export const shadowRevealedHandler: GameEventHandler<ShadowRevealedData> = {
  duration: 2000,
  apply: (prevState, data) => {
    const nextState: GameState = JSON.parse(JSON.stringify(prevState));
    if (!data.position) return nextState;

    const { row, col } = data.position;
    if (nextState.board?.[row]?.[col]) {
      if (!nextState.board[row][col].shadowCard) {
        nextState.board[row][col].shadowCard = {
          instanceId: data.instanceId,
          templateId: data.templateId,
          isRevealed: true,
        };
      } else {
        nextState.board[row][col].shadowCard.instanceId = data.instanceId;
        nextState.board[row][col].shadowCard.templateId = data.templateId;
        nextState.board[row][col].shadowCard.isRevealed = true;
      }
    }

    return nextState;
  },
};
