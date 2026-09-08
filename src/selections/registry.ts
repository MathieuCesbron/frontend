import { SelectionHandler } from './types';
import { moveSelectionHandler } from './moveSelection';
import { discardSelectionHandler } from './discardSelection';

export const selectionHandlers: Record<string, SelectionHandler<any, any>> = {
  MOVE: moveSelectionHandler,
  DISCARD: discardSelectionHandler,
};

export function getSelectionHandler(
  selectionType: string
): SelectionHandler<any, any> | undefined {
  return selectionHandlers[selectionType];
}
