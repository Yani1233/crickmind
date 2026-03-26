import { motion } from "framer-motion";
import { ModeCard } from "../components/ModeCard";
import { useLocalScore } from "../hooks/useLocalScore";
import { usePlayerCount } from "../api/players";
import { useQuestionCount } from "../api/questions";

const MODES = [
  {
    title: "Who Am I?",
    description: "Guess the mystery cricketer from attribute clues",
    icon: "🔍",
    route: "/who-am-i",
    mode: "who-am-i" as const,
    minPlayers: 1,
    minQuestions: 0,
  },
  {
    title: "Stat Attack",
    description: "Identify the player as stats are revealed one by one",
    icon: "📊",
    route: "/stat-attack",
    mode: "stat-attack" as const,
    minPlayers: 1,
    minQuestions: 0,
  },
  {
    title: "Quick Fire",
    description: "Answer 10 rapid-fire cricket trivia questions",
    icon: "⚡",
    route: "/quick-fire",
    mode: "quick-fire" as const,
    minPlayers: 0,
    minQuestions: 1,
  },
  {
    title: "Higher or Lower",
    description: "Which cricketer has the higher stat?",
    icon: "⚖️",
    route: "/higher-or-lower",
    mode: "higher-or-lower" as const,
    minPlayers: 2,
    minQuestions: 0,
  },
];

export function Hub() {
  const { totalScore, getHighScore } = useLocalScore();
  const { data: playerCount, isError: playerError } = usePlayerCount();
  const { data: questionCount, isError: questionError } = useQuestionCount();

  const apiDown = playerError && questionError;
  const players = playerCount?.count ?? 0;
  const questions = questionCount?.count ?? 0;

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <h1 className="text-4xl font-black text-white mb-1">
          🏏 Crick<span className="text-[#4CAF50]">Mind</span>
        </h1>
        <p className="text-white/50 text-sm mb-4">
          Test your cricket knowledge
        </p>
        <div className="inline-block bg-[#FFD600]/10 text-[#FFD600] font-bold px-4 py-2 rounded-xl text-sm">
          Total Score: {totalScore}
        </div>
      </motion.div>

      {apiDown && (
        <div className="bg-red-500/20 border border-red-500/40 text-red-300 rounded-xl p-4 mb-6 text-center text-sm">
          Connection error — check your internet and make sure the server is running.
          <button
            onClick={() => window.location.reload()}
            className="block mx-auto mt-2 bg-red-500/30 hover:bg-red-500/50 px-4 py-1 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {MODES.map((mode) => (
          <ModeCard
            key={mode.mode}
            title={mode.title}
            description={mode.description}
            icon={mode.icon}
            route={mode.route}
            highScore={getHighScore(mode.mode)}
            disabled={
              apiDown ||
              players < mode.minPlayers ||
              questions < mode.minQuestions
            }
          />
        ))}
      </motion.div>

      <p className="text-center text-white/20 text-xs mt-12">
        CrickMind — Built with love for cricket
      </p>
    </div>
  );
}
