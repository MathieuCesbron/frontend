import { Card, GameState } from '../types';
import { GameEventHandler } from './types';

export interface CardPlayedData {
  templateId: number;
  instanceId: number;
  playerId: number | string;
  source: string;
  position: { row: number; col: number };
  isTrap: boolean;
}

export const cardPlayedHandler: GameEventHandler<CardPlayedData> = {
  duration: 400,
  apply: (prevState, data, playerId) => {
    const nextState: GameState = JSON.parse(JSON.stringify(prevState));
    const side = String(data.playerId) === String(playerId) ? 'player' : 'opponent';

    let cardToPlace: Card | null = null;

    if (data.source === 'HAND') {
      const handIndex = nextState[side].hand.findIndex((c) => String(c.instanceId) === String(data.instanceId));
      if (handIndex !== -1) {
        cardToPlace = nextState[side].hand.splice(handIndex, 1)[0];
        if (data.templateId !== undefined && data.templateId !== -1) {
          cardToPlace.templateId = data.templateId;
        }
        if (data.instanceId !== undefined) {
          cardToPlace.instanceId = data.instanceId;
        }
      } else {
        if (nextState[side].hand.length > 0) {
          nextState[side].hand.pop();
        }
        cardToPlace = { instanceId: data.instanceId, templateId: data.templateId };
      }
    }

    if (cardToPlace && data.position) {
      const localRow = data.position.row % 2;
      if (!nextState[side].board[localRow][data.position.col]) {
        nextState[side].board[localRow][data.position.col] = { topCard: null, trapCard: null };
      }

      if (data.isTrap) {
        nextState[side].board[localRow][data.position.col].trapCard = cardToPlace;
      } else {
        nextState[side].board[localRow][data.position.col].topCard = cardToPlace;
      }
    }

    return nextState;
  },
};
