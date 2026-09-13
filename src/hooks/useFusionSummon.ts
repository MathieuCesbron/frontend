import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, Position } from '../types';

interface UseFusionSummonProps {
  fusionDeck: Card[];
  playerNum: number;
  isMyTurn: boolean;
  isPlayPhase: boolean;
  sendAction: (actionType: string, payload: any) => void;
}

export type FusionStep = 'select-materials' | 'select-position';

const posEquals = (a: Position, b: Position) => a.row === b.row && a.col === b.col;
const posKey = (p: Position) => `${p.row},${p.col}`;

export function useFusionSummon({
  fusionDeck,
  playerNum,
  isMyTurn,
  isPlayPhase,
  sendAction,
}: UseFusionSummonProps) {
  const [selectedFusionCard, setSelectedFusionCard] = useState<Card | null>(null);
  const [selectedMaterialPositions, setSelectedMaterialPositions] = useState<Position[]>([]);
  const [completedCombo, setCompletedCombo] = useState<Position[] | null>(null);
  const [fusionStep, setFusionStep] = useState<FusionStep>('select-materials');

  // Filter combos that contain all currently selected positions
  const matchingCombos = useMemo(() => {
    if (!selectedFusionCard || !selectedFusionCard.materialCombinations) return [];
    if (selectedMaterialPositions.length === 0) return selectedFusionCard.materialCombinations;

    return selectedFusionCard.materialCombinations.filter((combo) =>
      selectedMaterialPositions.every((selPos) =>
        combo.some((comboPos) => posEquals(comboPos, selPos))
      )
    );
  }, [selectedFusionCard, selectedMaterialPositions]);

  // Valid material keys to highlight next on the board during 'select-materials' step
  const validMaterialKeys = useMemo(() => {
    const keys = new Set<string>();
    if (!selectedFusionCard || !isMyTurn || !isPlayPhase || fusionStep !== 'select-materials') {
      return keys;
    }

    matchingCombos.forEach((combo) => {
      combo.forEach((pos) => {
        if (!selectedMaterialPositions.some((sel) => posEquals(sel, pos))) {
          keys.add(posKey(pos));
        }
      });
    });

    return keys;
  }, [selectedFusionCard, isMyTurn, isPlayPhase, fusionStep, matchingCombos, selectedMaterialPositions]);

  // Selected material keys during 'select-materials' step
  const selectedMaterialKeys = useMemo(() => {
    if (fusionStep !== 'select-materials') {
      return new Set<string>();
    }
    return new Set(selectedMaterialPositions.map(posKey));
  }, [fusionStep, selectedMaterialPositions]);

  // Spawn target keys during 'select-position' step
  const fusionSpawnTargetKeys = useMemo(() => {
    if (fusionStep !== 'select-position' || !completedCombo) {
      return new Set<string>();
    }
    return new Set(completedCombo.map(posKey));
  }, [fusionStep, completedCombo]);

  // Reset fusion selection if turn or phase changes, or if card is no longer valid
  useEffect(() => {
    if (!isMyTurn || !isPlayPhase) {
      setSelectedFusionCard(null);
      setSelectedMaterialPositions([]);
      setCompletedCombo(null);
      setFusionStep('select-materials');
      return;
    }

    if (selectedFusionCard) {
      const currentCard = fusionDeck.find(
        (c) => c.instanceId === selectedFusionCard.instanceId
      );
      if (
        !currentCard ||
        !currentCard.materialCombinations ||
        currentCard.materialCombinations.length === 0
      ) {
        setSelectedFusionCard(null);
        setSelectedMaterialPositions([]);
        setCompletedCombo(null);
        setFusionStep('select-materials');
      } else {
        setSelectedFusionCard(currentCard);
      }
    }
  }, [isMyTurn, isPlayPhase, fusionDeck]);

  const handleSelectFusionCard = useCallback(
    (card: Card) => {
      if (!isMyTurn || !isPlayPhase) return;
      if (!card.materialCombinations || card.materialCombinations.length === 0) return;

      if (selectedFusionCard?.instanceId === card.instanceId) {
        setSelectedFusionCard(null);
        setSelectedMaterialPositions([]);
        setCompletedCombo(null);
        setFusionStep('select-materials');
      } else {
        setSelectedFusionCard(card);
        setSelectedMaterialPositions([]);
        setCompletedCombo(null);
        setFusionStep('select-materials');
      }
    },
    [isMyTurn, isPlayPhase, selectedFusionCard]
  );

  const cancelFusion = useCallback(() => {
    setSelectedFusionCard(null);
    setSelectedMaterialPositions([]);
    setCompletedCombo(null);
    setFusionStep('select-materials');
  }, []);

  const handleFusionCellClick = useCallback(
    (absRow: number, absCol: number, isOpponent: boolean): boolean => {
      if (!selectedFusionCard || isOpponent || !isMyTurn || !isPlayPhase) {
        return false;
      }

      const clickedPos = { row: absRow, col: absCol };
      const key = posKey(clickedPos);

      // STEP 2: Place Fusion Monster (selecting placement position from material positions)
      if (fusionStep === 'select-position' && completedCombo) {
        const isValidSpawnPos = completedCombo.some((p) => posEquals(p, clickedPos));
        if (isValidSpawnPos) {
          sendAction('PLAY_FUSION', {
            playerId: playerNum,
            instanceId: selectedFusionCard.instanceId,
            materialPositions: completedCombo,
            position: clickedPos,
          });

          setSelectedFusionCard(null);
          setSelectedMaterialPositions([]);
          setCompletedCombo(null);
          setFusionStep('select-materials');
          return true;
        }
        return false;
      }

      // STEP 1: Select Materials
      // If clicking an already selected material: unselect it
      if (selectedMaterialKeys.has(key)) {
        setSelectedMaterialPositions((prev) =>
          prev.filter((p) => !posEquals(p, clickedPos))
        );
        return true;
      }

      // If clicking a valid next material:
      if (validMaterialKeys.has(key)) {
        const nextSelected = [...selectedMaterialPositions, clickedPos];

        // Check if nextSelected satisfies any combo in materialCombinations
        const foundCombo = selectedFusionCard.materialCombinations?.find(
          (combo) =>
            combo.length === nextSelected.length &&
            nextSelected.every((sel) => combo.some((cPos) => posEquals(cPos, sel)))
        );

        if (foundCombo) {
          // Materials selection complete -> transition to place fusion monster step
          setCompletedCombo(foundCombo);
          setFusionStep('select-position');
        } else {
          setSelectedMaterialPositions(nextSelected);
        }
        return true;
      }

      return false;
    },
    [
      selectedFusionCard,
      isMyTurn,
      isPlayPhase,
      fusionStep,
      completedCombo,
      selectedMaterialKeys,
      validMaterialKeys,
      selectedMaterialPositions,
      playerNum,
      sendAction,
    ]
  );

  const fusionInstruction = useMemo(() => {
    if (!selectedFusionCard) return null;
    if (fusionStep === 'select-materials') {
      return 'Select Materials';
    }
    if (fusionStep === 'select-position') {
      return 'Place Fusion Monster';
    }
    return null;
  }, [selectedFusionCard, fusionStep]);

  return {
    selectedFusionCard,
    selectedMaterialPositions,
    validMaterialKeys,
    selectedMaterialKeys,
    fusionSpawnTargetKeys,
    fusionStep,
    fusionInstruction,
    isSelectingFusion: Boolean(selectedFusionCard),
    handleSelectFusionCard,
    handleFusionCellClick,
    cancelFusion,
  };
}
