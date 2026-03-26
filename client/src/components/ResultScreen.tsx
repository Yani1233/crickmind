import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface ResultScreenProps {
  title: string;
  score: number;
  stats?: Array<{ label: string; value: string | number }>;
  onPlayAgain: () => void;
}

export function ResultScreen({ title, score, stats, onPlayAgain }: ResultScreenProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="bg-[#16213E] rounded-2xl p-8 max-w-md w-full text-center border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>

        <div className="my-6">
          <div className="text-6xl font-black text-[#FFD600]">{score}</div>
          <div className="text-white/50 text-sm mt-1">points</div>
        </div>

        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white/5 rounded-xl p-3">
                <div className="text-white/40 text-xs">{stat.label}</div>
                <div className="text-white font-bold">{stat.value}</div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onPlayAgain}
            className="flex-1 bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-bold py-3 rounded-xl transition-colors"
          >
            Play Again
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Back to Hub
          </button>
        </div>
      </div>
    </motion.div>
  );
}
