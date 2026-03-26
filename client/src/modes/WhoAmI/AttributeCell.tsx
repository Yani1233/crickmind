import { motion } from "framer-motion";
import type { MatchResult } from "../../../../shared/src/types";

interface AttributeCellProps {
  label: string;
  value: string;
  result: MatchResult;
  direction?: "up" | "down";
  delay?: number;
}

const COLOR_MAP: Record<MatchResult, string> = {
  green: "#4CAF50",
  yellow: "#FFC107",
  gray: "#9E9E9E",
};

const ICON_MAP: Record<MatchResult, string> = {
  green: "\u2713",
  yellow: "~",
  gray: "\u2717",
};

export function AttributeCell({
  label,
  value,
  result,
  direction,
  delay = 0,
}: AttributeCellProps) {
  const bgColor = COLOR_MAP[result];
  const icon = ICON_MAP[result];
  const arrow = direction === "up" ? "\u2191" : direction === "down" ? "\u2193" : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.25, ease: "easeOut" }}
      className="flex flex-col items-center gap-1 min-w-0"
    >
      <span className="text-[10px] text-white/40 uppercase tracking-wide truncate w-full text-center">
        {label}
      </span>
      <div
        className="w-full rounded-lg px-2 py-2 flex flex-col items-center justify-center text-center min-h-[52px]"
        style={{ backgroundColor: bgColor }}
      >
        <span className="text-xs font-bold text-black leading-tight truncate w-full">
          {value}
          {arrow && <span className="ml-0.5">{arrow}</span>}
        </span>
        <span
          className="text-[10px] text-black/60 font-mono"
          aria-label={result}
        >
          {icon}
        </span>
      </div>
    </motion.div>
  );
}
