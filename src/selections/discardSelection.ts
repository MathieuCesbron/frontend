import {
  HandCardClickInfo,
  SelectionContext,
  SelectionHandler,
  SelectionHighlights,
} from './types';

export interface DiscardOption {
  raw: any;
  value: number;
}

export interface DiscardSelectionState {
  selectedDiscard: number | null;
}

export function parseDiscardSelections(rawSelections: any[]): DiscardOption[] {
  if (!Array.isArray(rawSelections)) return [];

  return rawSelections
    .map((s) => {
      const num = Number(s);
      if (Number.isNaN(num)) return null;
      return { raw: s, value: num };
    })
    .filter((o): o is DiscardOption => o !== null);
}

export function getDiscardHighlights(
  options: DiscardOption[]
): SelectionHighlights {
  const validIndices = new Set<number>();
  const validInstanceIds = new Set<number>();

  for (const opt of options) {
    validIndices.add(opt.value);
    validInstanceIds.add(opt.value);
  }

  return {
    validMoveFromKeys: new Set<string>(),
    selectedMoveFromKey: null,
    validMoveToKeys: new Set<string>(),
    validDiscardIndices: validIndices,
    validDiscardInstanceIds: validInstanceIds,
  };
}

export const discardSelectionHandler: SelectionHandler<
  DiscardOption[],
  DiscardSelectionState
> = {
  parseSelections: parseDiscardSelections,

  getInitialState: (): DiscardSelectionState => ({
    selectedDiscard: null,
  }),

  getHighlights: (options: DiscardOption[]): SelectionHighlights => {
    return getDiscardHighlights(options);
  },

  handleHandCardClick: (
    card: HandCardClickInfo,
    options: DiscardOption[],
    _state: DiscardSelectionState,
    context: SelectionContext
  ) => {
    // Match by instance ID or by hand index against available options
    const match = options.find(
      (opt) => opt.value === card.instanceId || opt.value === card.index
    );

    if (match) {
      context.sendAction('RESOLVE_EFFECT', {
        playerId: context.playerNum,
        selection: match.raw,
        passed: false,
      });
      return { nextState: { selectedDiscard: null }, resolved: true };
    }
  },

  handlePass: (context: SelectionContext) => {
    context.sendAction('RESOLVE_EFFECT', {
      playerId: context.playerNum,
      passed: true,
    });
  },
};
