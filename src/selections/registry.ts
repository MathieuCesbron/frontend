import { SelectionHandler } from './types';
import { moveSelectionHandler } from './moveSelection';

export const selectionHandlers: Record<string, SelectionHandler<any, any>> = {
  MOVE: moveSelectionHandler,
};

export function getSelectionHandler(
  selectionType: string
): SelectionHandler<any, any> | undefined {
  return selectionHandlers[selectionType];
}
