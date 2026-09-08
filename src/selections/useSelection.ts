import { useState, useEffect, useMemo, useCallback } from 'react';
import { PendingEffect } from '../types';
import { SelectionHandler, SelectionHighlights } from './types';
import { getSelectionHandler } from './registry';

interface UseSelectionProps {
  pendingEffect?: PendingEffect | null;
  playerId: string;
  sendAction: (actionType: string, payload: any) => void;
}

const EMPTY_HIGHLIGHTS: SelectionHighlights = {
  validMoveFromKeys: new Set<string>(),
  selectedMoveFromKey: null,
  validMoveToKeys: new Set<string>(),
};

export function useSelection({
  pendingEffect,
  playerId,
  sendAction,
}: UseSelectionProps) {
  const playerNum = playerId === '1' ? 1 : 2;

  const isMyPendingEffect = Boolean(
    pendingEffect &&
      (String(pendingEffect.playerId) === String(playerId) ||
        pendingEffect.playerId === playerNum)
  );

  const selectionType = isMyPendingEffect ? pendingEffect?.selectionType : null;
  const handler: SelectionHandler | undefined = selectionType
    ? getSelectionHandler(selectionType)
    : undefined;

  const [selectionState, setSelectionState] = useState<any>(() =>
    handler ? handler.getInitialState() : {}
  );

  // Reset state when active pending effect changes
  useEffect(() => {
    if (handler && isMyPendingEffect) {
      setSelectionState(handler.getInitialState());
    } else {
      setSelectionState({});
    }
  }, [pendingEffect, isMyPendingEffect, selectionType]);

  const parsedOptions = useMemo(() => {
    if (!handler || !isMyPendingEffect || !pendingEffect?.selections) {
      return [];
    }
    return handler.parseSelections(pendingEffect.selections);
  }, [handler, isMyPendingEffect, pendingEffect?.selections]);

  const highlights: SelectionHighlights = useMemo(() => {
    if (!handler || !isMyPendingEffect) {
      return EMPTY_HIGHLIGHTS;
    }
    return handler.getHighlights(parsedOptions, selectionState);
  }, [handler, isMyPendingEffect, parsedOptions, selectionState]);

  const handleCellClick = useCallback(
    (absRow: number, absCol: number, isOpponent: boolean): boolean => {
      if (!isMyPendingEffect || !handler || !handler.handleCellClick) {
        return false;
      }

      const result = handler.handleCellClick(
        { absRow, absCol, isOpponent },
        parsedOptions,
        selectionState,
        { playerNum, sendAction }
      );

      if (result) {
        setSelectionState(result.nextState);
      }
      return true;
    },
    [isMyPendingEffect, handler, parsedOptions, selectionState, playerNum, sendAction]
  );

  const handlePassEffect = useCallback(() => {
    if (!isMyPendingEffect) return;

    if (handler && handler.handlePass) {
      handler.handlePass({ playerNum, sendAction });
    } else {
      sendAction('RESOLVE_EFFECT', {
        playerId: playerNum,
        passed: true,
      });
    }

    if (handler) {
      setSelectionState(handler.getInitialState());
    }
  }, [isMyPendingEffect, handler, playerNum, sendAction]);

  return {
    isMyPendingEffect,
    selectionType,
    highlights,
    handleCellClick,
    handlePassEffect,
  };
}
