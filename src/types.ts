export interface AttackTarget {
  type: 'POSITION' | 'PLAYER';
  position?: Position;
}

export interface PatternCell {
  position: Position;
  attribute?: string | null;
}

export interface Pattern {
  patternCells: PatternCell[];
}

export interface Card {
  instanceId: number;
  templateId: number;
  pattern?: Pattern;
  attackTargets?: AttackTarget[];
  materialCombinations?: Position[][];
}

export interface CardDefinition {
  templateId: number;
  name: string;
  type: string;
  description: string;
  power?: number;
  attribute?: string;
  pattern?: Pattern;
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
  grave: Card[];
  fusionDeck: Card[];
  hand: Card[];
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
  board: GridRow[]; // 4 rows of 4 columns (absolute)
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
  board: createEmptyBoard(),
  player: {
    lp: 100,
    deckCount: 0,
    grave: [],
    fusionDeck: [],
    hand: [],
  },
  opponent: {
    lp: 100,
    deckCount: 0,
    grave: [],
    fusionDeck: [],
    hand: [],
  },
  turn: 1,
  activePlayerId: 1,
  phase: 'PLAYPHASE',
});

export const MOCK_STATE: GameState = createInitialState();
