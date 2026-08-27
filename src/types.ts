export interface Card {
  id: string;
  name: string;
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
  }
};
