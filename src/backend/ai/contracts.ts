import type { AppSnapshot, Difficulty, GoalInput, PlanResult, Quest } from "@/shared/types/domain";

export interface DifficultyInput {
  title: string;
  estimatedMinutes?: number;
  dependencies?: number;
  ambiguity?: number;
}

export interface ReplanInput {
  goal: GoalInput;
  remainingBossHp: number;
  completedTitles: string[];
  activeQuests: Quest[];
}

export interface AlternativeResult {
  alternatives: Array<{ title: string; description: string; estimatedMinutes: number; reason: string }>;
}

export interface DailyReviewResult {
  review: string;
  next: string;
}

export interface AiPlanner {
  createPlan(input: GoalInput): Promise<PlanResult>;
  estimateDifficulty(input: DifficultyInput): Promise<Difficulty>;
  replan(input: ReplanInput): Promise<PlanResult>;
  suggestAlternatives(quest: Quest): Promise<AlternativeResult>;
  createDailyReview(snapshot: AppSnapshot): Promise<DailyReviewResult>;
}
