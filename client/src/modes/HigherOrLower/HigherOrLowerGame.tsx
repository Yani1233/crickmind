import { useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "../../components/Header";
import { ResultScreen } from "../../components/ResultScreen";
import { GameIntro } from "../../components/GameIntro";
import { GAME_INTROS } from "../../data/gameIntros";
import { VersusCard } from "./VersusCard";
import { apiFetch } from "../../api/client";
import { useLocalScore } from "../../hooks/useLocalScore";
import type { Player } from "../../../../shared/src/types";

interface StatCategory {
  label: string;
  key: string;
}

interface PairResponse {
  playerA: Player;
  playerB: Player;
  statCategory: StatCategory;
}

interface NextChallengerResponse {
  player: Player;
  statCategory: StatCategory;
}

type GamePhase = "intro" | "loading" | "playing" | "revealing" | "gameover";
type RevealState = "hidden" | "revealing" | "revealed";

export function HigherOrLowerGame() {
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [playerA, setPlayerA] = useState<Player | null>(null);
  const [playerB, setPlayerB] = useState<Player | null>(null);
  const [statCategory, setStatCategory] = useState<StatCategory | null>(null);
  const [streak, setStreak] = useState(0);
  const [revealState, setRevealState] = useState<RevealState>("hidden");
  const [chosenSide, setChosenSide] = useState<"A" | "B" | null>(null);
  const [correctSide, setCorrectSide] = useState<"A" | "B" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playerBKey, setPlayerBKey] = useState<string>("initial");

  const { recordScore, getHighScore } = useLocalScore();
  const isProcessingRef = useRef(false);

  const fetchInitialPair = useCallback(async () => {
    setPhase("loading");
    setStreak(0);
    setRevealState("hidden");
    setChosenSide(null);
    setCorrectSide(null);
    setError(null);

    try {
      const data = await apiFetch<PairResponse>("/players/pair");
      setPlayerA(data.playerA);
      setPlayerB(data.playerB);
      setStatCategory(data.statCategory);
      setPlayerBKey(`${data.playerB.id}-0`);
      setPhase("playing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load game");
    }
  }, []);

  const handleChoose = useCallback(
    async (side: "A" | "B") => {
      if (isProcessingRef.current || !playerA || !playerB || !statCategory) return;
      isProcessingRef.current = true;

      setChosenSide(side);
      setRevealState("revealing");

      const statKey = statCategory.key as keyof Player;
      const valA = playerA[statKey] as number;
      const valB = playerB[statKey] as number;

      const winnerSide: "A" | "B" = valA >= valB ? "A" : "B";

      await new Promise((resolve) => setTimeout(resolve, 900));

      setRevealState("revealed");
      setCorrectSide(winnerSide);

      const isCorrect = side === winnerSide;

      await new Promise((resolve) => setTimeout(resolve, 1200));

      if (isCorrect) {
        const newStreak = streak + 1;
        setStreak(newStreak);

        const winnerId = side === "A" ? playerA.id : playerB.id;
        const winnerPlayer = side === "A" ? playerA : playerB;

        try {
          const data = await apiFetch<NextChallengerResponse>(
            `/players/next-challenger?current_id=${winnerId}&streak=${newStreak}`
          );

          setPlayerA(winnerPlayer);
          setPlayerB(data.player);
          setStatCategory(data.statCategory);
          setPlayerBKey(`${data.player.id}-${newStreak}`);
          setRevealState("hidden");
          setChosenSide(null);
          setCorrectSide(null);
          setPhase("playing");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to fetch next challenger");
        }
      } else {
        recordScore("higher-or-lower", streak);
        setPhase("gameover");
      }

      isProcessingRef.current = false;
    },
    [playerA, playerB, statCategory, streak, recordScore]
  );

  const handlePlayAgain = useCallback(() => {
    isProcessingRef.current = false;
    fetchInitialPair();
  }, [fetchInitialPair]);

  if (phase === "intro") {
    return (
      <GameIntro
        {...GAME_INTROS["higher-or-lower"]}
        onStart={() => fetchInitialPair()}
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header title="Higher or Lower" />
        <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
          <p className="text-red-400">{error}</p>
          <button
            onClick={handlePlayAgain}
            className="bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-bold py-2 px-6 rounded-xl transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (phase === "gameover") {
    const highScore = getHighScore("higher-or-lower");
    return (
      <div className="min-h-screen bg-[#0A0E1A]">
        <Header title="Higher or Lower" />
        <ResultScreen
          title="Game Over!"
          score={streak}
          stats={[
            { label: "Streak", value: streak },
            { label: "High Score", value: highScore },
          ]}
          onPlayAgain={handlePlayAgain}
        />
      </div>
    );
  }

  if (phase === "loading" || !playerA || !playerB || !statCategory) {
    return (
      <div className="min-h-screen bg-[#0A0E1A]">
        <Header title="Higher or Lower" />
        <div className="flex items-center justify-center h-[80vh]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-8 h-8 border-2 border-[#FFD600] border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      <Header title="Higher or Lower" streak={streak} />

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] py-6">
        <AnimatePresence>
          {streak >= 5 && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mb-4 text-center"
            >
              <span className="text-4xl animate-pulse">🔥</span>
              <p className="text-orange-400 font-bold text-sm mt-1">On Fire!</p>
            </motion.div>
          )}
        </AnimatePresence>

        <VersusCard
          playerA={playerA}
          playerB={playerB}
          statCategory={statCategory}
          revealState={revealState}
          chosenSide={chosenSide}
          correctSide={correctSide}
          onChoose={handleChoose}
          playerBKey={playerBKey}
        />

        <div className="mt-6 text-center">
          <p className="text-white/30 text-sm">
            Who has the higher <span className="text-white/60 font-medium">{statCategory.label}</span>?
          </p>
        </div>
      </div>
    </div>
  );
}
