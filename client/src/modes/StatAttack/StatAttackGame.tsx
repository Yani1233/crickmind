import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "../../components/Header";
import { PlayerSearchInput } from "../../components/PlayerSearchInput";
import { PlayerCard } from "../../components/PlayerCard";
import { StatCard } from "./StatCard";
import { useLocalScore } from "../../hooks/useLocalScore";
import { apiFetch } from "../../api/client";
import type { Player, StatReveal } from "../../../../shared/src/types";

type GamePhase = "loading" | "playing" | "correct" | "wrong";

const MAX_REVEALS = 4;

function getStatsForRole(player: Player): StatReveal[] {
  const { role } = player;

  if (role === "Bowler") {
    return [
      { label: "Bowling Avg", value: player.bowlingAvg },
      { label: "Economy Rate", value: player.economyRate },
      { label: "Total Wickets", value: player.totalWickets },
      { label: "Total Matches", value: player.totalMatches },
    ];
  }

  if (role === "All-rounder") {
    return [
      { label: "Batting Avg", value: player.battingAvg },
      { label: "Bowling Avg", value: player.bowlingAvg },
      { label: "Total Runs", value: player.totalRuns },
      { label: "Total Wickets", value: player.totalWickets },
    ];
  }

  // Batsman or Wicket-keeper
  return [
    { label: "Batting Avg", value: player.battingAvg },
    { label: "Strike Rate", value: player.strikeRate },
    { label: "Total Runs", value: player.totalRuns },
    { label: "Total Matches", value: player.totalMatches },
  ];
}

function calculateScore(revealsUsed: number): number {
  return Math.max(0, MAX_REVEALS + 1 - revealsUsed);
}

export function StatAttackGame() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [stats, setStats] = useState<StatReveal[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [phase, setPhase] = useState<GamePhase>("loading");
  const [roundScore, setRoundScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const { recordScore } = useLocalScore();

  const fetchPlayer = useCallback(async () => {
    setPhase("loading");
    try {
      const fetched = await apiFetch<Player>("/players/random");
      setPlayer(fetched);
      setStats(getStatsForRole(fetched));
      setRevealedCount(0);
      setPhase("playing");
    } catch {
      setPhase("loading");
    }
  }, []);

  useEffect(() => {
    fetchPlayer();
  }, [fetchPlayer]);

  function handleReveal() {
    if (revealedCount >= MAX_REVEALS) return;
    setRevealedCount((prev) => prev + 1);
  }

  function handleGuess(selected: { id: string; name: string; country: string }) {
    if (!player) return;

    if (selected.id === player.id) {
      const earned = calculateScore(revealedCount);
      setRoundScore(earned);
      setTotalScore((prev) => prev + earned);
      recordScore("stat-attack", earned);
      setPhase("correct");
    } else if (revealedCount >= MAX_REVEALS) {
      setRoundScore(0);
      setPhase("wrong");
    }
    // If wrong but reveals remain, do nothing — let them keep guessing or revealing
  }

  function handleSkip() {
    setRoundScore(0);
    setPhase("wrong");
  }

  function handleNextRound() {
    setRoundNumber((prev) => prev + 1);
    fetchPlayer();
  }

  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-[#0A0E1A]">
        <Header title="Stat Attack" score={totalScore} />
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

  if (phase === "correct" || phase === "wrong") {
    return (
      <div className="min-h-screen bg-[#0A0E1A]">
        <Header title="Stat Attack" score={totalScore} />
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
                {phase === "correct" && (
                  <p className="text-white/60 text-sm">
                    +{roundScore} point{roundScore !== 1 ? "s" : ""} (guessed
                    with {revealedCount} reveal{revealedCount !== 1 ? "s" : ""})
                  </p>
                )}
              </div>

              {player && <PlayerCard player={player} showStats />}

              <button
                onClick={handleNextRound}
                className="w-full bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-bold py-3 rounded-xl transition-colors"
              >
                Next Player
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Playing phase
  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      <Header title="Stat Attack" score={totalScore} />

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Round indicator */}
        <div className="text-center text-white/40 text-sm">
          Round {roundNumber}
        </div>

        {/* Silhouette card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#16213E] rounded-2xl p-6 border border-white/10 text-center"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-3">
            <span className="text-4xl text-white/15 font-black">?</span>
          </div>
          <p className="text-white/30 text-sm">
            {player?.role} &middot; {player?.country}
          </p>
          <p className="text-white/20 text-xs mt-1">
            {revealedCount}/{MAX_REVEALS} stats revealed
          </p>
        </motion.div>

        {/* Stat cards grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={
                typeof stat.value === "number"
                  ? Number.isInteger(stat.value)
                    ? stat.value
                    : stat.value.toFixed(1)
                  : stat.value
              }
              revealed={index < revealedCount}
              index={index}
            />
          ))}
        </div>

        {/* Reveal button */}
        {revealedCount < MAX_REVEALS && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleReveal}
            className="w-full bg-[#1A237E] hover:bg-[#283593] text-white font-bold py-3 rounded-xl transition-colors border border-white/10"
          >
            Reveal Next Stat ({MAX_REVEALS - revealedCount} left)
          </motion.button>
        )}

        {/* Guess input — visible after at least 1 reveal */}
        {revealedCount > 0 && (
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
        )}

        {/* Skip / give up — only when all 4 revealed */}
        {revealedCount >= MAX_REVEALS && (
          <button
            onClick={handleSkip}
            className="w-full bg-white/5 hover:bg-white/10 text-white/50 text-sm py-2 rounded-xl transition-colors"
          >
            Give Up
          </button>
        )}
      </div>
    </div>
  );
}
