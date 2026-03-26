import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import type { Player } from "../../../../shared/src/types";

const FLAG_MAP: Record<string, string> = {
  IND: "\u{1F1EE}\u{1F1F3}", AUS: "\u{1F1E6}\u{1F1FA}", ENG: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}", PAK: "\u{1F1F5}\u{1F1F0}", SA: "\u{1F1FF}\u{1F1E6}",
  NZ: "\u{1F1F3}\u{1F1FF}", SL: "\u{1F1F1}\u{1F1F0}", WI: "\u{1F3CF}", BAN: "\u{1F1E7}\u{1F1E9}", AFG: "\u{1F1E6}\u{1F1EB}",
  ZIM: "\u{1F1FF}\u{1F1FC}", IRE: "\u{1F1EE}\u{1F1EA}",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type RevealState = "hidden" | "revealing" | "revealed";

interface StatCategory {
  label: string;
  key: string;
}

interface VersusCardProps {
  playerA: Player;
  playerB: Player;
  statCategory: StatCategory;
  revealState: RevealState;
  chosenSide: "A" | "B" | null;
  correctSide: "A" | "B" | null;
  onChoose: (side: "A" | "B") => void;
  playerBKey: string;
}

function AnimatedNumber({ target, duration = 800 }: { target: number; duration?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let frame: number;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(eased * target);

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  const isDecimal = target !== Math.floor(target);
  return <>{isDecimal ? display.toFixed(2) : Math.round(display)}</>;
}

function PlayerSide({
  player,
  statCategory,
  revealState,
  isChosen,
  isCorrect,
  onClick,
  side,
  animationKey,
}: {
  player: Player;
  statCategory: StatCategory;
  revealState: RevealState;
  isChosen: boolean;
  isCorrect: boolean | null;
  onClick: () => void;
  side: "A" | "B";
  animationKey: string;
}) {
  const statValue = player[statCategory.key as keyof Player] as number;
  const isClickable = revealState === "hidden";

  const getBorderStyle = (): React.CSSProperties => {
    if (revealState === "revealed" && isCorrect !== null) {
      if (isCorrect) {
        return {
          borderColor: "rgba(76, 175, 80, 0.6)",
          boxShadow: "0 0 20px rgba(76, 175, 80, 0.2), var(--shadow-md)",
        };
      }
      return {
        borderColor: "rgba(239, 68, 68, 0.4)",
        boxShadow: "var(--shadow-md)",
        opacity: 0.7,
      };
    }
    return {};
  };

  const slideDirection = side === "A" ? -1 : 1;

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={animationKey}
        layout
        initial={{ opacity: 0, x: slideDirection * 200 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: slideDirection * -200 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={isClickable ? onClick : undefined}
        className={`flex-1 min-w-0 glass-card p-5 border-2 transition-all ${
          isClickable ? "cursor-pointer hover:border-[rgba(255,214,0,0.4)]" : ""
        }`}
        style={getBorderStyle()}
        whileHover={isClickable ? { y: -2 } : undefined}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
            style={{
              background: "var(--gradient-primary)",
              color: "var(--text-primary)",
              boxShadow: "var(--shadow-glow-green)",
            }}
          >
            {getInitials(player.name)}
          </div>
          <div className="min-w-0">
            <h3
              className="font-bold text-lg truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {FLAG_MAP[player.country] ?? "\u{1F3CF}"} {player.name}
            </h3>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {player.role} · {player.country}
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          {revealState === "hidden" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm font-medium py-3"
              style={{ color: "var(--text-muted)" }}
            >
              Tap to choose
            </motion.div>
          )}

          {(revealState === "revealing" || revealState === "revealed") && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="py-2"
            >
              <div
                className="text-xs uppercase tracking-wider mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                {statCategory.label}
              </div>
              <div
                className="text-3xl font-black"
                style={{
                  color: "var(--gold-accent)",
                  textShadow: "0 0 12px rgba(255, 214, 0, 0.3)",
                }}
              >
                <AnimatedNumber target={statValue} />
              </div>
            </motion.div>
          )}
        </div>

        {revealState === "revealed" && isCorrect !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-3 text-center text-sm font-bold`}
            style={{
              color: isCorrect
                ? "var(--match-green)"
                : "rgb(239, 68, 68)",
            }}
          >
            {isCorrect ? "HIGHER" : "LOWER"}
          </motion.div>
        )}

        {revealState === "revealed" && isChosen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-1 text-center text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            Your pick
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export function VersusCard({
  playerA,
  playerB,
  statCategory,
  revealState,
  chosenSide,
  correctSide,
  onChoose,
  playerBKey,
}: VersusCardProps) {
  function getIsCorrect(side: "A" | "B"): boolean | null {
    if (correctSide === null) return null;
    return side === correctSide;
  }

  return (
    <div className="flex flex-col md:flex-row items-stretch gap-4 w-full max-w-3xl mx-auto px-4">
      <PlayerSide
        player={playerA}
        statCategory={statCategory}
        revealState={revealState}
        isChosen={chosenSide === "A"}
        isCorrect={getIsCorrect("A")}
        onClick={() => onChoose("A")}
        side="A"
        animationKey={`A-${playerA.id}`}
      />

      <div className="flex flex-col items-center justify-center py-2 md:py-0 md:px-2 shrink-0">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          className="w-14 h-14 rounded-full flex items-center justify-center font-black text-lg"
          style={{
            background: "var(--gradient-accent)",
            color: "var(--bg-secondary)",
            boxShadow: "var(--shadow-glow-gold)",
          }}
        >
          VS
        </motion.div>
        <div
          className="mt-2 text-xs font-medium text-center uppercase tracking-wider"
          style={{ color: "var(--text-secondary)" }}
        >
          {statCategory.label}
        </div>
      </div>

      <PlayerSide
        player={playerB}
        statCategory={statCategory}
        revealState={revealState}
        isChosen={chosenSide === "B"}
        isCorrect={getIsCorrect("B")}
        onClick={() => onChoose("B")}
        side="B"
        animationKey={`B-${playerBKey}`}
      />
    </div>
  );
}
