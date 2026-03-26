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
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -60 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="text-[#FFD600] font-bold text-2xl"
          >
            +{p.points}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
