export interface AttackTarget {
  type: 'POSITION' | 'PLAYER';
  position?: Position;
}

export interface Card {
  instanceId: number;
  templateId: number;
  attackTargets?: AttackTarget[];
}

export interface Tile {
  topCard: Card | null;
  trapCard: Card | null;
}

export type GridRow = Tile[];

export interface PlayerState {
  id?: string;
  lp: number;
  deckCount: number;
  trash: Card[];
  fusionDeck: Card[];
  hand: Card[];
  board: GridRow[]; // 4 rows of 4 columns (absolute)
}

export interface Position {
  row: number;
  col: number;
}

export interface MoveSelection {
  from: Position;
  to: Position;
}

export interface PendingEffect {
  templateId?: number;
  instanceId?: number;
  playerId: string | number;
  position?: Position;
  selectionType: string;
  isOptional?: boolean;
  selections: any[];
}

export interface GameState {
  player: PlayerState;
  opponent: PlayerState;
  turn: number;
  activePlayerId: number;
  phase: string;
  pendingEffect?: PendingEffect | null;
}

export const emptyRow = (): GridRow => [
  { topCard: null, trapCard: null },
  { topCard: null, trapCard: null },
  { topCard: null, trapCard: null },
  { topCard: null, trapCard: null },
];

export const createEmptyBoard = (): GridRow[] => [
  emptyRow(),
  emptyRow(),
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
