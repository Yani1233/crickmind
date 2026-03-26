import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface HeaderProps {
  title: string;
  score?: number;
  streak?: number;
}

export function Header({ title, score, streak }: HeaderProps) {
  const navigate = useNavigate();

  const stored = localStorage.getItem("crickmind_user");
  const displayName = stored ? JSON.parse(stored).displayName : null;

  function handleSignOut() {
    localStorage.removeItem("crickmind_user");
    window.location.reload();
  }

  return (
    <header
      className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between glass-card"
      style={{
        borderRadius: 0,
        borderLeft: "none",
        borderRight: "none",
        borderTop: "none",
        borderBottom: "1px solid transparent",
        borderImage: "linear-gradient(to right, transparent, var(--gold-accent), transparent) 1",
      }}
    >
      <button
        onClick={() => navigate("/")}
        className="btn-ghost px-3 py-1.5 text-sm flex items-center gap-1"
      >
        <span>&larr;</span> Hub
      </button>

      <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
        {title}
      </h1>

      <div className="flex items-center gap-3 text-sm">
        {streak !== undefined && (
          <div className="flex items-center gap-1">
            <span
              className={streak >= 5 ? "animate-pulse" : ""}
              style={{
                filter: streak >= 3 ? "drop-shadow(0 0 6px rgba(255, 152, 0, 0.6))" : "none",
              }}
            >
              🔥
            </span>
            <span className="font-bold" style={{ color: "var(--gold-accent)" }}>
              {streak}
            </span>
          </div>
        )}
        {score !== undefined && (
          <motion.div
            key={score}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className="font-bold text-lg glow-gold"
            style={{
              color: "var(--gold-accent)",
              textShadow: "0 0 12px rgba(255, 214, 0, 0.4)",
              borderRadius: "var(--radius-sm)",
              padding: "2px 8px",
            }}
          >
            {score} pts
          </motion.div>
        )}

        {displayName && (
          <div className="flex items-center gap-2 ml-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                background: "var(--gradient-primary)",
                color: "var(--text-primary)",
                boxShadow: "var(--shadow-glow-green)",
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleSignOut}
              className="btn-ghost px-2 py-1 text-xs"
              title="Sign out"
              style={{ borderRadius: "var(--radius-sm)" }}
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
