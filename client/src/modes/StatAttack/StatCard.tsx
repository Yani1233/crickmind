import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string | number;
  revealed: boolean;
  index: number;
}

export function StatCard({ label, value, revealed, index }: StatCardProps) {
  return (
    <div className="perspective-[600px]">
      <motion.div
        className="relative w-full h-24 cursor-default"
        initial={false}
        animate={{ rotateY: revealed ? 180 : 0 }}
        transition={{ duration: 0.6, delay: revealed ? index * 0.05 : 0 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Face-down side (?) */}
        <div
          className="absolute inset-0 flex items-center justify-center bg-[#16213E] rounded-xl border border-white/10"
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="text-3xl font-black text-white/20">?</span>
        </div>

        {/* Face-up side (stat) */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center bg-[#16213E] rounded-xl border border-[#FFD600]/30"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <span className="text-white/50 text-xs uppercase tracking-wider mb-1">
            {label}
          </span>
          <span className="text-[#FFD600] text-xl font-bold">{value}</span>
        </div>
      </motion.div>
    </div>
  );
}
