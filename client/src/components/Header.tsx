import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface HeaderProps {
  title: string;
  score?: number;
  streak?: number;
}

export function Header({ title, score, streak }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-[#16213E]/95 backdrop-blur-sm border-b border-white/10 px-4 py-3 flex items-center justify-between">
      <button
        onClick={() => navigate("/")}
        className="text-white/70 hover:text-white transition-colors text-sm flex items-center gap-1"
      >
        <span>&larr;</span> Hub
      </button>

      <h1 className="text-lg font-bold text-white">{title}</h1>

      <div className="flex items-center gap-3 text-sm">
        {streak !== undefined && (
          <div className="flex items-center gap-1">
            {streak >= 5 && <span className="animate-pulse">🔥</span>}
            <span className="text-orange-400 font-bold">{streak}</span>
          </div>
        )}
        {score !== undefined && (
          <motion.div
            key={score}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className="text-[#FFD600] font-bold"
          >
            {score} pts
          </motion.div>
        )}
      </div>
    </header>
  );
}
