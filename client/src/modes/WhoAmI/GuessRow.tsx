import { motion } from "framer-motion";
import type { WhoAmIGuess } from "../../../../shared/src/types";
import { AttributeCell } from "./AttributeCell";

interface GuessRowProps {
  guess: WhoAmIGuess;
  index: number;
}

export function GuessRow({ guess, index }: GuessRowProps) {
  const baseDelay = index * 0.08;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="glass-card p-3"
    >
      <div
        className="text-sm font-bold mb-2 truncate"
        style={{ color: "var(--text-primary)" }}
      >
        {guess.player.name}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {guess.results.map((attr, i) => (
          <AttributeCell
            key={attr.attribute}
            label={attr.attribute}
            value={attr.value}
            result={attr.result}
            direction={attr.direction}
            delay={baseDelay + i * 0.06}
          />
        ))}
      </div>
    </motion.div>
  );
}
