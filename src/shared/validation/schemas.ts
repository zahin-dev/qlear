import { z } from "zod";
import { Difficulty, GoalStatus, QuestStatus, Rarity } from "@/shared/types/domain";

const isoDate = z.string().min(10);
const optionalText = z.string().trim().max(1000).optional();

export const goalInputSchema = z.object({
  title: z.string().trim().min(3, "目標を3文字以上で入力してください").max(160),
  description: optionalText,
  targetDate: z.string().optional(),
  availableMinutesPerDay: z.number().int().min(5).max(720).optional(),
  energy: z.enum(["LOW", "NORMAL", "HIGH"]),
});

export const goalSchema = goalInputSchema.extend({
  id: z.string().min(1),
  status: z.enum(GoalStatus),
  createdAt: isoDate,
  updatedAt: isoDate,
  completedAt: isoDate.optional(),
});

export const bossSchema = z.object({
  id: z.string().min(1),
  goalId: z.string().min(1),
  title: z.string().trim().min(1).max(160),
  scopeLevel: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  maxHp: z.number().int().min(1).max(9999),
  currentHp: z.number().int().min(0).max(9999),
  createdAt: isoDate,
  updatedAt: isoDate,
  completedAt: isoDate.optional(),
}).refine((value) => value.currentHp <= value.maxHp, {
  message: "currentHp must not exceed maxHp",
  path: ["currentHp"],
});

export const questSchema = z.object({
  id: z.string().min(1),
  bossId: z.string().min(1),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(1200),
  difficulty: z.enum(Difficulty),
  estimatedMinutes: z.number().int().min(1).max(1440),
  priority: z.number().int().min(1).max(5),
  damage: z.number().int().min(1).max(999),
  scheduledFor: z.string().optional(),
  dueAt: z.string().optional(),
  status: z.enum(QuestStatus),
  order: z.number().int().min(0),
  source: z.enum(["AI", "USER", "REPLAN", "ALTERNATIVE", "DEMO"]),
  aiReason: z.string().max(240),
  createdAt: isoDate,
  updatedAt: isoDate,
  completedAt: isoDate.optional(),
});

export const subquestSchema = z.object({
  id: z.string().min(1),
  questId: z.string().min(1),
  title: z.string().trim().min(1).max(160),
  estimatedMinutes: z.number().int().min(1).max(720).optional(),
  status: z.enum(QuestStatus),
  order: z.number().int().min(0).max(2),
});

const planQuestSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(1200),
  difficulty: z.enum(Difficulty),
  estimatedMinutes: z.number().int().min(1).max(1440),
  priority: z.number().int().min(1).max(5),
  damage: z.number().int().min(1).max(999),
  scheduledFor: z.string().optional(),
  dueAt: z.string().optional(),
  source: z.enum(["AI", "USER", "REPLAN", "ALTERNATIVE", "DEMO"]),
  aiReason: z.string().max(240),
  subquests: z.array(z.object({
    title: z.string().trim().min(1).max(160),
    estimatedMinutes: z.number().int().min(1).max(720).optional(),
  })).max(3),
});

export const planResultSchema = z.object({
  scopeLevel: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  bossTitle: z.string().trim().min(1).max(160),
  maxHp: z.number().int().min(1).max(9999),
  quests: z.tuple([planQuestSchema, planQuestSchema, planQuestSchema]),
  summary: z.string().max(240),
});

export const settingsSchema = z.object({
  id: z.literal("app"),
  aiMode: z.enum(["MOCK", "OPENAI"]),
  animationsEnabled: z.boolean(),
  reducedEffects: z.boolean(),
  xp: z.number().int().min(0),
  level: z.number().int().min(1),
  currentCombo: z.number().int().min(0),
  maxCombo: z.number().int().min(0),
  smashSessionId: z.string().optional(),
  schemaVersion: z.literal(1),
  updatedAt: isoDate,
});

const completionEventSchema = z.object({
  id: z.string(), goalId: z.string(), bossId: z.string(), questId: z.string(),
  subquestId: z.string().optional(), questTitle: z.string(), damage: z.number().int().min(0),
  xp: z.number().int().min(0), combo: z.number().int().min(0), titleUnlocked: z.string().optional(),
  estimatedMinutes: z.number().int().min(0), completedAt: isoDate,
});

const dailyReviewSchema = z.object({
  id: z.string(), date: z.string(), clearCount: z.number().int().min(0), damage: z.number().int().min(0),
  xp: z.number().int().min(0), maxCombo: z.number().int().min(0), estimatedMinutes: z.number().int().min(0),
  bossProgress: z.number().min(0).max(100), aiReview: z.string(), next: z.string(), createdAt: isoDate, updatedAt: isoDate,
});

const clearTitleSchema = z.object({
  id: z.string(), code: z.string(), name: z.string(), rarity: z.enum(Rarity), description: z.string(), unlockedAt: isoDate,
});

export const importDocumentSchema = z.object({
  version: z.literal(1),
  exportedAt: isoDate,
  data: z.object({
    goals: z.array(goalSchema),
    bosses: z.array(bossSchema),
    quests: z.array(questSchema),
    subquests: z.array(subquestSchema),
    completionEvents: z.array(completionEventSchema),
    dailyReviews: z.array(dailyReviewSchema),
    clearTitles: z.array(clearTitleSchema),
    settings: z.array(settingsSchema).max(1),
  }),
});
