import { GameState } from '../types';
import { GameEventHandler } from './types';

export interface CardDrawnData {
  templateId: number;
  instanceId: number;
  playerId: number | string;
}

export const cardDrawnHandler: GameEventHandler<CardDrawnData> = {
  duration: 400,
  apply: (prevState, data, playerId) => {
    const nextState: GameState = JSON.parse(JSON.stringify(prevState));
    const isMe = String(data.playerId) === String(playerId);
    const side = isMe ? 'player' : 'opponent';

    nextState[side].deckCount = Math.max(0, nextState[side].deckCount - 1);
    nextState[side].hand.push({
      instanceId: data.instanceId,
      templateId: data.templateId,
    });

    return nextState;
  },
};
