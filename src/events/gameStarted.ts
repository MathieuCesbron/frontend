import { GameState, createEmptyBoard } from '../types';
import { GameEventHandler } from './types';

export interface GameStartedData {
  startingPlayerId?: number;
  player1Id?: number;
  player2Id?: number;
  player1DeckCount?: number;
  player2DeckCount?: number;
  player1FusionCount?: number;
  player2FusionCount?: number;
  player1FusionDeck?: any[];
  player2FusionDeck?: any[];
}

export const gameStartedHandler: GameEventHandler<GameStartedData> = {
  duration: 50,
  apply: (prevState, data, playerId) => {
    const nextState: GameState = JSON.parse(JSON.stringify(prevState));
    const isP1 = String(playerId) === String(data.player1Id ?? 1);
    const myFusion = isP1 ? data.player1FusionDeck : data.player2FusionDeck;
    const oppFusion = isP1 ? data.player2FusionDeck : data.player1FusionDeck;
    const myDeckCount = isP1 ? data.player1DeckCount : data.player2DeckCount;
    const oppDeckCount = isP1 ? data.player2DeckCount : data.player1DeckCount;

    nextState.player = {
      lp: 100,
      deckCount: myDeckCount ?? 0,
      trash: [],
      fusionDeck: myFusion ?? [],
      hand: [],
      board: createEmptyBoard(),
    };

    nextState.opponent = {
      lp: 100,
      deckCount: oppDeckCount ?? 0,
      trash: [],
      fusionDeck: oppFusion ?? [],
      hand: [],
      board: createEmptyBoard(),
    };

    if (data.startingPlayerId !== undefined) {
      nextState.activePlayerId = data.startingPlayerId;
    }
    nextState.turn = 1;
    nextState.phase = 'PLAYPHASE';

    return nextState;
  },
};
