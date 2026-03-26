import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "../../components/Header";
import { ResultScreen } from "../../components/ResultScreen";
import { apiFetch } from "../../api/client";
import { useTimer } from "../../hooks/useTimer";
import { useLocalScore } from "../../hooks/useLocalScore";

const TOTAL_PLAYERS = 11;
const POINTS_PER_PLAYER = 2;
const TIME_LIMIT = 120;

interface MysterySquad {
  id: string;
  title: string;
  description: string;
  players: string[];
  difficulty: string;
}

type GamePhase = "loading" | "playing" | "result" | "error";

export function MysteryXIGame() {
  const navigate = useNavigate();
  const { recordScore } = useLocalScore();

  const [phase, setPhase] = useState<GamePhase>("loading");
  const [squad, setSquad] = useState<MysterySquad | null>(null);
  const [foundPlayers, setFoundPlayers] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [flashWrong, setFlashWrong] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleTimeout = useCallback(() => {
    if (phase === "playing") {
      setGaveUp(true);
      setPhase("result");
    }
  }, [phase]);

  const { timeLeft, start, stop, reset } = useTimer({
    duration: TIME_LIMIT,
    onExpire: handleTimeout,
  });

  // Fetch squad on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await apiFetch<MysterySquad>("/mystery/random");
        if (cancelled) return;

        if (!data || !data.players || data.players.length === 0) {
          setPhase("error");
          return;
        }

        setSquad(data);
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

  // Start timer when entering playing phase
  useEffect(() => {
    if (phase === "playing" && squad) {
      reset();
      start();
    }
  }, [phase, squad, reset, start]);

  // Cleanup flash timer
  useEffect(() => {
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, []);

  // Record score on result
  useEffect(() => {
    if (phase === "result" && squad) {
      recordScore("mystery-xi", foundPlayers.size * POINTS_PER_PLAYER);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function normalizeForMatch(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  function handleInputChange(value: string) {
    setQuery(value);

    if (!squad || value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const normalized = normalizeForMatch(value);
    const matches = squad.players.filter(
      (player) =>
        !foundPlayers.has(player) &&
        normalizeForMatch(player).includes(normalized)
    );
    setSuggestions(matches.slice(0, 5));
    setShowSuggestions(matches.length > 0);
  }

  function handleSelectPlayer(playerName: string) {
    if (!squad) return;

    const matched = squad.players.find(
      (p) => normalizeForMatch(p) === normalizeForMatch(playerName)
    );

    if (matched && !foundPlayers.has(matched)) {
      const nextFound = new Set(foundPlayers);
      nextFound.add(matched);
      setFoundPlayers(nextFound);
      setQuery("");
      setSuggestions([]);
      setShowSuggestions(false);

      if (nextFound.size === TOTAL_PLAYERS) {
        stop();
        setPhase("result");
      }
    }
  }

  function handleSubmit() {
    if (!squad || query.trim().length === 0) return;

    const normalized = normalizeForMatch(query);
    const matched = squad.players.find(
      (p) => normalizeForMatch(p) === normalized
    );

    if (matched && !foundPlayers.has(matched)) {
      handleSelectPlayer(matched);
    } else {
      setFlashWrong(true);
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      flashTimerRef.current = setTimeout(() => setFlashWrong(false), 600);
      setQuery("");
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }

  function handleGiveUp() {
    stop();
    setGaveUp(true);
    setPhase("result");
  }

  function handlePlayAgain() {
    setPhase("loading");
    setSquad(null);
    setFoundPlayers(new Set());
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setFlashWrong(false);
    setGaveUp(false);
    reset();

    apiFetch<MysterySquad>("/mystery/random")
      .then((data) => {
        if (!data || !data.players || data.players.length === 0) {
          setPhase("error");
          return;
        }
        setSquad(data);
        setPhase("playing");
      })
      .catch(() => setPhase("error"));
  }

  if (phase === "error") {
    return (
      <div className="min-h-screen">
        <Header title="Mystery XI" />
        <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
          <p className="text-white/50 text-lg">No squads available</p>
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
        <Header title="Mystery XI" />
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

  if (phase === "result" && squad) {
    const score = foundPlayers.size * POINTS_PER_PLAYER;
    const percentage = Math.round((foundPlayers.size / TOTAL_PLAYERS) * 100);
    const timeUsed = TIME_LIMIT - Math.ceil(timeLeft);

    return (
      <div className="min-h-screen">
        <ResultScreen
          title={foundPlayers.size === TOTAL_PLAYERS ? "Perfect XI!" : "Mystery XI Complete"}
          score={score}
          stats={[
            { label: "Found", value: `${foundPlayers.size}/${TOTAL_PLAYERS}` },
            { label: "Accuracy", value: `${percentage}%` },
            { label: "Time Used", value: `${timeUsed}s` },
            { label: "Gave Up", value: gaveUp ? "Yes" : "No" },
          ]}
          onPlayAgain={handlePlayAgain}
        />

        {/* Full squad reveal below result */}
        <div className="max-w-lg mx-auto px-4 pb-12">
          <h3
            className="text-center text-lg font-bold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            {squad.title}
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {squad.players.map((player, index) => {
              const wasFound = foundPlayers.has(player);
              return (
                <motion.div
                  key={player}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card-light px-4 py-2 flex items-center gap-3"
                  style={{
                    borderLeft: wasFound
                      ? "3px solid var(--green-accent)"
                      : "3px solid rgba(239, 68, 68, 0.6)",
                  }}
                >
                  <span
                    className="text-sm font-bold w-6 text-center"
                    style={{
                      color: wasFound ? "var(--green-accent)" : "rgba(239, 68, 68, 0.8)",
                    }}
                  >
                    {index + 1}
                  </span>
                  <span style={{ color: "var(--text-primary)" }}>{player}</span>
                  <span className="ml-auto text-xs">
                    {wasFound ? (
                      <span style={{ color: "var(--green-accent)" }}>Found</span>
                    ) : (
                      <span style={{ color: "rgba(239, 68, 68, 0.8)" }}>Missed</span>
                    )}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Playing phase
  const timerMinutes = Math.floor(timeLeft / 60);
  const timerSeconds = Math.ceil(timeLeft % 60);
  const timerDisplay = `${timerMinutes}:${timerSeconds.toString().padStart(2, "0")}`;
  const timerFraction = timeLeft / TIME_LIMIT;
  const timerUrgent = timeLeft <= 30;

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="Mystery XI" score={foundPlayers.size * POINTS_PER_PLAYER} />

      <div className="flex-1 flex flex-col items-center py-6 px-4">
        {/* Timer */}
        <div className="mb-4 flex items-center gap-3">
          <div
            className="relative w-48 h-2 rounded-full overflow-hidden"
            style={{ background: "rgba(255, 255, 255, 0.1)" }}
          >
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                background: timerUrgent
                  ? "linear-gradient(90deg, #ef4444, #f97316)"
                  : "linear-gradient(90deg, var(--cyan-accent), var(--green-accent))",
                width: `${timerFraction * 100}%`,
              }}
              animate={timerUrgent ? { opacity: [1, 0.5, 1] } : {}}
              transition={timerUrgent ? { repeat: Infinity, duration: 0.8 } : {}}
            />
          </div>
          <span
            className="text-lg font-bold tabular-nums"
            style={{
              color: timerUrgent ? "#ef4444" : "var(--text-primary)",
            }}
          >
            {timerDisplay}
          </span>
        </div>

        {/* Squad Title Card */}
        {squad && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-5 w-full max-w-lg mb-6 text-center"
            style={{
              boxShadow: "var(--shadow-lg), 0 0 30px rgba(139, 92, 246, 0.15)",
              borderColor: "rgba(139, 92, 246, 0.3)",
            }}
          >
            <h2
              className="text-xl font-bold mb-1"
              style={{ color: "var(--gold-accent)" }}
            >
              {squad.title}
            </h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {squad.description}
            </p>
            <div className="mt-2 flex items-center justify-center gap-2">
              <span
                className="px-2 py-0.5 rounded text-xs font-medium"
                style={{
                  background: "rgba(139, 92, 246, 0.2)",
                  color: "rgb(167, 139, 250)",
                }}
              >
                {squad.difficulty}
              </span>
            </div>
          </motion.div>
        )}

        {/* Found counter */}
        <p className="text-sm font-medium mb-4" style={{ color: "var(--text-muted)" }}>
          <span style={{ color: "var(--green-accent)" }}>{foundPlayers.size}</span>
          /{TOTAL_PLAYERS} found
        </p>

        {/* Player grid - 3-4-4 formation */}
        <div className="w-full max-w-lg mb-6">
          <div className="flex flex-col gap-2">
            {[
              squad?.players.slice(0, 3) ?? [],
              squad?.players.slice(3, 7) ?? [],
              squad?.players.slice(7, 11) ?? [],
            ].map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-2">
                {row.map((player, colIndex) => {
                  const globalIndex =
                    rowIndex === 0
                      ? colIndex
                      : rowIndex === 1
                        ? 3 + colIndex
                        : 7 + colIndex;
                  const isFound = foundPlayers.has(player);
                  return (
                    <motion.div
                      key={globalIndex}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: globalIndex * 0.04 }}
                      className="flex-1 max-w-[110px]"
                    >
                      <div
                        className="glass-card-light p-3 text-center transition-all duration-300"
                        style={{
                          minHeight: "64px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          border: isFound
                            ? "1px solid var(--green-accent)"
                            : "1px dashed rgba(255, 255, 255, 0.15)",
                          boxShadow: isFound
                            ? "var(--shadow-glow-green)"
                            : "none",
                        }}
                      >
                        {isFound ? (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-xs font-bold leading-tight"
                            style={{ color: "var(--green-accent)" }}
                          >
                            {player}
                          </motion.span>
                        ) : (
                          <>
                            <span
                              className="text-lg font-bold"
                              style={{ color: "rgba(255, 255, 255, 0.15)" }}
                            >
                              ?
                            </span>
                            <span
                              className="text-[10px]"
                              style={{ color: "rgba(255, 255, 255, 0.1)" }}
                            >
                              #{globalIndex + 1}
                            </span>
                          </>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Input area */}
        <div className="w-full max-w-md relative">
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
                placeholder="Type a player's name..."
                className="input-glass w-full pl-4 pr-4"
                style={{
                  borderColor: flashWrong ? "rgba(239, 68, 68, 0.8)" : undefined,
                  boxShadow: flashWrong ? "0 0 12px rgba(239, 68, 68, 0.3)" : undefined,
                }}
              />
              <AnimatePresence>
                {flashWrong && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-bold px-3 py-1 rounded"
                    style={{
                      background: "rgba(239, 68, 68, 0.2)",
                      color: "#ef4444",
                    }}
                  >
                    Wrong!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={handleSubmit} className="btn-primary px-5 py-2">
              Guess
            </button>
          </div>

          {/* Autocomplete dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 glass-card overflow-hidden z-50 max-h-48 overflow-y-auto">
              {suggestions.map((player) => (
                <button
                  key={player}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelectPlayer(player)}
                  className="w-full px-4 py-3 text-left flex items-center transition-colors"
                  style={{
                    color: "var(--text-primary)",
                    background: "transparent",
                    border: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  {player}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Give Up button */}
        <button
          onClick={handleGiveUp}
          className="btn-ghost mt-6 px-6 py-2 text-sm"
          style={{ color: "rgba(239, 68, 68, 0.7)" }}
        >
          Give Up
        </button>
      </div>
    </div>
  );
}
