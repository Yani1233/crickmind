import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

function CricketBall({ className }: { className?: string }) {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className={className}>
      <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 20 C14 8, 26 8, 32 20 C26 32, 14 32, 8 20Z" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function Stumps({ className }: { className?: string }) {
  return (
    <svg width="36" height="50" viewBox="0 0 36 50" fill="none" className={className}>
      <line x1="8" y1="6" x2="8" y2="50" stroke="currentColor" strokeWidth="1.5" />
      <line x1="18" y1="6" x2="18" y2="50" stroke="currentColor" strokeWidth="1.5" />
      <line x1="28" y1="6" x2="28" y2="50" stroke="currentColor" strokeWidth="1.5" />
      <line x1="6" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="1.5" />
      <line x1="16" y1="6" x2="30" y2="6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function Bat({ className }: { className?: string }) {
  return (
    <svg width="24" height="60" viewBox="0 0 24 60" fill="none" className={className}>
      <rect x="7" y="0" width="10" height="36" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <line x1="12" y1="36" x2="12" y2="58" stroke="currentColor" strokeWidth="2" />
      <line x1="8" y1="58" x2="16" y2="58" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

const ELEMENTS = [
  { Component: CricketBall, top: "8%", left: "5%", delay: "0s", animation: "float", opacity: 0.04 },
  { Component: Stumps, top: "20%", left: "85%", delay: "2s", animation: "float-reverse", opacity: 0.03 },
  { Component: Bat, top: "55%", left: "10%", delay: "4s", animation: "float-reverse", opacity: 0.05 },
  { Component: CricketBall, top: "70%", left: "90%", delay: "1s", animation: "float", opacity: 0.04 },
  { Component: Stumps, top: "40%", left: "50%", delay: "3s", animation: "float", opacity: 0.03 },
  { Component: Bat, top: "85%", left: "70%", delay: "5s", animation: "float-reverse", opacity: 0.05 },
  { Component: CricketBall, top: "15%", left: "45%", delay: "2.5s", animation: "float-reverse", opacity: 0.03 },
  { Component: Stumps, top: "65%", left: "30%", delay: "1.5s", animation: "float", opacity: 0.04 },
] as const;

export function AnimatedBackground({ children }: Props) {
  return (
    <div className="relative">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {ELEMENTS.map((el, i) => (
          <div
            key={i}
            className="absolute text-white"
            style={{
              top: el.top,
              left: el.left,
              opacity: el.opacity,
              animation: `${el.animation} 8s ease-in-out infinite`,
              animationDelay: el.delay,
            }}
          >
            <el.Component />
          </div>
        ))}
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
