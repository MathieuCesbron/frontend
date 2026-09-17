import { Card } from '../types';
import {
  SelectionContext,
  SelectionHandler,
  SelectionHighlights,
} from './types';

export interface GraveOption {
  raw: any;
  instanceId: number;
}

export interface GraveSelectionState {
  selectedInstanceId: number | null;
}

export function parseGraveSelections(rawSelections: any[]): GraveOption[] {
  if (!Array.isArray(rawSelections)) return [];

  return rawSelections
    .map((s) => {
      if (typeof s === 'number') {
        return { raw: { instance_id: s }, instanceId: s };
      }
      const instanceId =
        s?.instance_id !== undefined
          ? Number(s.instance_id)
          : s?.instanceId !== undefined
          ? Number(s.instanceId)
          : s?.InstanceID !== undefined
          ? Number(s.InstanceID)
          : null;

      if (instanceId === null || Number.isNaN(instanceId)) {
        return null;
      }
      return { raw: s, instanceId };
    })
    .filter((o): o is GraveOption => o !== null);
}

export function getGraveHighlights(
  options: GraveOption[]
): SelectionHighlights {
  const validInstanceIds = new Set<number>();

  for (const opt of options) {
    validInstanceIds.add(opt.instanceId);
  }

  return {
    validMoveFromKeys: new Set<string>(),
    selectedMoveFromKey: null,
    validMoveToKeys: new Set<string>(),
    validGraveInstanceIds: validInstanceIds,
  };
}

export const graveSelectionHandler: SelectionHandler<
  GraveOption[],
  GraveSelectionState
> = {
  parseSelections: parseGraveSelections,

  getInitialState: (): GraveSelectionState => ({
    selectedInstanceId: null,
  }),

  getHighlights: (options: GraveOption[]): SelectionHighlights => {
    return getGraveHighlights(options);
  },

  handleGraveCardClick: (
    card: Card,
    options: GraveOption[],
    _state: GraveSelectionState,
    context: SelectionContext
  ) => {
    const match = options.find((opt) => opt.instanceId === card.instanceId);

    if (match) {
      context.sendAction('RESOLVE_EFFECT', {
        playerId: context.playerNum,
        selection: { instance_id: match.instanceId },
        passed: false,
      });
      return { nextState: { selectedInstanceId: null }, resolved: true };
    }
  },

  handlePass: (context: SelectionContext) => {
    context.sendAction('RESOLVE_EFFECT', {
      playerId: context.playerNum,
      passed: true,
    });
  },
};
