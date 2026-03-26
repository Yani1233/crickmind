import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
  {
    title: "Connections",
    description: "Group 16 cricket items into 4 hidden categories",
    icon: "🔗",
    route: "/connections",
    mode: "connections" as const,
    minPlayers: 0,
    minQuestions: 0,
  },
  {
    title: "Timeline",
    description: "Put cricket events in the correct chronological order",
    icon: "📅",
    route: "/timeline",
    mode: "timeline" as const,
    minPlayers: 0,
    minQuestions: 0,
  },
  {
    title: "Mystery XI",
    description: "Name all 11 players in the mystery squad",
    icon: "🏏",
    route: "/mystery-xi",
    mode: "mystery-xi" as const,
    minPlayers: 0,
    minQuestions: 0,
  },
  {
    title: "Auction Arena",
    description: "Guess the IPL auction price for each player",
    icon: "💰",
    route: "/auction-arena",
    mode: "auction-arena" as const,
    minPlayers: 0,
    minQuestions: 0,
  },
];

export function Hub() {
  const navigate = useNavigate();
  const { totalScore, getHighScore } = useLocalScore();
  const { data: playerCount, isError: playerError } = usePlayerCount();
  const { data: questionCount, isError: questionError } = useQuestionCount();

  const stored = localStorage.getItem("crickmind_user");
  const displayName = stored ? JSON.parse(stored).displayName : null;

  const apiDown = playerError && questionError;
  const players = playerCount?.count ?? 0;
  const questions = questionCount?.count ?? 0;

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <h1 className="text-4xl font-black mb-1">
          <span className="gradient-text">CrickMind</span>
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          {displayName
            ? `Welcome back, ${displayName}`
            : "Welcome to CrickMind"}
        </p>

        {/* Total score glass card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card glow-gold inline-block px-8 py-4 mb-6"
          style={{ boxShadow: "var(--shadow-glow-gold), var(--shadow-glow-purple)" }}
        >
          <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
            Total Score
          </div>
          <div
            className="text-3xl font-black"
            style={{
              color: "var(--gold-accent)",
              textShadow: "0 0 16px rgba(255, 214, 0, 0.3)",
            }}
          >
            {totalScore}
          </div>
        </motion.div>

        {/* Quick stats row */}
        <div className="flex justify-center gap-4 mb-4">
          <button
            className="btn-ghost text-xs px-4 py-2"
            onClick={() => navigate("/leaderboard")}
          >
            Leaderboard
          </button>
          <button
            className="btn-ghost text-xs px-4 py-2"
            onClick={() => navigate("/profile")}
          >
            Profile
          </button>
        </div>
      </motion.div>

      {apiDown && (
        <div
          className="glass-card p-4 mb-6 text-center text-sm"
          style={{
            borderColor: "rgba(239, 68, 68, 0.4)",
            color: "rgba(252, 165, 165, 1)",
          }}
        >
          Connection error — check your internet and make sure the server is running.
          <button
            onClick={() => window.location.reload()}
            className="btn-ghost block mx-auto mt-2 px-4 py-1 text-xs"
            style={{ borderColor: "rgba(239, 68, 68, 0.3)" }}
          >
            Retry
          </button>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-5"
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

      <p className="text-center text-xs mt-12" style={{ color: "var(--text-muted)" }}>
        CrickMind — Built with love for cricket
      </p>
    </div>
  );
}
