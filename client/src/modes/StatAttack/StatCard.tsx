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
          className="absolute inset-0 flex items-center justify-center glass-card"
          style={{ backfaceVisibility: "hidden" }}
        >
          <motion.span
            animate={{
              opacity: [0.2, 0.4, 0.2],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="text-3xl font-black"
            style={{ color: "var(--text-muted)" }}
          >
            ?
          </motion.span>
        </div>

        {/* Face-up side (stat) */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center glass-card gradient-border-gold"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <span
            className="text-xs uppercase tracking-wider mb-1"
            style={{ color: "var(--text-muted)" }}
          >
            {label}
          </span>
          <span
            className="text-xl font-bold"
            style={{
              color: "var(--gold-accent)",
              textShadow: "0 0 8px rgba(255, 214, 0, 0.3)",
            }}
          >
            {value}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
