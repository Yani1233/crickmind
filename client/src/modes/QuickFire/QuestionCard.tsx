import { motion } from "framer-motion";
import { TimerBar } from "../../components/TimerBar";
import type { QuizQuestion } from "../../../../shared/src/types";

interface QuestionCardProps {
  question: QuizQuestion;
  onAnswer: (selectedIndex: number) => void;
  timeLeft: number;
  total: number;
  disabled: boolean;
  selectedIndex: number | null;
  correctIndex: number;
}

function getOptionStyle(
  index: number,
  selectedIndex: number | null,
  correctIndex: number,
  disabled: boolean
): { className: string; style: React.CSSProperties } {
  const base = "w-full py-4 px-6 rounded-xl font-semibold text-left transition-all";

  if (!disabled) {
    return {
      className: `${base} glass-card-light cursor-pointer`,
      style: {
        color: "var(--text-primary)",
        borderColor: "var(--glass-border)",
      },
    };
  }

  if (index === correctIndex) {
    return {
      className: `${base}`,
      style: {
        background: "rgba(76, 175, 80, 0.25)",
        border: "1px solid rgba(76, 175, 80, 0.5)",
        color: "var(--text-primary)",
        boxShadow: "0 0 16px rgba(76, 175, 80, 0.3)",
        borderRadius: "var(--radius-md)",
      },
    };
  }

  if (index === selectedIndex && index !== correctIndex) {
    return {
      className: `${base} animate-shake`,
      style: {
        background: "rgba(239, 68, 68, 0.25)",
        border: "1px solid rgba(239, 68, 68, 0.5)",
        color: "var(--text-primary)",
        boxShadow: "0 0 16px rgba(239, 68, 68, 0.3)",
        borderRadius: "var(--radius-md)",
      },
    };
  }

  return {
    className: base,
    style: {
      background: "rgba(255, 255, 255, 0.03)",
      border: "1px solid var(--border-subtle)",
      color: "var(--text-muted)",
      borderRadius: "var(--radius-md)",
    },
  };
}

export function QuestionCard({
  question,
  onAnswer,
  timeLeft,
  total,
  disabled,
  selectedIndex,
  correctIndex,
}: QuestionCardProps) {
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 w-full max-w-2xl mx-auto px-4"
    >
      <div className="glass-card p-6 text-center">
        <p
          className="text-xl md:text-2xl font-bold leading-snug"
          style={{ color: "var(--text-primary)" }}
        >
          {question.question}
        </p>
        <div className="mt-3 flex items-center justify-center gap-2 text-xs">
          <span
            className="glass-card-light px-3 py-1"
            style={{ color: "var(--text-secondary)", borderRadius: "var(--radius-sm)" }}
          >
            {question.category}
          </span>
          <span
            className="glass-card-light px-3 py-1"
            style={{ color: "var(--text-secondary)", borderRadius: "var(--radius-sm)" }}
          >
            {question.difficulty}
          </span>
        </div>
      </div>

      <TimerBar timeLeft={timeLeft} total={total} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {question.options.map((option, index) => {
          const optionStyling = getOptionStyle(index, selectedIndex, correctIndex, disabled);
          return (
            <motion.button
              key={index}
              disabled={disabled}
              onClick={() => onAnswer(index)}
              className={optionStyling.className}
              style={optionStyling.style}
              whileHover={disabled ? undefined : { y: -1, boxShadow: "0 0 12px rgba(255, 214, 0, 0.15)" }}
              whileTap={disabled ? undefined : { scale: 0.97 }}
            >
              <span className="mr-2 font-mono text-sm" style={{ color: "var(--text-muted)" }}>
                {String.fromCharCode(65 + index)}.
              </span>
              {option}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
