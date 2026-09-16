import { Card, GameState } from '../types';
import { GameEventHandler } from './types';

export interface FusionPlayedData {
  templateId: number;
  instanceId: number;
  playerId: number | string;
  position: { row: number; col: number };
  materialPositions?: Array<{ row: number; col: number }>;
}

export const fusionPlayedHandler: GameEventHandler<FusionPlayedData> = {
  duration: 400,
  apply: (prevState, data, playerId) => {
    const nextState: GameState = JSON.parse(JSON.stringify(prevState));
    const side = String(data.playerId) === String(playerId) ? 'player' : 'opponent';

    const fusionIndex = nextState[side].fusionDeck.findIndex((c) => String(c.instanceId) === String(data.instanceId));
    let cardToPlace: Card | null = null;

    if (fusionIndex !== -1) {
      cardToPlace = nextState[side].fusionDeck.splice(fusionIndex, 1)[0];
    } else {
      if (nextState[side].fusionDeck.length > 0) {
        nextState[side].fusionDeck.pop();
      }
      cardToPlace = { instanceId: data.instanceId, templateId: data.templateId };
    }

    if (data.templateId !== undefined && data.templateId !== -1) {
      cardToPlace.templateId = data.templateId;
    }
    if (data.instanceId !== undefined) {
      cardToPlace.instanceId = data.instanceId;
    }

    if (cardToPlace && data.position) {
      const { row, col } = data.position;
      if (!nextState.board[row][col]) {
        nextState.board[row][col] = { topCard: null, shadowCard: null };
      }
      nextState.board[row][col].topCard = cardToPlace;
    }

    return nextState;
  },
};
