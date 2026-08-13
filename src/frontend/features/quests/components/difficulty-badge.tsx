import type { Difficulty } from "@/shared/types/domain";

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return <span className={`difficulty difficulty--${difficulty.toLowerCase()}`}>{difficulty}</span>;
}
