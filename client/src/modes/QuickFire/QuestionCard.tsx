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

function getOptionClass(
  index: number,
  selectedIndex: number | null,
  correctIndex: number,
  disabled: boolean
): string {
  const base =
    "w-full py-4 px-6 rounded-xl font-semibold text-left text-white transition-colors";

  if (!disabled) {
    return `${base} bg-white/10 hover:bg-white/20 active:scale-[0.98]`;
  }

  if (index === correctIndex) {
    return `${base} bg-[#4CAF50] text-white`;
  }

  if (index === selectedIndex && index !== correctIndex) {
    return `${base} bg-red-500 text-white animate-shake`;
  }

  return `${base} bg-white/5 text-white/30`;
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
      <div className="text-center">
        <p className="text-xl md:text-2xl font-bold text-white leading-snug">
          {question.question}
        </p>
        <div className="mt-2 flex items-center gap-2 text-xs text-white/40">
          <span className="bg-white/10 px-2 py-0.5 rounded">
            {question.category}
          </span>
          <span className="bg-white/10 px-2 py-0.5 rounded">
            {question.difficulty}
          </span>
        </div>
      </div>

      <TimerBar timeLeft={timeLeft} total={total} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {question.options.map((option, index) => (
          <motion.button
            key={index}
            disabled={disabled}
            onClick={() => onAnswer(index)}
            className={getOptionClass(index, selectedIndex, correctIndex, disabled)}
            whileTap={disabled ? undefined : { scale: 0.97 }}
          >
            <span className="text-white/40 mr-2 font-mono text-sm">
              {String.fromCharCode(65 + index)}.
            </span>
            {option}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
