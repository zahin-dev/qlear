import { afterEach, describe, expect, it } from "vitest";
import { QlearDatabase } from "@/backend/db/database";
import { LocalQlearRepository } from "@/backend/repositories/qlear-repository";
import { MockAiPlanner } from "@/backend/ai/providers/mock";

const databases: QlearDatabase[] = [];

afterEach(async () => {
  await Promise.all(databases.splice(0).map((database) => database.delete()));
});

describe("LocalQlearRepository", () => {
  it("persists a plan and transactionally completes a quest", async () => {
    const database = new QlearDatabase(`qlear-test-${crypto.randomUUID()}`);
    databases.push(database);
    const repository = new LocalQlearRepository(database);
    const input = { title: "個人Webサービスをリリースする", availableMinutesPerDay: 60, energy: "NORMAL" as const };
    const plan = await new MockAiPlanner().createPlan(input);
    await repository.savePlan(input, plan);
    const before = await repository.loadSnapshot();
    expect(before.quests).toHaveLength(3);
    expect(before.boss?.currentHp).toBe(plan.maxHp);
    const quest = before.quests[0];
    expect(quest).toBeDefined();
    const outcome = await repository.completeQuest(quest!.id, "session-1");
    const after = await repository.loadSnapshot();
    expect(after.completionEvents).toHaveLength(1);
    expect(after.boss?.currentHp).toBe(plan.maxHp - quest!.damage);
    expect(outcome.settings.xp).toBe(12);
    expect(outcome.title?.code).toBe("FIRST_STEP");
  });

  it("validates imports before clearing current data", async () => {
    const database = new QlearDatabase(`qlear-test-${crypto.randomUUID()}`);
    databases.push(database);
    const repository = new LocalQlearRepository(database);
    await expect(repository.importData({ nope: true })).rejects.toThrow();
    const snapshot = await repository.loadSnapshot();
    expect(snapshot.settings.schemaVersion).toBe(1);
  });
});
