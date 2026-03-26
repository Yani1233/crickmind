import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface ModeCardProps {
  title: string;
  description: string;
  icon: string;
  route: string;
  highScore: number;
  gamesPlayed?: number;
  disabled?: boolean;
}

export function ModeCard({
  title,
  description,
  icon,
  route,
  highScore,
  gamesPlayed = 0,
  disabled = false,
}: ModeCardProps) {
  const navigate = useNavigate();

  return (
    <motion.button
      whileHover={disabled ? {} : { y: -2, boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(255, 214, 0, 0.1)" }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={() => !disabled && navigate(route)}
      disabled={disabled}
      className={
        disabled
          ? "w-full rounded-2xl p-6 text-left border transition-all opacity-40 cursor-not-allowed"
          : "w-full glass-card p-6 text-left transition-all cursor-pointer hover:border-[rgba(255,214,0,0.3)]"
      }
      style={
        disabled
          ? {
              background: "var(--bg-card)",
              borderColor: "var(--border-subtle)",
            }
          : undefined
      }
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{
            background: disabled
              ? "rgba(255, 255, 255, 0.05)"
              : "var(--gradient-primary)",
            boxShadow: disabled ? "none" : "var(--shadow-glow-green)",
          }}
        >
          {icon}
        </div>
        <div className="flex flex-col items-end gap-1">
          {highScore > 0 && (
            <span
              className="text-xs px-2 py-1 rounded-lg font-bold"
              style={{
                background: "rgba(255, 214, 0, 0.15)",
                color: "var(--gold-accent)",
                boxShadow: "var(--shadow-glow-gold)",
              }}
            >
              Best: {highScore}
            </span>
          )}
          {gamesPlayed > 0 && (
            <span
              className="text-xs px-2 py-1 rounded-lg"
              style={{ color: "var(--text-muted)" }}
            >
              {gamesPlayed} played
            </span>
          )}
          {disabled && (
            <span
              className="text-xs px-2 py-1 rounded-lg"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                color: "var(--text-muted)",
              }}
            >
              Coming Soon
            </span>
          )}
        </div>
      </div>
      <h3
        className="font-bold text-lg mb-1"
        style={{ color: "var(--text-primary)" }}
      >
        {title}
      </h3>
      <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
        {description}
      </p>
    </motion.button>
  );
}
