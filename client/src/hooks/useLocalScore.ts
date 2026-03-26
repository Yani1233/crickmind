import { useState, useCallback } from "react";
import type { GameMode } from "../../../shared/src/types";

const SCORES_KEY = "crickmind_scores";
const TOTAL_KEY = "crickmind_total";

interface ModeScores {
  [mode: string]: { highScore: number; gamesPlayed: number };
}

function readScores(): ModeScores {
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function readTotal(): number {
  try {
    return Number(localStorage.getItem(TOTAL_KEY) ?? 0);
  } catch {
    return 0;
  }
}

export function useLocalScore() {
  const [scores, setScores] = useState<ModeScores>(readScores);
  const [totalScore, setTotalScore] = useState<number>(readTotal);

  const recordScore = useCallback((mode: GameMode, score: number) => {
    setScores((prev) => {
      const modeData = prev[mode] ?? { highScore: 0, gamesPlayed: 0 };
      const updated: ModeScores = {
        ...prev,
        [mode]: {
          highScore: Math.max(modeData.highScore, score),
          gamesPlayed: modeData.gamesPlayed + 1,
        },
      };
      localStorage.setItem(SCORES_KEY, JSON.stringify(updated));
      return updated;
    });

    setTotalScore((prev) => {
      const newTotal = prev + score;
      localStorage.setItem(TOTAL_KEY, String(newTotal));
      return newTotal;
    });
  }, []);

  const getHighScore = useCallback(
    (mode: GameMode) => scores[mode]?.highScore ?? 0,
    [scores]
  );

  return { scores, totalScore, recordScore, getHighScore };
}
