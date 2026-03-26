import { useMemo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface Star {
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly color: string;
  readonly duration: number;
  readonly delay: number;
}

interface ShootingStar {
  readonly x: number;
  readonly y: number;
  readonly delay: number;
  readonly duration: number;
}

function generateStars(count: number): readonly Star[] {
  const colors = ["#ffffff", "#ffffff", "#ffffff", "#c4b5fd", "#c4b5fd", "#67e8f9"];
  const stars: Star[] = [];

  for (let i = 0; i < count; i++) {
    const sizeRoll = Math.random();
    const size = sizeRoll < 0.5 ? 1 : sizeRoll < 0.8 ? 2 : 3;

    stars.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: 2 + Math.random() * 4,
      delay: Math.random() * 5,
    });
  }

  return stars;
}

function generateShootingStars(count: number): readonly ShootingStar[] {
  const shooting: ShootingStar[] = [];

  for (let i = 0; i < count; i++) {
    shooting.push({
      x: 10 + Math.random() * 60,
      y: 5 + Math.random() * 40,
      delay: 3 + Math.random() * 10,
      duration: 1 + Math.random() * 0.5,
    });
  }

  return shooting;
}

export function AnimatedBackground({ children }: Props) {
  const stars = useMemo(() => generateStars(65), []);
  const shootingStars = useMemo(() => generateShootingStars(3), []);

  return (
    <div className="relative">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {stars.map((star, i) => (
          <div
            key={`star-${i}`}
            style={{
              position: "absolute",
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              borderRadius: "50%",
              backgroundColor: star.color,
              opacity: 0.2,
              animation: `twinkle ${star.duration}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}

        {shootingStars.map((ss, i) => (
          <div
            key={`shooting-${i}`}
            style={{
              position: "absolute",
              left: `${ss.x}%`,
              top: `${ss.y}%`,
              width: "2px",
              height: "2px",
              borderRadius: "50%",
              backgroundColor: "#c4b5fd",
              boxShadow: "0 0 4px 1px rgba(196, 181, 253, 0.4)",
              opacity: 0,
              animation: `shooting-star ${ss.duration}s ease-out infinite`,
              animationDelay: `${ss.delay}s`,
            }}
          />
        ))}
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
