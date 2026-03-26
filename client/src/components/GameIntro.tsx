import { type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AnimatedBackground } from "./AnimatedBackground";

interface GameIntroProps {
  title: string;
  icon: string;
  description: string;
  howToPlay: readonly string[];
  scoring: readonly string[];
  example?: {
    label: string;
    content: ReactNode;
  };
  onStart: () => void;
  difficulty?: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function GameIntro({
  title,
  icon,
  description,
  howToPlay,
  scoring,
  example,
  onStart,
  difficulty,
}: GameIntroProps) {
  const navigate = useNavigate();

  return (
    <AnimatedBackground>
      <div className="min-h-screen flex flex-col">
        {/* Header bar */}
        <header
          className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between glass-card"
          style={{
            borderRadius: 0,
            borderLeft: "none",
            borderRight: "none",
            borderTop: "none",
            borderBottom: "1px solid transparent",
            borderImage:
              "linear-gradient(to right, transparent, var(--gold-accent), transparent) 1",
          }}
        >
          <button
            onClick={() => navigate("/")}
            className="btn-ghost px-3 py-1.5 text-sm flex items-center gap-1"
          >
            <span>&larr;</span> Hub
          </button>
          <h1
            className="text-lg font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </h1>
          <div className="w-16" />
        </header>

        {/* Content */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex-1 flex flex-col items-center py-8 px-4"
        >
          {/* Icon + Title */}
          <motion.div variants={item} className="text-center mb-6">
            <span className="text-6xl block mb-3">{icon}</span>
            <h2
              className="text-3xl font-black"
              style={{
                background: "linear-gradient(135deg, var(--gold-accent), var(--cyan-accent))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {title}
            </h2>
            {difficulty && (
              <span
                className="inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-medium"
                style={{
                  background: "rgba(139, 92, 246, 0.2)",
                  color: "rgb(167, 139, 250)",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                }}
              >
                {difficulty}
              </span>
            )}
          </motion.div>

          {/* Description */}
          <motion.p
            variants={item}
            className="text-center max-w-md text-sm leading-relaxed mb-8"
            style={{ color: "var(--text-muted)" }}
          >
            {description}
          </motion.p>

          {/* Glass card container */}
          <motion.div
            variants={item}
            className="glass-card p-6 w-full max-w-lg space-y-6"
            style={{
              boxShadow:
                "var(--shadow-lg), 0 0 40px rgba(139, 92, 246, 0.08)",
            }}
          >
            {/* How to Play */}
            <div>
              <h3
                className="text-sm font-bold uppercase tracking-wider mb-3"
                style={{ color: "var(--gold-accent)" }}
              >
                How to Play
              </h3>
              <div className="space-y-2">
                {howToPlay.map((step, index) => (
                  <motion.div
                    key={index}
                    variants={item}
                    className="glass-card-light px-4 py-3 flex items-start gap-3"
                  >
                    <span
                      className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background: "rgba(255, 214, 0, 0.15)",
                        color: "var(--gold-accent)",
                        border: "1px solid rgba(255, 214, 0, 0.3)",
                      }}
                    >
                      {index + 1}
                    </span>
                    <span
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {step}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Scoring */}
            <div>
              <h3
                className="text-sm font-bold uppercase tracking-wider mb-3"
                style={{ color: "var(--cyan-accent)" }}
              >
                Scoring
              </h3>
              <div className="space-y-1.5">
                {scoring.map((rule, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span
                      className="shrink-0 w-1.5 h-1.5 rounded-full"
                      style={{ background: "var(--cyan-accent)" }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-secondary, var(--text-primary))" }}
                    >
                      {rule}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Optional Example */}
            {example && (
              <div>
                <h3
                  className="text-sm font-bold uppercase tracking-wider mb-3"
                  style={{ color: "var(--green-accent)" }}
                >
                  {example.label}
                </h3>
                <div className="glass-card-light p-4">{example.content}</div>
              </div>
            )}
          </motion.div>

          {/* Start Button */}
          <motion.button
            variants={item}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
            className="btn-primary mt-8 px-12 py-4 text-lg font-bold"
            style={{
              boxShadow:
                "0 0 30px rgba(0, 230, 118, 0.25), 0 4px 20px rgba(0, 0, 0, 0.3)",
            }}
          >
            Start Game
          </motion.button>
        </motion.div>
      </div>
    </AnimatedBackground>
  );
}
