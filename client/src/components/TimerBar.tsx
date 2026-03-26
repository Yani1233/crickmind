interface TimerBarProps {
  timeLeft: number;
  total: number;
}

export function TimerBar({ timeLeft, total }: TimerBarProps) {
  const pct = (timeLeft / total) * 100;

  // Gradient interpolation: green -> yellow -> red
  const getGradient = (): string => {
    if (pct > 50) {
      return "linear-gradient(90deg, #4CAF50, #66BB6A)";
    }
    if (pct > 25) {
      return "linear-gradient(90deg, #FFC107, #FFD54F)";
    }
    return "linear-gradient(90deg, #e53935, #ef5350)";
  };

  const getGlow = (): string => {
    if (pct > 50) return "0 0 8px rgba(76, 175, 80, 0.4)";
    if (pct > 25) return "0 0 8px rgba(255, 193, 7, 0.4)";
    return "0 0 8px rgba(229, 57, 53, 0.4)";
  };

  return (
    <div
      className="w-full overflow-hidden"
      style={{
        height: "8px",
        borderRadius: "var(--radius-xl)",
        background: "var(--glass-bg-light)",
        border: "1px solid var(--glass-border)",
      }}
    >
      <div
        className="h-full transition-all duration-100 ease-linear"
        style={{
          width: `${pct}%`,
          background: getGradient(),
          borderRadius: "var(--radius-xl)",
          boxShadow: getGlow(),
        }}
      />
    </div>
  );
}
