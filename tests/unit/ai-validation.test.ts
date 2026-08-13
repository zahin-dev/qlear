import { describe, expect, it } from "vitest";
import { MockAiPlanner } from "@/backend/ai/providers/mock";
import { bossSchema, goalInputSchema, importDocumentSchema, planResultSchema } from "@/shared/validation/schemas";

describe("MockAiPlanner", () => {
  it("returns the same exactly-three plan for the same goal", async () => {
    const planner = new MockAiPlanner();
    const input = { title: "資格試験に合格する", targetDate: "2026-10-01", availableMinutesPerDay: 45, energy: "NORMAL" as const };
    const first = await planner.createPlan(input);
    const second = await planner.createPlan(input);
    expect(first).toEqual(second);
    expect(first.quests).toHaveLength(3);
    expect(first.quests.every((quest) => quest.description.includes(input.title))).toBe(true);
    expect(planResultSchema.safeParse(first).success).toBe(true);
  });
});

describe("validation", () => {
  it("rejects short goals and invalid Boss HP", () => {
    expect(goalInputSchema.safeParse({ title: "x", energy: "NORMAL" }).success).toBe(false);
    expect(bossSchema.safeParse({ id: "b", goalId: "g", title: "Boss", scopeLevel: 1, maxHp: 100, currentHp: 101, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }).success).toBe(false);
  });

  it("rejects unversioned imports before persistence", () => {
    expect(importDocumentSchema.safeParse({ version: 99, data: {} }).success).toBe(false);
  });
});
