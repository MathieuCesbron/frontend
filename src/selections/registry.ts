import { SelectionHandler } from './types';
import { moveSelectionHandler } from './moveSelection';
import { discardSelectionHandler } from './discardSelection';
import { boardCardSelectionHandler } from './boardCardSelection';

export const selectionHandlers: Record<string, SelectionHandler<any, any>> = {
  MOVE: moveSelectionHandler,
  DISCARD: discardSelectionHandler,
  BOARD_CARD: boardCardSelectionHandler,
};

export function getSelectionHandler(
  selectionType: string
): SelectionHandler<any, any> | undefined {
  return selectionHandlers[selectionType];
}
