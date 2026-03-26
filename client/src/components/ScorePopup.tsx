import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PopupItem {
  id: number;
  points: number;
}

export function useScorePopup() {
  const [popups, setPopups] = useState<PopupItem[]>([]);
  let nextId = 0;

  const triggerPopup = useCallback((points: number) => {
    const id = ++nextId;
    setPopups((prev) => [...prev, { id, points }]);
    setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== id));
    }, 1000);
  }, []);

  return { popups, triggerPopup };
}

interface ScorePopupProps {
  popups: PopupItem[];
}

export function ScorePopup({ popups }: ScorePopupProps) {
  return (
    <div className="fixed top-20 right-4 z-50 pointer-events-none">
      <AnimatePresence>
        {popups.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, y: 0, scale: 0.8 }}
            animate={{ opacity: 0, y: -80, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="font-black text-3xl"
            style={{
              color: "var(--gold-accent)",
              textShadow: "0 0 16px rgba(255, 214, 0, 0.5), 0 0 32px rgba(255, 214, 0, 0.2)",
            }}
          >
            +{p.points}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
