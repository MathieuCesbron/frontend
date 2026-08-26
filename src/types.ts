export interface Card {
  id: string;
  name: string;
}

export type GridRow = (Card | null)[];

export interface PlayerState {
  lp: number;
  deckCount: number;
  trashCount: number;
  fusionDeckCount: number;
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
    deckCount: 40,
    trashCount: 0,
    fusionDeckCount: 15,
    hand: [
      { id: 'p1', name: 'Card 1' },
      { id: 'p2', name: 'Card 2' },
      { id: 'p3', name: 'Card 3' },
      { id: 'p4', name: 'Card 4' },
      { id: 'p5', name: 'Card 5' },
    ],
    field: [
      [null, { id: 'pf1', name: 'Monster' }, null, null],
      [null, null, { id: 'pf2', name: 'Spell' }, null]
    ]
  },
  opponent: {
    lp: 20,
    deckCount: 40,
    trashCount: 3,
    fusionDeckCount: 15,
    hand: [
      { id: 'o1', name: 'Hidden' },
      { id: 'o2', name: 'Hidden' },
      { id: 'o3', name: 'Hidden' },
      { id: 'o4', name: 'Hidden' },
      { id: 'o5', name: 'Hidden' },
    ],
    field: [
      [null, { id: 'of1', name: 'Monster' }, null, null],
      [{ id: 'of2', name: 'Trap' }, null, null, null]
    ]
  }
};
