import { GameState } from '../types';
import { GameEventHandler } from './types';

export interface InitialPlayerState {
  deckCount: number;
  fusionCount: number;
}

export interface GameStartedData {
  startingPlayerId?: number;
  players?: Record<string, InitialPlayerState>;
}

export const gameStartedHandler: GameEventHandler<GameStartedData> = {
  duration: 50,
  apply: (prevState, data, playerId) => {
    const nextState: GameState = JSON.parse(JSON.stringify(prevState));

    if (data.players) {
      const playerKeys = Object.keys(data.players);
      const myKey = playerKeys.find(
        (k) =>
          k === String(playerId) ||
          (k === '1' && String(playerId) === 'PLAYER1') ||
          (k === 'PLAYER1' && String(playerId) === '1') ||
          (k === '2' && String(playerId) === 'PLAYER2') ||
          (k === 'PLAYER2' && String(playerId) === '2')
      );
      const oppKey = playerKeys.find((k) => k !== myKey);

      const myStats = myKey ? data.players[myKey] : undefined;
      const oppStats = oppKey ? data.players[oppKey] : undefined;

      if (myStats) {
        nextState.player.deckCount = myStats.deckCount;
        nextState.player.fusionDeck = Array.from({ length: myStats.fusionCount }, () => ({
          instanceId: -1,
          templateId: -1,
        }));
      }

      if (oppStats) {
        nextState.opponent.deckCount = oppStats.deckCount;
        nextState.opponent.fusionDeck = Array.from({ length: oppStats.fusionCount }, () => ({
          instanceId: -1,
          templateId: -1,
        }));
      }
    }

    if (data.startingPlayerId !== undefined) {
      nextState.activePlayerId = data.startingPlayerId;
    }
    nextState.turn = 1;
    nextState.phase = 'PLAYPHASE';

    return nextState;
  },
};
