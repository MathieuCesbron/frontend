export interface Card {
  instanceId: number;
  templateId: number;
}

export interface Tile {
  topCard: Card | null;
  trapCard: Card | null;
}

export type GridRow = Tile[];

export interface PlayerState {
  lp: number;
  deckCount: number;
  trash: Card[];
  fusionDeck: Card[];
  hand: Card[];
  board: [GridRow, GridRow]; // 2 rows of 4 columns
}

export interface GameState {
  player: PlayerState;
  opponent: PlayerState;
  turn: number;
  activePlayerId: number;
  phase: string;
}

export const emptyRow = (): GridRow => [
  { topCard: null, trapCard: null },
  { topCard: null, trapCard: null },
  { topCard: null, trapCard: null },
  { topCard: null, trapCard: null },
];

export const createEmptyBoard = (): [GridRow, GridRow] => [
  emptyRow(),
  emptyRow(),
];

export const createInitialState = (): GameState => ({
  player: {
    lp: 100,
    deckCount: 0,
    trash: [],
    fusionDeck: [],
    hand: [],
    board: createEmptyBoard(),
  },
  opponent: {
    lp: 100,
    deckCount: 0,
    trash: [],
    fusionDeck: [],
    hand: [],
    board: createEmptyBoard(),
  },
  turn: 1,
  activePlayerId: 1,
  phase: 'PLAYPHASE',
});

export const MOCK_STATE: GameState = createInitialState();
