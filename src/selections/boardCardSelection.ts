import { Position } from '../types';
import {
  CellClickCoords,
  SelectionContext,
  SelectionHandler,
  SelectionHighlights,
} from './types';

export type BoardCardOption = Position;

export function parseBoardCardSelections(rawSelections: any[]): BoardCardOption[] {
  if (!Array.isArray(rawSelections)) return [];

  return rawSelections
    .map((s: any) => {
      const pos = s?.pos || s?.Pos;
      if (!pos) return null;
      const row = pos.row !== undefined ? Number(pos.row) : pos.Row !== undefined ? Number(pos.Row) : null;
      const col = pos.col !== undefined ? Number(pos.col) : pos.Col !== undefined ? Number(pos.Col) : null;
      if (row === null || col === null) return null;
      return { row, col };
    })
    .filter((p): p is Position => p !== null);
}

export function getBoardCardHighlights(options: BoardCardOption[]): SelectionHighlights {
  const validMoveToKeys = new Set<string>();
  for (const p of options) {
    validMoveToKeys.add(`${p.row},${p.col}`);
  }

  return {
    validMoveFromKeys: new Set<string>(),
    selectedMoveFromKey: null,
    validMoveToKeys,
  };
}

export const boardCardSelectionHandler: SelectionHandler<
  BoardCardOption[],
  {}
> = {
  parseSelections: parseBoardCardSelections,

  getInitialState: () => ({}),

  getHighlights: (options: BoardCardOption[]) => {
    return getBoardCardHighlights(options);
  },

  handleCellClick: (
    coords: CellClickCoords,
    options: BoardCardOption[],
    _state: {},
    context: SelectionContext
  ) => {
    const clickedKey = `${coords.absRow},${coords.absCol}`;
    const highlights = getBoardCardHighlights(options);

    if (highlights.validMoveToKeys.has(clickedKey)) {
      context.sendAction('RESOLVE_EFFECT', {
        playerId: context.playerNum,
        selection: { pos: { row: coords.absRow, col: coords.absCol } },
        passed: false,
      });
      return { nextState: {}, resolved: true };
    }

    return { nextState: {} };
  },

  handlePass: (context: SelectionContext) => {
    context.sendAction('RESOLVE_EFFECT', {
      playerId: context.playerNum,
      passed: true,
    });
  },
};
