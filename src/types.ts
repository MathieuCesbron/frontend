export interface Card {
  instanceId: number;
  templateId: number;
}

export type GridRow = (Card | null)[];

export interface PlayerState {
  lp: number;
  deckCount: number;
  trash: Card[];
  fusionDeck: Card[];
  hand: Card[];
  field: [GridRow, GridRow]; // 2 rows of 4 columns
}

export interface GameState {
  player: PlayerState;
  opponent: PlayerState;
  turn: number;
  activePlayerId: number;
  phase: string;
}

export const MOCK_STATE: GameState = {
  player: {
    lp: 20,
    deckCount: 0,
    trash: [],
    fusionDeck: [],
    hand: [],
    field: [
      [null, null, null, null],
      [null, null, null, null]
    ]
  },
  opponent: {
    lp: 20,
    deckCount: 0,
    trash: [],
    fusionDeck: [],
    hand: [],
    field: [
      [null, null, null, null],
      [null, null, null, null]
    ]
  },
  turn: 1,
  activePlayerId: 1,
  phase: 'PLAYPHASE'
};
