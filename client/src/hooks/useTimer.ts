import { useState, useRef, useCallback, useEffect } from "react";

interface UseTimerOptions {
  duration: number;
  onExpire?: () => void;
  autoStart?: boolean;
}

export function useTimer({ duration, onExpire, autoStart = false }: UseTimerOptions) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const tick = useCallback(() => {
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const remaining = Math.max(0, duration - elapsed);
    setTimeLeft(remaining);

    if (remaining <= 0) {
      setIsRunning(false);
      onExpireRef.current?.();
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [duration]);

  const start = useCallback(() => {
    startTimeRef.current = Date.now();
    setIsRunning(true);
  }, []);

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setTimeLeft(duration);
    setIsRunning(false);
  }, [duration]);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setIsRunning(false);
  }, []);

  useEffect(() => {
    if (isRunning) {
      if (startTimeRef.current === 0) {
        startTimeRef.current = Date.now();
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [isRunning, tick]);

  return {
    timeLeft,
    elapsed: duration - timeLeft,
    isExpired: timeLeft <= 0,
    isRunning,
    start,
    stop,
    reset,
  };
}
