import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "../../components/Header";
import { PlayerSearchInput } from "../../components/PlayerSearchInput";
import { PlayerCard } from "../../components/PlayerCard";
import { ResultScreen } from "../../components/ResultScreen";
import { GuessRow } from "./GuessRow";
import { comparePlayer } from "../../utils/matchLogic";
import { useLocalScore } from "../../hooks/useLocalScore";
import { apiFetch } from "../../api/client";
import type { Player, WhoAmIGuess } from "../../../../shared/src/types";

const MAX_GUESSES = 8;
const MAX_EXCLUDE_IDS = 20;

type GamePhase = "loading" | "playing" | "won" | "lost";

export function WhoAmIGame() {
  const [target, setTarget] = useState<Player | null>(null);
  const [guesses, setGuesses] = useState<WhoAmIGuess[]>([]);
  const [phase, setPhase] = useState<GamePhase>("loading");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const excludeIdsRef = useRef<string[]>([]);
  const { recordScore } = useLocalScore();
  const guessListRef = useRef<HTMLDivElement>(null);

  const fetchTarget = useCallback(async () => {
    setPhase("loading");
    setGuesses([]);
    setTarget(null);

    const excludeParam =
      excludeIdsRef.current.length > 0
        ? `?exclude=${excludeIdsRef.current.join(",")}`
        : "";
    const player = await apiFetch<Player>(`/players/random${excludeParam}`);

    excludeIdsRef.current = [
      player.id,
      ...excludeIdsRef.current,
    ].slice(0, MAX_EXCLUDE_IDS);

    setTarget(player);
    setPhase("playing");
  }, []);

  useEffect(() => {
    fetchTarget();
  }, [fetchTarget]);

  const handleGuess = useCallback(
    async (selected: { id: string; name: string; country: string }) => {
      if (!target || isSubmitting || phase !== "playing") return;

      setIsSubmitting(true);
      try {
        const guessedPlayer = await apiFetch<Player>(
          `/players/${selected.id}`
        );
        const results = comparePlayer(guessedPlayer, target);
        const newGuess: WhoAmIGuess = { player: guessedPlayer, results };
        const updatedGuesses = [...guesses, newGuess];
        setGuesses(updatedGuesses);

        const isCorrect = results.every((r) => r.result === "green");
        const guessNumber = updatedGuesses.length;

        if (isCorrect) {
          const score = MAX_GUESSES + 1 - guessNumber;
          recordScore("who-am-i", score);
          setPhase("won");
        } else if (guessNumber >= MAX_GUESSES) {
          recordScore("who-am-i", 0);
          setPhase("lost");
        }

        setTimeout(() => {
          guessListRef.current?.scrollTo({
            top: guessListRef.current.scrollHeight,
            behavior: "smooth",
          });
        }, 100);
      } finally {
        setIsSubmitting(false);
      }
    },
    [target, isSubmitting, phase, guesses, recordScore]
  );

  const handlePlayAgain = useCallback(() => {
    fetchTarget();
  }, [fetchTarget]);

  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-[#1A1A2E]">
        <Header title="Who Am I?" />
        <div className="flex items-center justify-center h-[80vh]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-[#FFD600] border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  if (phase === "won") {
    const score = MAX_GUESSES + 1 - guesses.length;
    return (
      <div className="min-h-screen bg-[#1A1A2E]">
        <Header title="Who Am I?" score={score} />
        <Confetti />
        <div className="p-4 max-w-lg mx-auto space-y-4">
          {target && <PlayerCard player={target} />}
          <ResultScreen
            title="You got it!"
            score={score}
            stats={[
              { label: "Guesses", value: guesses.length },
              { label: "Max Score", value: MAX_GUESSES },
            ]}
            onPlayAgain={handlePlayAgain}
          />
        </div>
      </div>
    );
  }

  if (phase === "lost") {
    return (
      <div className="min-h-screen bg-[#1A1A2E]">
        <Header title="Who Am I?" />
        <div className="p-4 max-w-lg mx-auto space-y-4">
          <div className="text-center text-white/60 text-sm">
            The answer was:
          </div>
          {target && <PlayerCard player={target} />}
          <ResultScreen
            title="Better luck next time!"
            score={0}
            stats={[
              { label: "Guesses Used", value: MAX_GUESSES },
              { label: "Answer", value: target?.name ?? "Unknown" },
            ]}
            onPlayAgain={handlePlayAgain}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A2E] flex flex-col">
      <Header title="Who Am I?" />

      <div className="px-4 pt-4 pb-2 text-center">
        <span className="text-white/50 text-sm font-medium">
          Guess {guesses.length + 1} of {MAX_GUESSES}
        </span>
      </div>

      <div className="px-4 pb-3">
        <PlayerSearchInput
          onSelect={handleGuess}
          disabled={isSubmitting}
          placeholder="Guess the cricketer..."
        />
      </div>

      <div
        ref={guessListRef}
        className="flex-1 overflow-y-auto px-4 pb-4 space-y-3"
      >
        <AnimatePresence mode="popLayout">
          {guesses.map((guess, i) => (
            <GuessRow key={guess.player.id + i} guess={guess} index={i} />
          ))}
        </AnimatePresence>

        {guesses.length === 0 && (
          <div className="text-center text-white/30 text-sm mt-8">
            Start guessing to reveal clues about the mystery player.
          </div>
        )}
      </div>
    </div>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => i);
  const colors = ["#FFD600", "#4CAF50", "#FF5722", "#2196F3", "#E91E63"];

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.8;
        const duration = 1.5 + Math.random() * 1.5;
        const color = colors[i % colors.length];
        const size = 6 + Math.random() * 6;

        return (
          <motion.div
            key={i}
            initial={{ y: -20, x: `${left}vw`, opacity: 1, rotate: 0 }}
            animate={{
              y: "110vh",
              rotate: 360 + Math.random() * 360,
              opacity: [1, 1, 0],
            }}
            transition={{ duration, delay, ease: "easeIn" }}
            style={{
              position: "absolute",
              width: size,
              height: size,
              backgroundColor: color,
              borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            }}
          />
        );
      })}
    </div>
  );
}
