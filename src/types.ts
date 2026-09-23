export type AttackTargetType = 'MONSTER' | 'COLUMN';

export interface AttackTarget {
  type: AttackTargetType;
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
  effectivePower?: number;
  isRevealed?: boolean;
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
  shadowCard: Card | null;
}

export type GridRow = Tile[];

export interface PlayerState {
  id?: string;
  lp?: number;
  columnsDestroyed?: boolean[];
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
  isMandatory?: boolean;
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

export const BOARD_ROWS = 4;
export const BOARD_COLS = 4;
export const BOARD_COLUMNS = BOARD_COLS;

export const emptyRow = (): GridRow =>
  Array.from({ length: BOARD_COLS }, () => ({ topCard: null, shadowCard: null }));

export const createEmptyBoard = (): GridRow[] =>
  Array.from({ length: BOARD_ROWS }, () => emptyRow());

export const createInitialState = (): GameState => ({
  board: createEmptyBoard(),
  player: {
    columnsDestroyed: Array(BOARD_COLS).fill(false),
    deckCount: 0,
    grave: [],
    fusionDeck: [],
    hand: [],
  },
  opponent: {
    columnsDestroyed: Array(BOARD_COLS).fill(false),
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
