import { SelectionHandler } from './types';
import { moveSelectionHandler } from './moveSelection';
import { discardSelectionHandler } from './discardSelection';
import { boardCardSelectionHandler } from './boardCardSelection';
import { graveSelectionHandler } from './graveSelection';

export const selectionHandlers: Record<string, SelectionHandler<any, any>> = {
  MOVE: moveSelectionHandler,
  DISCARD: discardSelectionHandler,
  BOARD_CARD: boardCardSelectionHandler,
  GRAVE: graveSelectionHandler,
};

export function getSelectionHandler(
  selectionType: string
): SelectionHandler<any, any> | undefined {
  return selectionHandlers[selectionType];
}
