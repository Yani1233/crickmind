import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";

interface ResultScreenProps {
  title: string;
  score: number;
  stats?: Array<{ label: string; value: string | number }>;
  onPlayAgain: () => void;
  isNewHighScore?: boolean;
}

function useCountUp(target: number, duration = 1200): number {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let frame: number;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return display;
}

export function ResultScreen({
  title,
  score,
  stats,
  onPlayAgain,
  isNewHighScore = false,
}: ResultScreenProps) {
  const navigate = useNavigate();
  const displayScore = useCountUp(score);
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(() => {
    const text = `I scored ${score} points on CrickMind! Can you beat me? 🏏`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [score]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div
        className="glass-card p-8 max-w-md w-full text-center"
        style={{
          boxShadow: "var(--shadow-lg), var(--shadow-glow-gold)",
        }}
      >
        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h2>

        <div className="my-6">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
            className="text-6xl font-black"
            style={{
              color: "var(--gold-accent)",
              textShadow: "0 0 20px rgba(255, 214, 0, 0.4)",
            }}
          >
            {displayScore}
          </motion.div>
          <div className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            points
          </div>
        </div>

        {isNewHighScore && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-4 py-2 px-4 rounded-xl inline-block font-bold text-sm"
            style={{
              background: "rgba(255, 214, 0, 0.15)",
              color: "var(--gold-accent)",
              boxShadow: "var(--shadow-glow-gold)",
            }}
          >
            New High Score!
          </motion.div>
        )}

        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="glass-card-light p-3"
              >
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {stat.label}
                </div>
                <div className="font-bold" style={{ color: "var(--text-primary)" }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <button onClick={onPlayAgain} className="btn-primary flex-1 py-3">
              Play Again
            </button>
            <button
              onClick={() => navigate("/")}
              className="btn-ghost flex-1 py-3"
            >
              Back to Hub
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="btn-accent flex-1 py-2 text-sm"
            >
              {copied ? "Copied!" : "Share Score"}
            </button>
            <button
              onClick={() => navigate("/leaderboard")}
              className="btn-ghost flex-1 py-2 text-sm"
            >
              Leaderboard
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
