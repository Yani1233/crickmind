import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "../../components/Header";
import { ResultScreen } from "../../components/ResultScreen";
import { apiFetch } from "../../api/client";
import { useLocalScore } from "../../hooks/useLocalScore";

const ROUND_COUNT = 10;
const SLIDER_MIN = 0.2;
const SLIDER_MAX = 30;
const SLIDER_STEP = 0.1;

interface AuctionEntry {
  id: string;
  playerName: string;
  year: number;
  team: string;
  priceCrores: number;
}

interface RoundResult {
  entry: AuctionEntry;
  guess: number;
  actual: number;
  points: number;
  tier: ScoreTier;
}

type ScoreTier = "exact" | "close" | "decent" | "far" | "miss";

type GamePhase = "loading" | "playing" | "feedback" | "result" | "error";

function calculateTier(guess: number, actual: number): ScoreTier {
  const diff = Math.abs(guess - actual);
  if (diff <= 0.5) return "exact";
  const ratio = diff / actual;
  if (ratio <= 0.25) return "close";
  if (ratio <= 0.5) return "decent";
  if (ratio <= 1.0) return "far";
  return "miss";
}

function tierPoints(tier: ScoreTier): number {
  switch (tier) {
    case "exact":
      return 10;
    case "close":
      return 7;
    case "decent":
      return 4;
    case "far":
      return 2;
    case "miss":
      return 0;
  }
}

function tierLabel(tier: ScoreTier): string {
  switch (tier) {
    case "exact":
      return "Spot On!";
    case "close":
      return "Very Close";
    case "decent":
      return "Not Bad";
    case "far":
      return "Way Off";
    case "miss":
      return "Missed";
  }
}

function tierColor(tier: ScoreTier): string {
  switch (tier) {
    case "exact":
      return "#22c55e";
    case "close":
      return "#84cc16";
    case "decent":
      return "#FFD600";
    case "far":
      return "#f97316";
    case "miss":
      return "#ef4444";
  }
}

function formatPrice(value: number): string {
  return `\u20B9${value.toFixed(1)} Cr`;
}

function useCountUp(target: number, duration = 800): number {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let frame: number;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(parseFloat((eased * target).toFixed(1)));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return display;
}

function AnimatedPrice({ value }: { value: number }) {
  const display = useCountUp(value);
  return <>{formatPrice(display)}</>;
}

export function AuctionArenaGame() {
  const navigate = useNavigate();
  const { recordScore } = useLocalScore();

  const [phase, setPhase] = useState<GamePhase>("loading");
  const [entries, setEntries] = useState<AuctionEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sliderValue, setSliderValue] = useState(5.0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [lastResult, setLastResult] = useState<RoundResult | null>(null);

  const currentEntry = entries[currentIndex] ?? null;

  // Fetch entries on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await apiFetch<AuctionEntry[]>(
          `/auction/random?count=${ROUND_COUNT}`
        );
        if (cancelled) return;

        if (!data || data.length === 0) {
          setPhase("error");
          return;
        }

        setEntries(data);
        setPhase("playing");
      } catch {
        if (!cancelled) setPhase("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Record score on result
  useEffect(() => {
    if (phase === "result" && results.length > 0) {
      recordScore("auction-arena", totalScore);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const handleLockIn = useCallback(() => {
    if (phase !== "playing" || !currentEntry) return;

    const guess = sliderValue;
    const actual = currentEntry.priceCrores;
    const tier = calculateTier(guess, actual);
    const points = tierPoints(tier);

    const roundResult: RoundResult = {
      entry: currentEntry,
      guess,
      actual,
      points,
      tier,
    };

    setLastResult(roundResult);
    setResults((prev) => [...prev, roundResult]);
    setTotalScore((prev) => prev + points);
    setPhase("feedback");
  }, [phase, currentEntry, sliderValue]);

  function handleNext() {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= entries.length) {
      setPhase("result");
    } else {
      setCurrentIndex(nextIndex);
      setSliderValue(5.0);
      setLastResult(null);
      setPhase("playing");
    }
  }

  function handlePlayAgain() {
    setPhase("loading");
    setEntries([]);
    setCurrentIndex(0);
    setSliderValue(5.0);
    setResults([]);
    setTotalScore(0);
    setLastResult(null);

    apiFetch<AuctionEntry[]>(`/auction/random?count=${ROUND_COUNT}`)
      .then((data) => {
        if (!data || data.length === 0) {
          setPhase("error");
          return;
        }
        setEntries(data);
        setPhase("playing");
      })
      .catch(() => setPhase("error"));
  }

  if (phase === "error") {
    return (
      <div className="min-h-screen">
        <Header title="Auction Arena" />
        <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
          <p className="text-white/50 text-lg">No auction data available</p>
          <button
            onClick={() => navigate("/")}
            className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            Back to Hub
          </button>
        </div>
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="min-h-screen">
        <Header title="Auction Arena" />
        <div className="flex items-center justify-center h-[80vh]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-8 h-8 border-2 border-white/20 border-t-[#FFD600] rounded-full"
          />
        </div>
      </div>
    );
  }

  if (phase === "result") {
    const exactCount = results.filter((r) => r.tier === "exact").length;
    const avgDiff =
      results.length > 0
        ? (
            results.reduce((sum, r) => sum + Math.abs(r.guess - r.actual), 0) /
            results.length
          ).toFixed(1)
        : "0";

    return (
      <div className="min-h-screen">
        <ResultScreen
          title="Auction Arena Complete!"
          score={totalScore}
          stats={[
            { label: "Rounds", value: `${results.length}/${ROUND_COUNT}` },
            { label: "Spot On", value: exactCount },
            { label: "Avg Diff", value: `${avgDiff} Cr` },
            {
              label: "Max Possible",
              value: ROUND_COUNT * 10,
            },
          ]}
          onPlayAgain={handlePlayAgain}
        />

        {/* Round-by-round summary */}
        <div className="max-w-lg mx-auto px-4 pb-12">
          <h3
            className="text-center text-lg font-bold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Round Summary
          </h3>
          <div className="flex flex-col gap-2">
            {results.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06 }}
                className="glass-card-light px-4 py-3 flex items-center gap-3"
              >
                <span
                  className="text-sm font-bold w-6 text-center"
                  style={{ color: "var(--text-muted)" }}
                >
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div
                    className="font-medium text-sm truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {result.entry.playerName}
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {result.entry.team} ({result.entry.year})
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-0.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span style={{ color: "var(--text-muted)" }}>
                      {formatPrice(result.guess)}
                    </span>
                    <span style={{ color: "var(--text-muted)" }}>/</span>
                    <span style={{ color: "var(--gold-accent)" }}>
                      {formatPrice(result.actual)}
                    </span>
                  </div>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded"
                    style={{
                      color: tierColor(result.tier),
                      background: `${tierColor(result.tier)}15`,
                    }}
                  >
                    +{result.points} pts
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Playing or feedback phase
  return (
    <div className="min-h-screen flex flex-col">
      <Header title="Auction Arena" score={totalScore} />

      <div className="flex-1 flex flex-col items-center justify-center py-8 px-4">
        {/* Round counter */}
        <div className="flex items-center gap-3 mb-6">
          <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            Round {currentIndex + 1} of {entries.length}
          </p>
          <div className="flex gap-1">
            {entries.map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  background:
                    i < currentIndex
                      ? "var(--green-accent)"
                      : i === currentIndex
                        ? "var(--gold-accent)"
                        : "rgba(255, 255, 255, 0.15)",
                  boxShadow:
                    i === currentIndex ? "0 0 8px rgba(255, 214, 0, 0.5)" : "none",
                }}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {currentEntry && phase === "playing" && (
            <motion.div
              key={`playing-${currentIndex}`}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card p-8 w-full max-w-md text-center"
              style={{
                boxShadow:
                  "var(--shadow-lg), 0 0 40px rgba(255, 214, 0, 0.1), 0 0 80px rgba(139, 92, 246, 0.08)",
                borderColor: "rgba(255, 214, 0, 0.2)",
              }}
            >
              {/* Player name */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl font-black mb-3"
                style={{
                  color: "var(--text-primary)",
                  textShadow: "0 0 20px rgba(255, 255, 255, 0.1)",
                }}
              >
                {currentEntry.playerName}
              </motion.h2>

              {/* Team and year */}
              <div className="flex items-center justify-center gap-3 mb-8">
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    background: "rgba(139, 92, 246, 0.15)",
                    color: "rgb(167, 139, 250)",
                    border: "1px solid rgba(139, 92, 246, 0.3)",
                  }}
                >
                  {currentEntry.team}
                </span>
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    background: "rgba(6, 182, 212, 0.15)",
                    color: "var(--cyan-accent)",
                    border: "1px solid rgba(6, 182, 212, 0.3)",
                  }}
                >
                  {currentEntry.year}
                </span>
              </div>

              {/* Slider */}
              <div className="mb-6">
                <div
                  className="text-3xl font-black mb-4 tabular-nums"
                  style={{
                    color: "var(--gold-accent)",
                    textShadow: "0 0 15px rgba(255, 214, 0, 0.3)",
                  }}
                >
                  {formatPrice(sliderValue)}
                </div>

                <div className="relative px-1">
                  <input
                    type="range"
                    min={SLIDER_MIN}
                    max={SLIDER_MAX}
                    step={SLIDER_STEP}
                    value={sliderValue}
                    onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                    className="auction-slider w-full"
                  />
                  <div className="flex justify-between mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
                    <span>{formatPrice(SLIDER_MIN)}</span>
                    <span>{formatPrice(SLIDER_MAX)}</span>
                  </div>
                </div>
              </div>

              {/* Lock In button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleLockIn}
                className="btn-accent w-full py-4 text-lg font-bold"
                style={{
                  background: "linear-gradient(135deg, var(--gold-accent), #f59e0b)",
                  color: "#1a1a2e",
                  boxShadow: "0 0 20px rgba(255, 214, 0, 0.3)",
                }}
              >
                Lock In Bid
              </motion.button>
            </motion.div>
          )}

          {/* Feedback phase */}
          {phase === "feedback" && lastResult && (
            <motion.div
              key={`feedback-${currentIndex}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card p-8 w-full max-w-md text-center"
              style={{
                boxShadow: `var(--shadow-lg), 0 0 40px ${tierColor(lastResult.tier)}20`,
                borderColor: `${tierColor(lastResult.tier)}40`,
              }}
            >
              <h3
                className="text-lg font-bold mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                {lastResult.entry.playerName}
              </h3>
              <p className="text-xs mb-6" style={{ color: "var(--text-muted)" }}>
                {lastResult.entry.team} ({lastResult.entry.year})
              </p>

              {/* Side-by-side comparison */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="glass-card-light p-4">
                  <div
                    className="text-xs mb-1 font-medium"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Your Bid
                  </div>
                  <div
                    className="text-2xl font-black tabular-nums"
                    style={{ color: "var(--cyan-accent)" }}
                  >
                    {formatPrice(lastResult.guess)}
                  </div>
                </div>
                <div className="glass-card-light p-4">
                  <div
                    className="text-xs mb-1 font-medium"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Actual Price
                  </div>
                  <div
                    className="text-2xl font-black tabular-nums"
                    style={{ color: "var(--gold-accent)" }}
                  >
                    <AnimatedPrice value={lastResult.actual} />
                  </div>
                </div>
              </div>

              {/* Tier badge */}
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.3 }}
                className="inline-block mb-4"
              >
                <div
                  className="px-6 py-2 rounded-xl font-bold text-lg"
                  style={{
                    color: tierColor(lastResult.tier),
                    background: `${tierColor(lastResult.tier)}15`,
                    border: `2px solid ${tierColor(lastResult.tier)}40`,
                    boxShadow: `0 0 20px ${tierColor(lastResult.tier)}20`,
                  }}
                >
                  {tierLabel(lastResult.tier)}
                </div>
              </motion.div>

              {/* Points earned */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-2xl font-black mb-6"
                style={{
                  color: lastResult.points > 0 ? "var(--gold-accent)" : "var(--text-muted)",
                }}
              >
                +{lastResult.points} pts
              </motion.div>

              {/* Next button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleNext}
                className="btn-primary w-full py-3 font-bold"
              >
                {currentIndex + 1 >= entries.length ? "See Results" : "Next Player"}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Custom slider styles */}
      <style>{`
        .auction-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 8px;
          border-radius: 4px;
          background: linear-gradient(90deg, #22c55e, #84cc16, #FFD600, #f59e0b);
          outline: none;
          cursor: pointer;
        }
        .auction-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--gold-accent), #f59e0b);
          border: 3px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 0 15px rgba(255, 214, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3);
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        .auction-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        .auction-slider::-webkit-slider-thumb:active {
          transform: scale(1.05);
        }
        .auction-slider::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--gold-accent), #f59e0b);
          border: 3px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 0 15px rgba(255, 214, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3);
          cursor: pointer;
        }
        .auction-slider::-moz-range-track {
          height: 8px;
          border-radius: 4px;
          background: linear-gradient(90deg, #22c55e, #84cc16, #FFD600, #f59e0b);
        }
      `}</style>
    </div>
  );
}
