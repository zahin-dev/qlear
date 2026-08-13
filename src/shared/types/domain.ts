export enum GoalStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  ARCHIVED = "ARCHIVED",
}

export enum QuestStatus {
  READY = "READY",
  IN_PROGRESS = "IN_PROGRESS",
  CLEARED = "CLEARED",
}

export enum Difficulty {
  EASY = "EASY",
  NORMAL = "NORMAL",
  HARD = "HARD",
  BOSS = "BOSS",
}

export enum Rarity {
  COMMON = "COMMON",
  RARE = "RARE",
  EPIC = "EPIC",
  LEGENDARY = "LEGENDARY",
}

export type Energy = "LOW" | "NORMAL" | "HIGH";
export type QuestSource = "AI" | "USER" | "REPLAN" | "ALTERNATIVE" | "DEMO";
export type AiMode = "MOCK" | "OPENAI";

export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate?: string;
  availableMinutesPerDay?: number;
  energy: Energy;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Boss {
  id: string;
  goalId: string;
  title: string;
  scopeLevel: 1 | 2 | 3 | 4 | 5;
  maxHp: number;
  currentHp: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Quest {
  id: string;
  bossId: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  priority: number;
  damage: number;
  scheduledFor?: string;
  dueAt?: string;
  status: QuestStatus;
  order: number;
  source: QuestSource;
  aiReason: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Subquest {
  id: string;
  questId: string;
  title: string;
  estimatedMinutes?: number;
  status: QuestStatus;
  order: number;
}

export interface CompletionEvent {
  id: string;
  goalId: string;
  bossId: string;
  questId: string;
  subquestId?: string;
  questTitle: string;
  damage: number;
  xp: number;
  combo: number;
  titleUnlocked?: string;
  estimatedMinutes: number;
  completedAt: string;
}

export interface DailyReview {
  id: string;
  date: string;
  clearCount: number;
  damage: number;
  xp: number;
  maxCombo: number;
  estimatedMinutes: number;
  bossProgress: number;
  aiReview: string;
  next: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClearTitle {
  id: string;
  code: string;
  name: string;
  rarity: Rarity;
  description: string;
  unlockedAt: string;
}

export interface AppSettings {
  id: "app";
  aiMode: AiMode;
  animationsEnabled: boolean;
  reducedEffects: boolean;
  xp: number;
  level: number;
  currentCombo: number;
  maxCombo: number;
  smashSessionId?: string;
  schemaVersion: 1;
  updatedAt: string;
}

export interface CompletionOutcome {
  event: CompletionEvent;
  title?: ClearTitle;
  boss: Boss;
  settings: AppSettings;
}

export interface PlanQuest {
  title: string;
  description: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  priority: number;
  damage: number;
  scheduledFor?: string;
  dueAt?: string;
  source: QuestSource;
  aiReason: string;
  subquests: Array<{ title: string; estimatedMinutes?: number }>;
}

export interface PlanResult {
  scopeLevel: 1 | 2 | 3 | 4 | 5;
  bossTitle: string;
  maxHp: number;
  quests: [PlanQuest, PlanQuest, PlanQuest];
  summary: string;
}

export interface GoalInput {
  title: string;
  description?: string;
  targetDate?: string;
  availableMinutesPerDay?: number;
  energy: Energy;
}

export interface AppSnapshot {
  goal: Goal | null;
  boss: Boss | null;
  quests: Quest[];
  subquests: Subquest[];
  completionEvents: CompletionEvent[];
  dailyReviews: DailyReview[];
  titles: ClearTitle[];
  settings: AppSettings;
}

export interface ExportDocument {
  version: 1;
  exportedAt: string;
  data: {
    goals: Goal[];
    bosses: Boss[];
    quests: Quest[];
    subquests: Subquest[];
    completionEvents: CompletionEvent[];
    dailyReviews: DailyReview[];
    clearTitles: ClearTitle[];
    settings: AppSettings[];
  };
}
