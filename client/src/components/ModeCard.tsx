import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface ModeCardProps {
  title: string;
  description: string;
  icon: string;
  route: string;
  highScore: number;
  disabled?: boolean;
}

export function ModeCard({ title, description, icon, route, highScore, disabled = false }: ModeCardProps) {
  const navigate = useNavigate();

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={() => !disabled && navigate(route)}
      disabled={disabled}
      className={`w-full bg-[#16213E] rounded-2xl p-6 text-left border transition-colors ${
        disabled
          ? "border-white/5 opacity-50 cursor-not-allowed"
          : "border-white/10 hover:border-[#FFD600]/40 cursor-pointer"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{icon}</span>
        {highScore > 0 && (
          <span className="text-xs bg-[#FFD600]/20 text-[#FFD600] px-2 py-1 rounded-lg font-bold">
            Best: {highScore}
          </span>
        )}
        {disabled && (
          <span className="text-xs bg-white/10 text-white/50 px-2 py-1 rounded-lg">
            Coming Soon
          </span>
        )}
      </div>
      <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
      <p className="text-white/50 text-sm">{description}</p>
    </motion.button>
  );
}
