import { PendingEffect, Position } from '../types';

export type SelectionType = 'MOVE' | 'BOARD_CARD' | string;

export interface SelectionContext {
  playerNum: number;
  sendAction: (actionType: string, payload: any) => void;
}

export interface SelectionHighlights {
  validMoveFromKeys: Set<string>;
  selectedMoveFromKey: string | null;
  validMoveToKeys: Set<string>;
  validDiscardIndices?: Set<number>;
  validDiscardInstanceIds?: Set<number>;
}

export interface CellClickCoords {
  absRow: number;
  absCol: number;
  isOpponent: boolean;
}

export interface HandCardClickInfo {
  index: number;
  instanceId: number;
}

export interface SelectionHandler<TOptions = any, TState = any> {
  parseSelections: (rawSelections: any[]) => TOptions;
  getInitialState: () => TState;
  getHighlights: (options: TOptions, state: TState) => SelectionHighlights;
  handleCellClick?: (
    coords: CellClickCoords,
    options: TOptions,
    state: TState,
    context: SelectionContext
  ) => { nextState: TState; resolved?: boolean } | void;
  handleHandCardClick?: (
    card: HandCardClickInfo,
    options: TOptions,
    state: TState,
    context: SelectionContext
  ) => { nextState: TState; resolved?: boolean } | void;
  handlePass?: (context: SelectionContext) => void;
}
