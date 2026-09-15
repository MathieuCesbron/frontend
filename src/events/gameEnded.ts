import { GameState } from '../types';
import { GameEventHandler } from './types';

interface GameEndedData {
  winnerId?: string | number;
  reason?: string;
}

export const gameEndedHandler: GameEventHandler<GameEndedData> = {
  apply(prevState: GameState, data: GameEndedData) {
    try {
      const rawWinner = data?.winnerId;
      const winner = String(rawWinner ?? 'unknown');
      const rawReason = data?.reason ?? '';
      const reason = rawReason ? ` Reason: ${rawReason}` : '';
      window.alert(`Game ended. Winner: ${winner}.${reason}`);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to show game ended alert', e);
    }
    return prevState;
  },
  duration: 1500,
};

export type { GameEndedData };
