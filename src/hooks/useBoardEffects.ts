import { useState, useEffect, useRef } from 'react';
import { GameEvent } from '../events';

export function useBoardEffects(
  latestEvent: GameEvent | null,
  onCardPlayed?: () => void
) {
  const [animatedInstanceId, setAnimatedInstanceId] = useState<string | null>(null);
  const [activeEffectKeys, setActiveEffectKeys] = useState<Record<string, boolean>>({});
  const [activeEffectIds, setActiveEffectIds] = useState<Record<string, boolean>>({});
  const effectTimersRef = useRef<number[]>([]);

  useEffect(() => {
    if (!latestEvent) return;

    if (latestEvent.type === 'CARD_PLAYED') {
      const { instanceId } = latestEvent.data;
      setAnimatedInstanceId(String(instanceId));
      const timer = window.setTimeout(() => setAnimatedInstanceId(null), 1000);
      effectTimersRef.current.push(timer);
      onCardPlayed?.();
    } else if (latestEvent.type === 'EFFECT_TRIGGERED' || latestEvent.type === 'SHADOW_REVEALED') {
      const { position, instanceId } = latestEvent.data || {};
      const timers: number[] = [];

      if (position && position.row !== undefined && position.col !== undefined) {
        const posKey = `${position.row},${position.col}`;
        setActiveEffectKeys((prev) => ({ ...prev, [posKey]: true }));
        const timer = window.setTimeout(() => {
          setActiveEffectKeys((prev) => {
            const next = { ...prev };
            delete next[posKey];
            return next;
          });
        }, 2000);
        timers.push(timer);
      }

      if (instanceId !== undefined && instanceId !== -1) {
        const idKey = String(instanceId);
        setActiveEffectIds((prev) => ({ ...prev, [idKey]: true }));
        const timer = window.setTimeout(() => {
          setActiveEffectIds((prev) => {
            const next = { ...prev };
            delete next[idKey];
            return next;
          });
        }, 2000);
        timers.push(timer);
      }

      effectTimersRef.current.push(...timers);
    } else if (latestEvent.type === 'CARDS_SWAPPED') {
      const { initiator, target } = latestEvent.data || {};
      const timers: number[] = [];

      if (
        initiator &&
        initiator.row !== undefined &&
        initiator.col !== undefined &&
        target &&
        target.row !== undefined &&
        target.col !== undefined
      ) {
        const keyA = `${initiator.row},${initiator.col}`;
        const keyB = `${target.row},${target.col}`;

        setActiveEffectKeys((prev) => ({ ...prev, [keyA]: true, [keyB]: true }));

        const timer = window.setTimeout(() => {
          setActiveEffectKeys((prev) => {
            const next = { ...prev };
            delete next[keyA];
            delete next[keyB];
            return next;
          });
        }, 1000);

        timers.push(timer);
      }

      effectTimersRef.current.push(...timers);
    }
  }, [latestEvent]);

  useEffect(() => {
    return () => {
      effectTimersRef.current.forEach(clearTimeout);
      effectTimersRef.current = [];
    };
  }, []);

  return {
    animatedInstanceId,
    activeEffectKeys,
    activeEffectIds,
  };
}
