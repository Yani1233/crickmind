import { motion } from "framer-motion";
import type { IplStint } from "../../../../shared/src/types";

const TEAM_COLORS: Record<string, string> = {
  CSK: "#FFCC00",
  MI: "#004BA0",
  RCB: "#EC1C24",
  KKR: "#3A225D",
  DC: "#00008B",
  DD: "#00008B",
  PBKS: "#ED1B24",
  KXIP: "#ED1B24",
  RR: "#EA1A85",
  SRH: "#FF822A",
  GT: "#1C1C2B",
  LSG: "#A72056",
  DEC: "#E04D18",
  KTK: "#7B2D8E",
  PWI: "#6F2DA8",
  GL: "#E35C24",
  RPS: "#6F2DA8",
};

const TEAM_NAMES: Record<string, string> = {
  CSK: "Chennai Super Kings",
  MI: "Mumbai Indians",
  RCB: "Royal Challengers Bengaluru",
  KKR: "Kolkata Knight Riders",
  DC: "Delhi Capitals",
  DD: "Delhi Daredevils",
  PBKS: "Punjab Kings",
  KXIP: "Kings XI Punjab",
  RR: "Rajasthan Royals",
  SRH: "Sunrisers Hyderabad",
  GT: "Gujarat Titans",
  LSG: "Lucknow Super Giants",
  DEC: "Deccan Chargers",
  KTK: "Kochi Tuskers Kerala",
  PWI: "Pune Warriors India",
  GL: "Gujarat Lions",
  RPS: "Rising Pune Supergiant",
};

interface StintCardProps {
  stint: IplStint;
  revealed: boolean;
  index: number;
  stintNumber: number;
  totalStints: number;
}

export function StintCard({ stint, revealed, index, stintNumber, totalStints }: StintCardProps) {
  const teamColor = TEAM_COLORS[stint.team] ?? "#666";
  const teamName = TEAM_NAMES[stint.team] ?? stint.team;
  const yearRange =
    stint.startYear === stint.endYear
      ? `${stint.startYear}`
      : `${stint.startYear} - ${stint.endYear}`;

  if (!revealed) {
    return (
      <div className="glass-card p-4 flex items-center gap-4 opacity-30">
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
          <span className="text-lg font-bold text-white/20">?</span>
        </div>
        <div>
          <p className="text-white/20 text-sm font-medium">Stint {stintNumber}</p>
          <p className="text-white/10 text-xs">Unrevealed</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass-card p-4 flex items-center gap-4"
      style={{ borderColor: `${teamColor}40` }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm"
        style={{ backgroundColor: `${teamColor}25`, color: teamColor }}
      >
        {stint.team}
      </div>
      <div className="min-w-0">
        <p className="text-white font-medium text-sm truncate">{teamName}</p>
        <p className="text-xs" style={{ color: teamColor }}>
          {yearRange}
        </p>
      </div>
      <div className="ml-auto text-white/20 text-xs shrink-0">
        {stintNumber}/{totalStints}
      </div>
    </motion.div>
  );
}
