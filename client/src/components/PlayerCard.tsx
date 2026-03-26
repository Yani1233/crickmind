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
      className={`bg-[#16213E] rounded-2xl p-5 border border-white/10 ${
        onClick ? "cursor-pointer hover:border-[#FFD600]/50 transition-colors" : ""
      } ${className}`}
    >
      <div className="flex items-center gap-4 mb-3">
        <div className="w-14 h-14 rounded-full bg-[#1B5E20]/30 flex items-center justify-center text-lg font-bold text-[#4CAF50] shrink-0">
          {getInitials(player.name)}
        </div>
        <div>
          <h3 className="font-bold text-white text-lg">
            {FLAG_MAP[player.country] ?? "🏏"} {player.name}
          </h3>
          <p className="text-white/50 text-sm">
            {player.role} · {player.country}
          </p>
        </div>
      </div>

      {showStats && (
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-white/5 rounded-lg p-2">
            <div className="text-white/40">Matches</div>
            <div className="font-bold text-white">{player.totalMatches}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-2">
            <div className="text-white/40">Runs</div>
            <div className="font-bold text-white">{player.totalRuns}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-2">
            <div className="text-white/40">Avg</div>
            <div className="font-bold text-white">{player.battingAvg.toFixed(1)}</div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
