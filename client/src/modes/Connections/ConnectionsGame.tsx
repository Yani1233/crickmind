import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "../../api/client";
import { useLocalScore } from "../../hooks/useLocalScore";
import { useUser } from "../../context/UserContext";
import { Header } from "../../components/Header";
import { ResultScreen } from "../../components/ResultScreen";
import { AnimatedBackground } from "../../components/AnimatedBackground";

/* ── Types ────────────────────────────────────────────────────── */

interface ConnectionGroup {
  category: string;
  items: string[];
  color: "yellow" | "green" | "blue" | "purple";
}

interface ConnectionPuzzle {
  id: string;
  groups: ConnectionGroup[];
}

type GamePhase = "loading" | "playing" | "result" | "error";

/* ── Constants ────────────────────────────────────────────────── */

const MAX_LIVES = 4;
const POINTS_PER_GROUP = 4;
const BONUS_PER_LIFE = 1;

const COLOR_MAP: Record<ConnectionGroup["color"], { bg: string; border: string; text: string }> = {
  yellow: {
    bg: "bg-yellow-500/20",
    border: "border-yellow-500/40",
    text: "text-yellow-300",
  },
  green: {
    bg: "bg-emerald-500/20",
    border: "border-emerald-500/40",
    text: "text-emerald-300",
  },
  blue: {
    bg: "bg-blue-500/20",
    border: "border-blue-500/40",
    text: "text-blue-300",
  },
  purple: {
    bg: "bg-purple-500/20",
    border: "border-purple-500/40",
    text: "text-purple-300",
  },
};

/* ── Shuffle utility ──────────────────────────────────────────── */

function shuffle<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/* ── Component ────────────────────────────────────────────────── */

export function ConnectionsGame() {
  const navigate = useNavigate();
  const { recordScore } = useLocalScore();
  const { user } = useUser();

  const [phase, setPhase] = useState<GamePhase>("loading");
  const [puzzle, setPuzzle] = useState<ConnectionPuzzle | null>(null);
  const [shuffledItems, setShuffledItems] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [solvedGroups, setSolvedGroups] = useState<ConnectionGroup[]>([]);
  const [lives, setLives] = useState(MAX_LIVES);
  const [shaking, setShaking] = useState(false);

  /* ── Derived state ──────────────────────────────────────────── */

  const solvedItems = useMemo(
    () => new Set(solvedGroups.flatMap((g) => g.items)),
    [solvedGroups]
  );

  const remainingItems = useMemo(
    () => shuffledItems.filter((item) => !solvedItems.has(item)),
    [shuffledItems, solvedItems]
  );

  const score = useMemo(
    () => solvedGroups.length * POINTS_PER_GROUP + lives * BONUS_PER_LIFE,
    [solvedGroups.length, lives]
  );

  const isGameOver = lives <= 0;
  const isGameWon = puzzle !== null && solvedGroups.length === puzzle.groups.length;

  /* ── Data fetching ──────────────────────────────────────────── */

  const loadPuzzle = useCallback(async () => {
    setPhase("loading");
    try {
      const data = await apiFetch<ConnectionPuzzle>("/connections/random");
      if (!data || !data.groups || data.groups.length === 0) {
        setPhase("error");
        return;
      }
      const allItems = data.groups.flatMap((g) => g.items);
      setPuzzle(data);
      setShuffledItems(shuffle(allItems));
      setSelected(new Set());
      setSolvedGroups([]);
      setLives(MAX_LIVES);
      setShaking(false);
      setPhase("playing");
    } catch {
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadPuzzle().then(() => {
      if (cancelled) setPhase("loading");
    });
    return () => {
      cancelled = true;
    };
  }, [loadPuzzle]);

  /* ── Transition to result ───────────────────────────────────── */

  useEffect(() => {
    if (phase !== "playing") return;
    if (isGameOver || isGameWon) {
      const timer = setTimeout(() => setPhase("result"), 800);
      return () => clearTimeout(timer);
    }
  }, [phase, isGameOver, isGameWon]);

  /* ── Record score on result ─────────────────────────────────── */

  useEffect(() => {
    if (phase === "result") {
      recordScore("connections", score, user?.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ── Handlers ───────────────────────────────────────────────── */

  function toggleItem(item: string) {
    if (phase !== "playing" || solvedItems.has(item) || shaking) return;

    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(item)) {
        next.delete(item);
      } else if (next.size < 4) {
        next.add(item);
      }
      return next;
    });
  }

  function deselectAll() {
    setSelected(new Set());
  }

  function handleSubmit() {
    if (selected.size !== 4 || !puzzle || shaking) return;

    const selectedArr = Array.from(selected);
    const matchedGroup = puzzle.groups.find((group) => {
      if (solvedGroups.includes(group)) return false;
      return group.items.every((item) => selectedArr.includes(item));
    });

    if (matchedGroup) {
      setSolvedGroups((prev) => [...prev, matchedGroup]);
      setSelected(new Set());
    } else {
      setShaking(true);
      setLives((prev) => prev - 1);
      setTimeout(() => {
        setShaking(false);
        setSelected(new Set());
      }, 600);
    }
  }

  function handlePlayAgain() {
    loadPuzzle();
  }

  /* ── Render: Error ──────────────────────────────────────────── */

  if (phase === "error") {
    return (
      <AnimatedBackground>
        <div className="min-h-screen">
          <Header title="Connections" />
          <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
            <p className="text-white/50 text-lg">No puzzles available</p>
            <button
              onClick={() => navigate("/")}
              className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              Back to Hub
            </button>
          </div>
        </div>
      </AnimatedBackground>
    );
  }

  /* ── Render: Loading ────────────────────────────────────────── */

  if (phase === "loading") {
    return (
      <AnimatedBackground>
        <div className="min-h-screen">
          <Header title="Connections" />
          <div className="flex items-center justify-center h-[80vh]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-8 h-8 border-2 border-white/20 border-t-purple-400 rounded-full"
            />
          </div>
        </div>
      </AnimatedBackground>
    );
  }

  /* ── Render: Result ─────────────────────────────────────────── */

  if (phase === "result") {
    const groupsFound = solvedGroups.length;
    const totalGroups = puzzle?.groups.length ?? 4;

    return (
      <ResultScreen
        title={isGameWon ? "Connections Solved!" : "Game Over"}
        score={score}
        stats={[
          { label: "Groups Found", value: `${groupsFound}/${totalGroups}` },
          { label: "Lives Left", value: `${lives}/${MAX_LIVES}` },
          { label: "Group Bonus", value: `${groupsFound * POINTS_PER_GROUP} pts` },
          { label: "Life Bonus", value: `${lives * BONUS_PER_LIFE} pts` },
        ]}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  /* ── Render: Playing ────────────────────────────────────────── */

  return (
    <AnimatedBackground>
      <div className="min-h-screen flex flex-col">
        <Header title="Connections" score={score} />

        <div className="flex-1 flex flex-col items-center py-6 px-4">
          {/* Lives display */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-white/50 text-sm font-medium mr-1">Lives</span>
            {Array.from({ length: MAX_LIVES }).map((_, i) => (
              <motion.span
                key={i}
                initial={false}
                animate={{
                  scale: i < lives ? 1 : 0.7,
                  opacity: i < lives ? 1 : 0.25,
                }}
                className="text-lg"
              >
                {i < lives ? "\u2764\uFE0F" : "\uD83D\uDDA4"}
              </motion.span>
            ))}
          </div>

          {/* Solved groups */}
          <AnimatePresence>
            {solvedGroups.map((group) => {
              const colors = COLOR_MAP[group.color];
              return (
                <motion.div
                  key={group.category}
                  initial={{ opacity: 0, y: -20, scaleY: 0 }}
                  animate={{ opacity: 1, y: 0, scaleY: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className={`w-full max-w-lg mb-3 rounded-xl border px-4 py-3 text-center ${colors.bg} ${colors.border}`}
                >
                  <div className={`font-bold text-sm uppercase tracking-wider mb-1 ${colors.text}`}>
                    {group.category}
                  </div>
                  <div className="text-white/80 text-sm">
                    {group.items.join(", ")}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Item grid */}
          <motion.div
            animate={shaking ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-4 gap-2 w-full max-w-lg"
          >
            <AnimatePresence>
              {remainingItems.map((item) => {
                const isSelected = selected.has(item);
                return (
                  <motion.button
                    key={item}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      scale: isSelected ? 1.05 : 1,
                    }}
                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.3 } }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleItem(item)}
                    className={`
                      glass-card-light rounded-xl py-3 px-2 text-sm font-semibold
                      transition-all duration-200 cursor-pointer select-none
                      text-center leading-tight min-h-[3.5rem] flex items-center justify-center
                      ${
                        isSelected
                          ? "ring-2 ring-purple-400 shadow-[0_0_16px_rgba(168,85,247,0.4)] bg-purple-500/15"
                          : "hover:bg-white/10"
                      }
                    `}
                    style={{ color: "var(--text-primary)" }}
                  >
                    {item}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-6 w-full max-w-lg">
            <button
              onClick={deselectAll}
              disabled={selected.size === 0}
              className="btn-ghost flex-1 py-3 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Deselect All
            </button>
            <button
              onClick={handleSubmit}
              disabled={selected.size !== 4}
              className="btn-primary flex-1 py-3 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          </div>

          {/* Selection counter */}
          <div className="mt-3 text-white/40 text-sm">
            {selected.size}/4 selected
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
}
