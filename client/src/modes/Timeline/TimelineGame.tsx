import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { Header } from "../../components/Header";
import { ResultScreen } from "../../components/ResultScreen";
import { apiFetch } from "../../api/client";
import { useLocalScore } from "../../hooks/useLocalScore";

interface TimelineEvent {
  id: string;
  description: string;
  year: number;
  category: string;
}

const POINTS_PER_CORRECT = 2;
const EVENT_COUNT = 6;

type GamePhase = "loading" | "playing" | "revealed" | "result";

function shuffleArray<T>(array: readonly T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getCategoryColor(category: string): { bg: string; text: string; glow: string } {
  const lower = category.toLowerCase();
  if (lower.includes("world-cup") || lower.includes("world cup")) {
    return { bg: "rgba(255, 214, 0, 0.15)", text: "#FFD600", glow: "0 0 8px rgba(255, 214, 0, 0.3)" };
  }
  if (lower.includes("record")) {
    return { bg: "rgba(0, 230, 118, 0.15)", text: "#00E676", glow: "0 0 8px rgba(0, 230, 118, 0.3)" };
  }
  if (lower.includes("debut") || lower.includes("first")) {
    return { bg: "rgba(41, 182, 246, 0.15)", text: "#29B6F6", glow: "0 0 8px rgba(41, 182, 246, 0.3)" };
  }
  if (lower.includes("ipl")) {
    return { bg: "rgba(171, 71, 188, 0.15)", text: "#AB47BC", glow: "0 0 8px rgba(171, 71, 188, 0.3)" };
  }
  if (lower.includes("milestone")) {
    return { bg: "rgba(255, 152, 0, 0.15)", text: "#FF9800", glow: "0 0 8px rgba(255, 152, 0, 0.3)" };
  }
  return { bg: "rgba(255, 255, 255, 0.1)", text: "rgba(255, 255, 255, 0.7)", glow: "none" };
}

function getCategoryLabel(category: string): string {
  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function TimelineGame() {
  const navigate = useNavigate();
  const { recordScore } = useLocalScore();

  const [phase, setPhase] = useState<GamePhase>("loading");
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [correctOrder, setCorrectOrder] = useState<TimelineEvent[]>([]);
  const [positionResults, setPositionResults] = useState<boolean[]>([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await apiFetch<TimelineEvent[]>(
          `/timeline/random?count=${EVENT_COUNT}`
        );
        if (cancelled) return;

        if (!data || data.length === 0) {
          setPhase("loading");
          return;
        }

        const sorted = [...data].sort((a, b) => a.year - b.year);
        setCorrectOrder(sorted);
        setEvents(shuffleArray(data));
        setPhase("playing");
      } catch {
        if (!cancelled) setPhase("loading");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleLockIn() {
    if (phase !== "playing") return;

    const results = events.map((event, index) => event.id === correctOrder[index].id);
    const correctCount = results.filter(Boolean).length;
    const totalPoints = correctCount * POINTS_PER_CORRECT;

    setPositionResults(results);
    setScore(totalPoints);
    setPhase("revealed");
  }

  function handleContinueToResult() {
    recordScore("timeline", score);
    setPhase("result");
  }

  function handlePlayAgain() {
    setPhase("loading");
    setEvents([]);
    setCorrectOrder([]);
    setPositionResults([]);
    setScore(0);

    apiFetch<TimelineEvent[]>(`/timeline/random?count=${EVENT_COUNT}`)
      .then((data) => {
        if (!data || data.length === 0) return;
        const sorted = [...data].sort((a, b) => a.year - b.year);
        setCorrectOrder(sorted);
        setEvents(shuffleArray(data));
        setPhase("playing");
      })
      .catch(() => {});
  }

  if (phase === "loading") {
    return (
      <div className="min-h-screen">
        <Header title="Timeline" />
        <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-8 h-8 border-2 border-white/20 border-t-[#FFD600] rounded-full"
          />
          <p className="text-white/40 text-sm">Loading events...</p>
        </div>
      </div>
    );
  }

  if (phase === "result") {
    const correctCount = positionResults.filter(Boolean).length;
    const maxScore = EVENT_COUNT * POINTS_PER_CORRECT;

    return (
      <ResultScreen
        title="Timeline Complete!"
        score={score}
        stats={[
          { label: "Correct Positions", value: `${correctCount}/${EVENT_COUNT}` },
          { label: "Max Possible", value: maxScore },
          {
            label: "Accuracy",
            value: `${Math.round((correctCount / EVENT_COUNT) * 100)}%`,
          },
          {
            label: "Rating",
            value:
              correctCount === EVENT_COUNT
                ? "Perfect!"
                : correctCount >= 4
                  ? "Great"
                  : correctCount >= 2
                    ? "Good"
                    : "Keep Trying",
          },
        ]}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  const isRevealed = phase === "revealed";

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="Timeline" score={isRevealed ? score : undefined} />

      <div className="flex-1 flex flex-col items-center py-6 px-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 max-w-md"
        >
          <p className="text-white/60 text-sm leading-relaxed">
            {isRevealed
              ? "Here's how you did! Green = correct position, Red = wrong."
              : "Drag the events into chronological order, earliest first."}
          </p>
        </motion.div>

        {/* Timeline spine */}
        <div className="relative w-full max-w-lg">
          {/* Vertical line connecting cards */}
          <div
            className="absolute left-6 top-4 bottom-4 w-px"
            style={{
              background: isRevealed
                ? "linear-gradient(to bottom, rgba(0, 230, 118, 0.4), rgba(255, 214, 0, 0.4))"
                : "linear-gradient(to bottom, rgba(255, 255, 255, 0.1), rgba(255, 214, 0, 0.2), rgba(255, 255, 255, 0.1))",
            }}
          />

          {isRevealed ? (
            <div className="space-y-3">
              {events.map((event, index) => {
                const isCorrect = positionResults[index];
                const colors = getCategoryColor(event.category);

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative pl-14"
                  >
                    {/* Timeline dot */}
                    <div
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                      style={{
                        borderColor: isCorrect ? "#00E676" : "#FF5252",
                        background: isCorrect
                          ? "rgba(0, 230, 118, 0.2)"
                          : "rgba(255, 82, 82, 0.2)",
                        boxShadow: isCorrect
                          ? "0 0 12px rgba(0, 230, 118, 0.4)"
                          : "0 0 12px rgba(255, 82, 82, 0.4)",
                      }}
                    >
                      <span className="text-xs">
                        {isCorrect ? "\u2713" : "\u2717"}
                      </span>
                    </div>

                    <div
                      className="glass-card-light p-4 transition-all"
                      style={{
                        borderColor: isCorrect
                          ? "rgba(0, 230, 118, 0.4)"
                          : "rgba(255, 82, 82, 0.4)",
                        boxShadow: isCorrect
                          ? "0 0 20px rgba(0, 230, 118, 0.15), inset 0 0 20px rgba(0, 230, 118, 0.05)"
                          : "0 0 20px rgba(255, 82, 82, 0.15), inset 0 0 20px rgba(255, 82, 82, 0.05)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-medium leading-snug"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {event.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span
                              className="text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{
                                background: colors.bg,
                                color: colors.text,
                                boxShadow: colors.glow,
                              }}
                            >
                              {getCategoryLabel(event.category)}
                            </span>
                          </div>
                        </div>
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.3, type: "spring", stiffness: 400 }}
                          className="shrink-0 text-right"
                        >
                          <div
                            className="text-2xl font-black tabular-nums"
                            style={{
                              color: "var(--gold-accent)",
                              textShadow: "0 0 16px rgba(255, 214, 0, 0.5)",
                            }}
                          >
                            {event.year}
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <Reorder.Group
              axis="y"
              values={events}
              onReorder={setEvents}
              className="space-y-3"
            >
              <AnimatePresence>
                {events.map((event, index) => {
                  const colors = getCategoryColor(event.category);

                  return (
                    <Reorder.Item
                      key={event.id}
                      value={event}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      whileDrag={{
                        scale: 1.03,
                        boxShadow: "0 0 30px rgba(255, 214, 0, 0.3), 0 20px 40px rgba(0, 0, 0, 0.4)",
                        zIndex: 50,
                      }}
                      className="relative pl-14 cursor-grab active:cursor-grabbing"
                      style={{ listStyle: "none" }}
                    >
                      {/* Timeline dot */}
                      <div
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center pointer-events-none"
                        style={{
                          borderColor: "rgba(255, 214, 0, 0.4)",
                          background: "rgba(255, 214, 0, 0.1)",
                          boxShadow: "0 0 8px rgba(255, 214, 0, 0.2)",
                        }}
                      >
                        <span
                          className="text-xs font-bold"
                          style={{ color: "var(--gold-accent)" }}
                        >
                          {index + 1}
                        </span>
                      </div>

                      <div className="glass-card-light p-4 transition-all hover:border-[rgba(255,214,0,0.3)]">
                        <div className="flex items-start gap-3">
                          {/* Drag handle */}
                          <div
                            className="shrink-0 mt-0.5 flex flex-col gap-0.5 opacity-40"
                            style={{ color: "var(--text-muted)" }}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="currentColor"
                            >
                              <circle cx="5" cy="3" r="1.5" />
                              <circle cx="11" cy="3" r="1.5" />
                              <circle cx="5" cy="8" r="1.5" />
                              <circle cx="11" cy="8" r="1.5" />
                              <circle cx="5" cy="13" r="1.5" />
                              <circle cx="11" cy="13" r="1.5" />
                            </svg>
                          </div>

                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm font-medium leading-snug"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {event.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span
                                className="text-xs font-bold px-2 py-0.5 rounded-full"
                                style={{
                                  background: colors.bg,
                                  color: colors.text,
                                  boxShadow: colors.glow,
                                }}
                              >
                                {getCategoryLabel(event.category)}
                              </span>
                            </div>
                          </div>

                          {/* Year placeholder */}
                          <div
                            className="shrink-0 w-14 h-8 rounded-lg flex items-center justify-center"
                            style={{
                              background: "rgba(255, 255, 255, 0.05)",
                              border: "1px dashed rgba(255, 255, 255, 0.15)",
                            }}
                          >
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                              ????
                            </span>
                          </div>
                        </div>
                      </div>
                    </Reorder.Item>
                  );
                })}
              </AnimatePresence>
            </Reorder.Group>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-8 w-full max-w-lg">
          {phase === "playing" && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={handleLockIn}
              className="btn-primary w-full py-4 text-lg font-bold"
              style={{
                boxShadow: "0 0 30px rgba(0, 230, 118, 0.2), 0 4px 20px rgba(0, 0, 0, 0.3)",
              }}
            >
              Lock In
            </motion.button>
          )}

          {phase === "revealed" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, delay: 0.5 }}
                  className="text-3xl font-black"
                  style={{
                    color: "var(--gold-accent)",
                    textShadow: "0 0 20px rgba(255, 214, 0, 0.5)",
                  }}
                >
                  {score}/{EVENT_COUNT * POINTS_PER_CORRECT}
                </motion.div>
                <span className="text-white/40 text-sm">points</span>
              </div>

              <button
                onClick={handleContinueToResult}
                className="btn-primary w-full py-3 font-bold"
              >
                Continue
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
