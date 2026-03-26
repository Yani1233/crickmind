interface SkeletonProps {
  className?: string;
  variant?: "line" | "circle" | "card";
  count?: number;
}

const VARIANT_CLASSES: Record<string, string> = {
  line: "h-4 w-full rounded",
  circle: "h-12 w-12 rounded-full",
  card: "h-32 w-full rounded-xl",
};

export function Skeleton({ className = "", variant = "line", count = 1 }: SkeletonProps) {
  const baseClass = VARIANT_CLASSES[variant];

  if (count === 1) {
    return <div className={`skeleton ${baseClass} ${className}`} />;
  }

  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`skeleton ${baseClass} ${className}`} />
      ))}
    </div>
  );
}
