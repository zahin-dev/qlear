import Dexie, { type EntityTable } from "dexie";
import type { AppSettings, Boss, ClearTitle, CompletionEvent, DailyReview, Goal, Quest, Subquest } from "@/shared/types/domain";

export class QlearDatabase extends Dexie {
  goals!: EntityTable<Goal, "id">;
  bosses!: EntityTable<Boss, "id">;
  quests!: EntityTable<Quest, "id">;
  subquests!: EntityTable<Subquest, "id">;
  completionEvents!: EntityTable<CompletionEvent, "id">;
  dailyReviews!: EntityTable<DailyReview, "id">;
  clearTitles!: EntityTable<ClearTitle, "id">;
  settings!: EntityTable<AppSettings, "id">;

  constructor(name = "qlear") {
    super(name);
    this.version(1).stores({
      goals: "id, status, updatedAt",
      bosses: "id, goalId, updatedAt",
      quests: "id, bossId, status, scheduledFor, order, updatedAt",
      subquests: "id, questId, status, order",
      completionEvents: "id, goalId, bossId, questId, completedAt",
      dailyReviews: "id, date, updatedAt",
      clearTitles: "id, &code, rarity, unlockedAt",
      settings: "id, updatedAt",
    });
  }
}

let database: QlearDatabase | undefined;

export function getDatabase(): QlearDatabase {
  database ??= new QlearDatabase();
  return database;
}
