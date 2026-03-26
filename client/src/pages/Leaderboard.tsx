import { useState } from "react";
import { motion } from "framer-motion";
import { useLeaderboard, useRoomLeaderboard } from "../api/leaderboard";
import { useUser } from "../context/UserContext";
import { Header } from "../components/Header";
import { AnimatedBackground } from "../components/AnimatedBackground";
import { Skeleton } from "../components/Skeleton";

const MODES = [
  { key: undefined, label: "Overall" },
  { key: "who-am-i", label: "Who Am I?" },
  { key: "stat-attack", label: "Stat Attack" },
  { key: "quick-fire", label: "Quick Fire" },
  { key: "higher-or-lower", label: "Higher or Lower" },
] as const;

type ModeKey = (typeof MODES)[number]["key"];

const RANK_CLASS: Record<number, string> = {
  1: "rank-gold",
  2: "rank-silver",
  3: "rank-bronze",
};

function getRoomCode(): string | null {
  try {
    return localStorage.getItem("crickmind_room") || null;
  } catch {
    return null;
  }
}

export function Leaderboard() {
  const { user } = useUser();
  const [activeMode, setActiveMode] = useState<ModeKey>(undefined);
  const [scope, setScope] = useState<"global" | "friends">("global");

  const roomCode = getRoomCode();

  const globalQuery = useLeaderboard(activeMode);
  const roomQuery = useRoomLeaderboard(
    scope === "friends" ? roomCode : null,
    activeMode,
  );

  const isRoomScope = scope === "friends" && roomCode;
  const { data: entries, isLoading, isError } = isRoomScope
    ? roomQuery
    : globalQuery;

  return (
    <AnimatedBackground>
      <Header title="Leaderboard" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-2xl mx-auto p-4 pb-12"
      >
        {/* Mode filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {MODES.map((mode) => {
            const isActive = activeMode === mode.key;
            return (
              <motion.button
                key={mode.label}
                layoutId="mode-tab"
                onClick={() => setActiveMode(mode.key)}
                className={`glass-card-light whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "gradient-border-gold"
                    : "border border-white/10 hover:border-white/20"
                }`}
                style={{
                  borderRadius: "var(--radius-md)",
                  color: isActive
                    ? "var(--gold-accent)"
                    : "var(--text-secondary)",
                }}
              >
                {mode.label}
              </motion.button>
            );
          })}
        </div>

        {/* Scope toggle */}
        {roomCode && (
          <div className="flex gap-2 mb-4">
            {(["global", "friends"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setScope(s)}
                className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
                  scope === s
                    ? "font-bold"
                    : "opacity-60 hover:opacity-80"
                }`}
                style={{
                  background:
                    scope === s
                      ? "var(--glass-bg-light)"
                      : "transparent",
                  color:
                    scope === s
                      ? "var(--text-primary)"
                      : "var(--text-muted)",
                  border:
                    scope === s
                      ? "1px solid rgba(255, 214, 0, 0.3)"
                      : "1px solid transparent",
                }}
              >
                {s === "global" ? "Global" : "Friends"}
              </button>
            ))}
          </div>
        )}

        {/* Leaderboard table */}
        <div className="glass-card overflow-hidden">
          {/* Table header */}
          <div
            className="flex items-center py-2 px-4 text-xs uppercase tracking-wider border-b border-white/10"
            style={{ color: "var(--text-muted)" }}
          >
            <span className="w-12">#</span>
            <span className="flex-1">Player</span>
            <span className="w-20 text-right">Score</span>
            <span className="w-20 text-right">Games</span>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="p-4 flex flex-col gap-3">
              <Skeleton count={8} className="h-10" />
            </div>
          )}

          {/* Error state */}
          {isError && !isLoading && (
            <div
              className="py-12 text-center text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Failed to load leaderboard. Please try again.
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && entries && entries.length === 0 && (
            <div
              className="py-12 text-center text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              No scores yet. Play a game to get on the board!
            </div>
          )}

          {/* Rows */}
          {!isLoading &&
            entries &&
            entries.length > 0 &&
            entries.map((entry, index) => {
              const isCurrentUser = user?.id === entry.userId;
              const isTopThree = entry.rank <= 3;

              return (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className={`flex items-center py-3 px-4 border-b border-white/5 ${
                    isTopThree ? "glass-card-light" : ""
                  } ${isCurrentUser ? "gradient-border-gold" : ""}`}
                >
                  <span
                    className={`w-12 font-bold text-lg ${
                      RANK_CLASS[entry.rank] ?? ""
                    }`}
                  >
                    {entry.rank}
                  </span>
                  <span
                    className="flex-1 truncate"
                    style={{
                      color: isCurrentUser
                        ? "var(--gold-accent)"
                        : "var(--text-primary)",
                      fontWeight: isCurrentUser ? 700 : 400,
                    }}
                  >
                    {entry.displayName}
                    {isCurrentUser && (
                      <span
                        className="ml-2 text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        (you)
                      </span>
                    )}
                  </span>
                  <span
                    className="w-20 text-right font-bold"
                    style={{ color: "var(--gold-accent)" }}
                  >
                    {entry.totalScore.toLocaleString()}
                  </span>
                  <span
                    className="w-20 text-right"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {entry.gamesPlayed}
                  </span>
                </motion.div>
              );
            })}
        </div>
      </motion.div>
    </AnimatedBackground>
  );
}
