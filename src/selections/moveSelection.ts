import { Position } from '../types';
import {
  CellClickCoords,
  SelectionContext,
  SelectionHandler,
  SelectionHighlights,
} from './types';

export interface MoveOption {
  from: Position;
  to: Position;
}

export interface MoveSelectionState {
  selectedMoveFrom: Position | null;
}

export function parseMoveSelections(rawSelections: any[]): MoveOption[] {
  if (!Array.isArray(rawSelections)) return [];

  return rawSelections
    .map((s: any) => {
      const from = s?.from || s?.From;
      const to = s?.to || s?.To;
      if (!from || !to) return null;

      const fromRow = from.row !== undefined ? from.row : from.Row;
      const fromCol = from.col !== undefined ? from.col : from.Col;
      const toRow = to.row !== undefined ? to.row : to.Row;
      const toCol = to.col !== undefined ? to.col : to.Col;

      if (
        fromRow === undefined ||
        fromCol === undefined ||
        toRow === undefined ||
        toCol === undefined
      ) {
        return null;
      }

      return {
        from: { row: Number(fromRow), col: Number(fromCol) },
        to: { row: Number(toRow), col: Number(toCol) },
      };
    })
    .filter((m): m is MoveOption => m !== null);
}

export function getMoveHighlights(
  moves: MoveOption[],
  state: MoveSelectionState
): SelectionHighlights {
  const validMoveFromKeys = new Set<string>();
  for (const m of moves) {
    validMoveFromKeys.add(`${m.from.row},${m.from.col}`);
  }

  const selectedMoveFrom = state.selectedMoveFrom;
  const selectedMoveFromKey = selectedMoveFrom
    ? `${selectedMoveFrom.row},${selectedMoveFrom.col}`
    : null;

  const validMoveToKeys = new Set<string>();
  if (selectedMoveFrom) {
    for (const m of moves) {
      if (
        m.from.row === selectedMoveFrom.row &&
        m.from.col === selectedMoveFrom.col
      ) {
        validMoveToKeys.add(`${m.to.row},${m.to.col}`);
      }
    }
  }

  return {
    validMoveFromKeys,
    selectedMoveFromKey,
    validMoveToKeys,
  };
}

export const moveSelectionHandler: SelectionHandler<
  MoveOption[],
  MoveSelectionState
> = {
  parseSelections: parseMoveSelections,

  getInitialState: (): MoveSelectionState => ({
    selectedMoveFrom: null,
  }),

  getHighlights: getMoveHighlights,

  handleCellClick: (
    coords: CellClickCoords,
    moves: MoveOption[],
    state: MoveSelectionState,
    context: SelectionContext
  ) => {
    const clickedKey = `${coords.absRow},${coords.absCol}`;
    const highlights = getMoveHighlights(moves, state);

    if (state.selectedMoveFrom) {
      // 1. Did the user click on a valid target destination?
      if (highlights.validMoveToKeys.has(clickedKey)) {
        context.sendAction('RESOLVE_EFFECT', {
          playerId: context.playerNum,
          selection: {
            from: state.selectedMoveFrom,
            to: { row: coords.absRow, col: coords.absCol },
          },
          passed: false,
        });
        return { nextState: { selectedMoveFrom: null }, resolved: true };
      }

      // 2. Did the user click on the currently selected source card? Deselect it.
      if (highlights.selectedMoveFromKey === clickedKey) {
        return { nextState: { selectedMoveFrom: null } };
      }

      // 3. Did the user click on another valid source card? Switch selection.
      if (highlights.validMoveFromKeys.has(clickedKey)) {
        return {
          nextState: { selectedMoveFrom: { row: coords.absRow, col: coords.absCol } },
        };
      }

      // 4. Clicked elsewhere on the board
      return { nextState: { selectedMoveFrom: null } };
    }

    // No source card selected yet: select this source card if valid
    if (highlights.validMoveFromKeys.has(clickedKey)) {
      return {
        nextState: { selectedMoveFrom: { row: coords.absRow, col: coords.absCol } },
      };
    }

    return { nextState: state };
  },

  handlePass: (context: SelectionContext) => {
    context.sendAction('RESOLVE_EFFECT', {
      playerId: context.playerNum,
      passed: true,
    });
  },
};
