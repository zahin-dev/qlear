import { getDatabase, type QlearDatabase } from "@/backend/db/database";
import { applyDamage, calculateXp, levelFromXp, unlockTitle } from "@/shared/domain/gamification/core";
import { bossSchema, importDocumentSchema, questSchema, settingsSchema } from "@/shared/validation/schemas";
import { createId } from "@/shared/utils/identifiers";
import {
  GoalStatus,
  QuestStatus,
  type AppSettings,
  type AppSnapshot,
  type CompletionEvent,
  type CompletionOutcome,
  type DailyReview,
  type ExportDocument,
  type Goal,
  type GoalInput,
  type PlanResult,
  type Quest,
  type Subquest,
} from "@/shared/types/domain";

export const DEFAULT_SETTINGS: AppSettings = {
  id: "app",
  aiMode: "MOCK",
  animationsEnabled: true,
  reducedEffects: false,
  xp: 0,
  level: 1,
  currentCombo: 0,
  maxCombo: 0,
  schemaVersion: 1,
  updatedAt: new Date(0).toISOString(),
};

export interface QlearRepository {
  loadSnapshot(): Promise<AppSnapshot>;
  savePlan(input: GoalInput, plan: PlanResult): Promise<void>;
  updateGoal(patch: Partial<Pick<Goal, "title" | "description" | "targetDate" | "availableMinutesPerDay" | "energy">>): Promise<void>;
  updateBossHp(maxHp: number): Promise<void>;
  updateQuest(quest: Quest, subquests?: Subquest[]): Promise<void>;
  setQuestStatus(id: string, status: QuestStatus): Promise<void>;
  replaceRoute(plan: PlanResult): Promise<void>;
  completeQuest(id: string, sessionId: string): Promise<CompletionOutcome>;
  saveDailyReview(review: DailyReview): Promise<void>;
  updateSettings(patch: Partial<Pick<AppSettings, "aiMode" | "animationsEnabled" | "reducedEffects">>): Promise<void>;
  exportData(): Promise<ExportDocument>;
  importData(value: unknown): Promise<void>;
  reset(): Promise<void>;
}

export class LocalQlearRepository implements QlearRepository {
  constructor(private readonly db: QlearDatabase = getDatabase()) {}

  async loadSnapshot(): Promise<AppSnapshot> {
    const goal = (await this.db.goals.where("status").equals(GoalStatus.ACTIVE).last()) ?? (await this.db.goals.orderBy("updatedAt").last()) ?? null;
    const boss = goal ? (await this.db.bosses.where("goalId").equals(goal.id).last()) ?? null : null;
    const quests = boss ? await this.db.quests.where("bossId").equals(boss.id).sortBy("order") : [];
    const subquests = quests.length
      ? (await Promise.all(quests.map((quest) => this.db.subquests.where("questId").equals(quest.id).sortBy("order")))).flat()
      : [];
    const settings = (await this.db.settings.get("app")) ?? { ...DEFAULT_SETTINGS, updatedAt: new Date().toISOString() };
    if (!(await this.db.settings.get("app"))) await this.db.settings.put(settings);
    return {
      goal,
      boss,
      quests,
      subquests,
      completionEvents: await this.db.completionEvents.orderBy("completedAt").reverse().toArray(),
      dailyReviews: await this.db.dailyReviews.orderBy("date").reverse().toArray(),
      titles: await this.db.clearTitles.orderBy("unlockedAt").reverse().toArray(),
      settings,
    };
  }

  async savePlan(input: GoalInput, plan: PlanResult): Promise<void> {
    const now = new Date().toISOString();
    const goalId = createId("goal");
    const bossId = createId("boss");
    const goal: Goal = {
      ...input,
      id: goalId,
      description: input.description || undefined,
      targetDate: input.targetDate || undefined,
      status: GoalStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    };
    const boss = bossSchema.parse({
      id: bossId,
      goalId,
      title: plan.bossTitle,
      scopeLevel: plan.scopeLevel,
      maxHp: plan.maxHp,
      currentHp: plan.maxHp,
      createdAt: now,
      updatedAt: now,
    });
    const quests: Quest[] = [];
    const subquests: Subquest[] = [];
    plan.quests.forEach((planQuest, order) => {
      const questId = createId("quest");
      quests.push(questSchema.parse({
        ...planQuest,
        id: questId,
        bossId,
        status: QuestStatus.READY,
        order,
        createdAt: now,
        updatedAt: now,
      }));
      planQuest.subquests.forEach((subquest, subOrder) => {
        subquests.push({
          id: createId("subquest"),
          questId,
          title: subquest.title,
          estimatedMinutes: subquest.estimatedMinutes,
          status: QuestStatus.READY,
          order: subOrder,
        });
      });
    });
    await this.db.transaction("rw", this.db.goals, this.db.bosses, this.db.quests, this.db.subquests, async () => {
      const activeGoals = await this.db.goals.where("status").equals(GoalStatus.ACTIVE).toArray();
      await Promise.all(activeGoals.map((active) => this.db.goals.update(active.id, { status: GoalStatus.ARCHIVED, updatedAt: now })));
      await this.db.goals.add(goal);
      await this.db.bosses.add(boss);
      await this.db.quests.bulkAdd(quests);
      if (subquests.length) await this.db.subquests.bulkAdd(subquests);
    });
  }

  async updateGoal(patch: Partial<Pick<Goal, "title" | "description" | "targetDate" | "availableMinutesPerDay" | "energy">>): Promise<void> {
    const goal = await this.db.goals.where("status").equals(GoalStatus.ACTIVE).last();
    if (!goal) throw new Error("NO_ACTIVE_GOAL");
    await this.db.goals.update(goal.id, { ...patch, updatedAt: new Date().toISOString() });
  }

  async updateBossHp(maxHp: number): Promise<void> {
    const goal = await this.db.goals.where("status").equals(GoalStatus.ACTIVE).last();
    if (!goal) throw new Error("NO_ACTIVE_GOAL");
    const boss = await this.db.bosses.where("goalId").equals(goal.id).last();
    if (!boss) throw new Error("NO_ACTIVE_BOSS");
    const validated = bossSchema.parse({ ...boss, maxHp, currentHp: Math.min(maxHp, boss.currentHp), updatedAt: new Date().toISOString() });
    await this.db.bosses.put(validated);
  }

  async updateQuest(quest: Quest, subquests?: Subquest[]): Promise<void> {
    const validated = questSchema.parse({ ...quest, updatedAt: new Date().toISOString() });
    await this.db.transaction("rw", this.db.quests, this.db.subquests, async () => {
      await this.db.quests.put(validated);
      if (subquests) {
        await this.db.subquests.where("questId").equals(quest.id).delete();
        if (subquests.length) await this.db.subquests.bulkPut(subquests.slice(0, 3));
      }
    });
  }

  async setQuestStatus(id: string, status: QuestStatus): Promise<void> {
    await this.db.quests.update(id, { status, updatedAt: new Date().toISOString() });
  }

  async replaceRoute(plan: PlanResult): Promise<void> {
    const goal = await this.db.goals.where("status").equals(GoalStatus.ACTIVE).last();
    if (!goal) throw new Error("NO_ACTIVE_GOAL");
    const boss = await this.db.bosses.where("goalId").equals(goal.id).last();
    if (!boss) throw new Error("NO_ACTIVE_BOSS");
    const uncleared = await this.db.quests.where("bossId").equals(boss.id).filter((quest) => quest.status !== QuestStatus.CLEARED).toArray();
    const now = new Date().toISOString();
    const quests: Quest[] = [];
    const subquests: Subquest[] = [];
    plan.quests.forEach((planQuest, order) => {
      const questId = createId("quest");
      quests.push(questSchema.parse({ ...planQuest, id: questId, bossId: boss.id, status: QuestStatus.READY, order, createdAt: now, updatedAt: now }));
      planQuest.subquests.forEach((subquest, subOrder) => subquests.push({
        id: createId("subquest"), questId, title: subquest.title, estimatedMinutes: subquest.estimatedMinutes, status: QuestStatus.READY, order: subOrder,
      }));
    });
    await this.db.transaction("rw", this.db.quests, this.db.subquests, async () => {
      for (const quest of uncleared) await this.db.subquests.where("questId").equals(quest.id).delete();
      await this.db.quests.bulkDelete(uncleared.map((quest) => quest.id));
      await this.db.quests.bulkAdd(quests);
      if (subquests.length) await this.db.subquests.bulkAdd(subquests);
    });
  }

  async completeQuest(id: string, sessionId: string): Promise<CompletionOutcome> {
    return this.db.transaction(
      "rw",
      [this.db.goals, this.db.bosses, this.db.quests, this.db.completionEvents, this.db.clearTitles, this.db.settings],
      async () => {
        const quest = await this.db.quests.get(id);
        if (!quest || quest.status === QuestStatus.CLEARED) throw new Error("QUEST_NOT_CLEARABLE");
        const boss = await this.db.bosses.get(quest.bossId);
        if (!boss) throw new Error("NO_ACTIVE_BOSS");
        const goal = await this.db.goals.get(boss.goalId);
        if (!goal) throw new Error("NO_ACTIVE_GOAL");
        const previousSettings = (await this.db.settings.get("app")) ?? { ...DEFAULT_SETTINGS, updatedAt: new Date().toISOString() };
        const combo = previousSettings.smashSessionId === sessionId ? previousSettings.currentCombo + 1 : 1;
        const xp = calculateXp(combo);
        const completedAt = new Date().toISOString();
        const currentHp = applyDamage(boss.currentHp, quest.damage);
        const updatedBoss = bossSchema.parse({ ...boss, currentHp, updatedAt: completedAt, completedAt: currentHp === 0 ? completedAt : undefined });
        const totalClears = await this.db.completionEvents.count() + 1;
        const unlockedCodes = (await this.db.clearTitles.toArray()).map((title) => title.code);
        const title = unlockTitle({ totalClears, combo, difficulty: quest.difficulty, bossDefeated: currentHp === 0, unlockedCodes, completedAt });
        const event: CompletionEvent = {
          id: createId("clear"),
          goalId: goal.id,
          bossId: boss.id,
          questId: quest.id,
          questTitle: quest.title,
          damage: Math.min(quest.damage, boss.currentHp),
          xp,
          combo,
          titleUnlocked: title?.code,
          estimatedMinutes: quest.estimatedMinutes,
          completedAt,
        };
        const totalXp = previousSettings.xp + xp;
        const settings = settingsSchema.parse({
          ...previousSettings,
          xp: totalXp,
          level: levelFromXp(totalXp),
          currentCombo: combo,
          maxCombo: Math.max(previousSettings.maxCombo, combo),
          smashSessionId: sessionId,
          updatedAt: completedAt,
        });
        await this.db.quests.update(quest.id, { status: QuestStatus.CLEARED, completedAt, updatedAt: completedAt });
        await this.db.bosses.put(updatedBoss);
        await this.db.completionEvents.add(event);
        await this.db.settings.put(settings);
        if (title) await this.db.clearTitles.add(title);
        if (currentHp === 0) await this.db.goals.update(goal.id, { status: GoalStatus.COMPLETED, completedAt, updatedAt: completedAt });
        return { event, title, boss: updatedBoss, settings };
      },
    );
  }

  async saveDailyReview(review: DailyReview): Promise<void> {
    await this.db.dailyReviews.put(review);
  }

  async updateSettings(patch: Partial<Pick<AppSettings, "aiMode" | "animationsEnabled" | "reducedEffects">>): Promise<void> {
    const previous = (await this.db.settings.get("app")) ?? DEFAULT_SETTINGS;
    await this.db.settings.put(settingsSchema.parse({ ...previous, ...patch, updatedAt: new Date().toISOString() }));
  }

  async exportData(): Promise<ExportDocument> {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        goals: await this.db.goals.toArray(),
        bosses: await this.db.bosses.toArray(),
        quests: await this.db.quests.toArray(),
        subquests: await this.db.subquests.toArray(),
        completionEvents: await this.db.completionEvents.toArray(),
        dailyReviews: await this.db.dailyReviews.toArray(),
        clearTitles: await this.db.clearTitles.toArray(),
        settings: await this.db.settings.toArray(),
      },
    };
  }

  async importData(value: unknown): Promise<void> {
    const document = importDocumentSchema.parse(value) as ExportDocument;
    await this.db.transaction("rw", this.db.tables, async () => {
      await Promise.all(this.db.tables.map((table) => table.clear()));
      await this.db.goals.bulkAdd(document.data.goals);
      await this.db.bosses.bulkAdd(document.data.bosses);
      await this.db.quests.bulkAdd(document.data.quests);
      await this.db.subquests.bulkAdd(document.data.subquests);
      await this.db.completionEvents.bulkAdd(document.data.completionEvents);
      await this.db.dailyReviews.bulkAdd(document.data.dailyReviews);
      await this.db.clearTitles.bulkAdd(document.data.clearTitles);
      await this.db.settings.bulkAdd(document.data.settings);
    });
  }

  async reset(): Promise<void> {
    await this.db.transaction("rw", this.db.tables, async () => {
      await Promise.all(this.db.tables.map((table) => table.clear()));
    });
  }
}
