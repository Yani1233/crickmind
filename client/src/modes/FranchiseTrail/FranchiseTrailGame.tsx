import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "../../components/Header";
import { PlayerSearchInput } from "../../components/PlayerSearchInput";
import { GameIntro } from "../../components/GameIntro";
import { GAME_INTROS } from "../../data/gameIntros";
import { useLocalScore } from "../../hooks/useLocalScore";
import { apiFetch } from "../../api/client";
import { StintCard } from "./StintCard";
import type { IplCareerData } from "../../../../shared/src/types";

type GamePhase = "intro" | "loading" | "playing" | "correct" | "wrong" | "gameover";

const MAX_ROUNDS = 5;
const MAX_POINTS_PER_ROUND = 5;

function calculateScore(totalStints: number, revealedCount: number): number {
  return Math.min(MAX_POINTS_PER_ROUND, Math.max(0, totalStints + 1 - revealedCount));
}

export function FranchiseTrailGame() {
  const [career, setCareer] = useState<IplCareerData | null>(null);
  const [revealedCount, setRevealedCount] = useState(1);
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [roundScore, setRoundScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [excludedPlayers, setExcludedPlayers] = useState<string[]>([]);
  const [roundScores, setRoundScores] = useState<number[]>([]);
  const { recordScore } = useLocalScore();

  const fetchCareer = useCallback(
    async (excluded: string[]) => {
      setPhase("loading");
      try {
        const excludeParam =
          excluded.length > 0
            ? `?exclude=${encodeURIComponent(excluded.join(","))}`
            : "";
        const fetched = await apiFetch<IplCareerData>(
          `/franchise-trail/random${excludeParam}`
        );
        setCareer(fetched);
        setRevealedCount(1);
        setPhase("playing");
      } catch {
        setPhase("loading");
      }
    },
    []
  );

  function handleReveal() {
    if (!career) return;
    if (revealedCount >= career.stints.length) return;
    setRevealedCount((prev) => prev + 1);
  }

  function handleGuess(selected: { id: string; name: string; country: string }) {
    if (!career) return;

    if (selected.name.toLowerCase() === career.playerName.toLowerCase()) {
      const earned = calculateScore(career.stints.length, revealedCount);
      setRoundScore(earned);
      const newTotal = totalScore + earned;
      setTotalScore(newTotal);
      setRoundScores((prev) => [...prev, earned]);
      recordScore("franchise-trail", earned);
      setPhase("correct");
    } else if (revealedCount < career.stints.length) {
      setRevealedCount((prev) => prev + 1);
    } else {
      setRoundScore(0);
      setRoundScores((prev) => [...prev, 0]);
      setPhase("wrong");
    }
  }

  function handleGiveUp() {
    setRoundScore(0);
    setRoundScores((prev) => [...prev, 0]);
    setPhase("wrong");
  }

  function handleNextRound() {
    if (!career) return;
    const newExcluded = [...excludedPlayers, career.playerName];
    setExcludedPlayers(newExcluded);

    if (roundNumber >= MAX_ROUNDS) {
      setPhase("gameover");
      return;
    }

    setRoundNumber((prev) => prev + 1);
    fetchCareer(newExcluded);
  }

  function handlePlayAgain() {
    setTotalScore(0);
    setRoundNumber(1);
    setExcludedPlayers([]);
    setRoundScores([]);
    fetchCareer([]);
  }

  if (phase === "intro") {
    return (
      <GameIntro
        {...GAME_INTROS["franchise-trail"]}
        onStart={() => fetchCareer([])}
      />
    );
  }

  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-[#0A0E1A]">
        <Header title="Franchise Trail" score={totalScore} />
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

  if (phase === "gameover") {
    return (
      <div className="min-h-screen bg-[#0A0E1A]">
        <Header title="Franchise Trail" score={totalScore} />
        <div className="max-w-md mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="text-4xl mb-2 font-black"
                style={{ color: "var(--gold-accent)" }}
              >
                Game Over!
              </motion.div>
              <p className="text-white/60 text-lg">
                Final Score:{" "}
                <span style={{ color: "var(--gold-accent)" }}>{totalScore}</span>{" "}
                / {MAX_ROUNDS * MAX_POINTS_PER_ROUND}
              </p>
            </div>

            <div className="glass-card p-4 space-y-2">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-3">
                Round Breakdown
              </p>
              {roundScores.map((score, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-white/60">Round {i + 1}</span>
                  <span
                    style={{
                      color:
                        score > 0
                          ? "var(--gold-accent)"
                          : "rgba(239, 68, 68, 0.7)",
                    }}
                  >
                    {score > 0 ? `+${score}` : "0"} pts
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={handlePlayAgain}
              className="w-full bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-bold py-3 rounded-xl transition-colors"
            >
              Play Again
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (phase === "correct" || phase === "wrong") {
    return (
      <div className="min-h-screen bg-[#0A0E1A]">
        <Header title="Franchise Trail" score={totalScore} />
        <div className="max-w-md mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`text-5xl mb-3 ${
                    phase === "correct" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {phase === "correct" ? "Correct!" : "Wrong!"}
                </motion.div>
                <p className="text-white text-lg font-bold mb-1">
                  {career?.playerName}
                </p>
                {phase === "correct" && (
                  <p className="text-white/60 text-sm">
                    +{roundScore} point{roundScore !== 1 ? "s" : ""} (guessed
                    after {revealedCount} stint
                    {revealedCount !== 1 ? "s" : ""})
                  </p>
                )}
              </div>

              {career && (
                <div className="space-y-2">
                  {career.stints.map((stint, i) => (
                    <StintCard
                      key={`${stint.team}-${stint.startYear}`}
                      stint={stint}
                      revealed={true}
                      index={i}
                      stintNumber={i + 1}
                      totalStints={career.stints.length}
                    />
                  ))}
                </div>
              )}

              <button
                onClick={handleNextRound}
                className="w-full bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-bold py-3 rounded-xl transition-colors"
              >
                {roundNumber >= MAX_ROUNDS ? "See Results" : "Next Round"}
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Playing phase
  const stints = career?.stints ?? [];
  const totalStints = stints.length;

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      <Header title="Franchise Trail" score={totalScore} />

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <div className="text-center text-white/40 text-sm">
          Round {roundNumber} of {MAX_ROUNDS}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-5 text-center"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-3">
            <span className="text-3xl text-white/15 font-black">?</span>
          </div>
          <p className="text-white/50 text-sm">
            Who played for these franchises?
          </p>
          <p className="text-white/20 text-xs mt-1">
            {revealedCount}/{totalStints} stints revealed
          </p>
        </motion.div>

        <div className="space-y-2">
          {stints.map((stint, i) => (
            <StintCard
              key={`${stint.team}-${stint.startYear}`}
              stint={stint}
              revealed={i < revealedCount}
              index={i}
              stintNumber={i + 1}
              totalStints={totalStints}
            />
          ))}
        </div>

        {revealedCount < totalStints && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleReveal}
            className="w-full bg-[#1A237E] hover:bg-[#283593] text-white font-bold py-3 rounded-xl transition-colors border border-white/10"
          >
            Reveal Next Stint ({totalStints - revealedCount} left)
          </motion.button>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <p className="text-white/50 text-sm text-center">
            Who is this player?
          </p>
          <PlayerSearchInput
            onSelect={handleGuess}
            placeholder="Guess the player..."
          />
        </motion.div>

        {revealedCount >= totalStints && (
          <button
            onClick={handleGiveUp}
            className="w-full bg-white/5 hover:bg-white/10 text-white/50 text-sm py-2 rounded-xl transition-colors"
          >
            Give Up
          </button>
        )}
      </div>
    </div>
  );
}
