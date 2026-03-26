import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "../../components/Header";
import { ResultScreen } from "../../components/ResultScreen";
import { GameIntro } from "../../components/GameIntro";
import { GAME_INTROS } from "../../data/gameIntros";
import { QuestionCard } from "./QuestionCard";
import { apiFetch } from "../../api/client";
import { useTimer } from "../../hooks/useTimer";
import { useLocalScore } from "../../hooks/useLocalScore";
import { calculateSpeedBonus } from "../../utils/scoring";
import type { QuizQuestion, QuickFireResult } from "../../../../shared/src/types";

const QUESTION_COUNT = 10;
const TIME_PER_QUESTION = 15;
const BASE_POINTS = 10;
const ADVANCE_DELAY_MS = 1500;

type GamePhase = "intro" | "loading" | "playing" | "feedback" | "result" | "error";

export function QuickFireGame() {
  const navigate = useNavigate();
  const { recordScore } = useLocalScore();

  const [phase, setPhase] = useState<GamePhase>("intro");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<QuickFireResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const advanceTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const currentQuestion = questions[currentIndex] ?? null;

  const handleTimeout = useCallback(() => {
    if (phase !== "playing") return;
    handleAnswer(-1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentIndex]);

  const { timeLeft, elapsed, start, stop, reset } = useTimer({
    duration: TIME_PER_QUESTION,
    onExpire: handleTimeout,
  });

  // Fetch questions when entering loading phase
  useEffect(() => {
    if (phase !== "loading") return;

    let cancelled = false;

    async function load() {
      try {
        const data = await apiFetch<QuizQuestion[]>(
          `/questions?count=${QUESTION_COUNT}`
        );
        if (cancelled) return;

        if (!data || data.length === 0) {
          setPhase("error");
          return;
        }

        setQuestions(data);
        setPhase("playing");
      } catch {
        if (!cancelled) setPhase("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [phase]);

  // Start timer when entering playing phase or advancing to next question
  useEffect(() => {
    if (phase === "playing" && currentQuestion) {
      reset();
      start();
    }
  }, [phase, currentIndex, currentQuestion, reset, start]);

  // Cleanup advance timer on unmount
  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

  function handleAnswer(selected: number) {
    if (phase !== "playing" || !currentQuestion) return;

    stop();
    const timeTaken = elapsed;
    const isCorrect = selected === currentQuestion.correctAnswer;
    const speedBonus = isCorrect ? calculateSpeedBonus(timeTaken) : 0;
    const points = isCorrect ? BASE_POINTS + speedBonus : 0;

    const result: QuickFireResult = {
      questionId: currentQuestion.id,
      selectedAnswer: selected,
      correct: isCorrect,
      timeTaken,
      points,
    };

    setSelectedIndex(selected);
    setPointsEarned(points);
    setTotalScore((prev) => prev + points);
    setStreak((prev) => (isCorrect ? prev + 1 : 0));
    setResults((prev) => [...prev, result]);
    setPhase("feedback");

    advanceTimerRef.current = setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex >= questions.length) {
        setPhase("result");
      } else {
        setCurrentIndex(nextIndex);
        setSelectedIndex(null);
        setPointsEarned(0);
        setPhase("playing");
      }
    }, ADVANCE_DELAY_MS);
  }

  // Record score when game ends
  useEffect(() => {
    if (phase === "result" && results.length > 0) {
      recordScore("quick-fire", totalScore);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function handlePlayAgain() {
    setQuestions([]);
    setCurrentIndex(0);
    setResults([]);
    setSelectedIndex(null);
    setPointsEarned(0);
    setTotalScore(0);
    setStreak(0);
    reset();
    setPhase("loading");
  }

  if (phase === "intro") {
    return (
      <GameIntro
        {...GAME_INTROS["quick-fire"]}
        onStart={() => setPhase("loading")}
      />
    );
  }

  if (phase === "error") {
    return (
      <div className="min-h-screen">
        <Header title="Quick Fire" />
        <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
          <p className="text-white/50 text-lg">No questions available</p>
          <button
            onClick={() => navigate("/")}
            className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            Back to Hub
          </button>
        </div>
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="min-h-screen">
        <Header title="Quick Fire" />
        <div className="flex items-center justify-center h-[80vh]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-8 h-8 border-2 border-white/20 border-t-[#FFD600] rounded-full"
          />
        </div>
      </div>
    );
  }

  if (phase === "result") {
    const correctCount = results.filter((r) => r.correct).length;
    const accuracy = Math.round((correctCount / results.length) * 100);
    const answeredResults = results.filter((r) => r.correct);
    const fastestTime =
      answeredResults.length > 0
        ? Math.min(...answeredResults.map((r) => r.timeTaken))
        : 0;

    return (
      <ResultScreen
        title="Quick Fire Complete!"
        score={totalScore}
        stats={[
          { label: "Correct", value: `${correctCount}/${results.length}` },
          { label: "Accuracy", value: `${accuracy}%` },
          { label: "Fastest Answer", value: `${fastestTime.toFixed(1)}s` },
          { label: "Best Streak", value: getBestStreak(results) },
        ]}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  // playing or feedback
  return (
    <div className="min-h-screen flex flex-col">
      <Header title="Quick Fire" score={totalScore} streak={streak} />

      <div className="flex-1 flex flex-col items-center justify-center py-8">
        <p className="text-white/40 text-sm mb-6 font-medium">
          Question {currentIndex + 1} of {questions.length}
        </p>

        <AnimatePresence mode="wait">
          {currentQuestion && (
            <QuestionCard
              key={currentQuestion.id}
              question={currentQuestion}
              onAnswer={handleAnswer}
              timeLeft={timeLeft}
              total={TIME_PER_QUESTION}
              disabled={phase === "feedback"}
              selectedIndex={selectedIndex}
              correctIndex={currentQuestion.correctAnswer}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase === "feedback" && pointsEarned > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 text-[#FFD600] text-2xl font-black"
            >
              +{pointsEarned} pts
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function getBestStreak(results: QuickFireResult[]): number {
  let best = 0;
  let current = 0;
  for (const r of results) {
    if (r.correct) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }
  return best;
}
