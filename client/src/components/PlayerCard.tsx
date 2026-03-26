import { motion } from "framer-motion";
import type { Player } from "../../../shared/src/types";

interface PlayerCardProps {
  player: Player;
  showStats?: boolean;
  onClick?: () => void;
  className?: string;
}

const FLAG_MAP: Record<string, string> = {
  IND: "🇮🇳", AUS: "🇦🇺", ENG: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", PAK: "🇵🇰", SA: "🇿🇦",
  NZ: "🇳🇿", SL: "🇱🇰", WI: "🏏", BAN: "🇧🇩", AFG: "🇦🇫",
  ZIM: "🇿🇼", IRE: "🇮🇪",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function PlayerCard({ player, showStats = true, onClick, className = "" }: PlayerCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={onClick}
      className={`glass-card p-5 ${
        onClick ? "cursor-pointer hover:border-[rgba(255,214,0,0.4)] transition-all" : ""
      } ${className}`}
    >
      <div className="flex items-center gap-4 mb-3">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
          style={{
            background: "var(--gradient-primary)",
            color: "var(--text-primary)",
            boxShadow: "var(--shadow-glow-green)",
          }}
        >
          {getInitials(player.name)}
        </div>
        <div>
          <h3 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>
            {FLAG_MAP[player.country] ?? "🏏"} {player.name}
          </h3>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {player.role} · {player.country}
          </p>
        </div>
      </div>

      {showStats && (
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="glass-card-light p-2">
            <div style={{ color: "var(--text-muted)" }}>Matches</div>
            <div className="font-bold" style={{ color: "var(--text-primary)" }}>{player.totalMatches}</div>
          </div>
          <div className="glass-card-light p-2">
            <div style={{ color: "var(--text-muted)" }}>Runs</div>
            <div className="font-bold" style={{ color: "var(--text-primary)" }}>{player.totalRuns}</div>
          </div>
          <div className="glass-card-light p-2">
            <div style={{ color: "var(--text-muted)" }}>Avg</div>
            <div className="font-bold" style={{ color: "var(--text-primary)" }}>{player.battingAvg.toFixed(1)}</div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
