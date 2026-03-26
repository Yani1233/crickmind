interface TimerBarProps {
  timeLeft: number;
  total: number;
}

export function TimerBar({ timeLeft, total }: TimerBarProps) {
  const pct = (timeLeft / total) * 100;

  let color = "bg-[#4CAF50]";
  if (pct < 25) color = "bg-red-500";
  else if (pct < 50) color = "bg-[#FFC107]";

  return (
    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} transition-all duration-100 ease-linear rounded-full`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
