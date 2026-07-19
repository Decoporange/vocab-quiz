interface StreakBadgeProps {
  streak: number;
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
  return <span className="streak-badge">連続正解 {streak}</span>;
}
