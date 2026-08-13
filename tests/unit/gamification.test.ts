import { describe, expect, it } from "vitest";
import { applyDamage, calculateXp, levelFromXp, levelProgress, unlockTitle } from "@/shared/domain/gamification/core";
import { Difficulty, Rarity } from "@/shared/types/domain";

describe("gamification", () => {
  it("clamps Boss damage at zero", () => {
    expect(applyDamage(20, 8)).toBe(12);
    expect(applyDamage(5, 22)).toBe(0);
    expect(applyDamage(20, -5)).toBe(20);
  });

  it("caps combo XP bonus at ten", () => {
    expect(calculateXp(1)).toBe(12);
    expect(calculateXp(3)).toBe(16);
    expect(calculateXp(99)).toBe(20);
  });

  it("uses the documented level curve", () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(100)).toBe(2);
    expect(levelFromXp(250)).toBe(3);
    expect(levelFromXp(450)).toBe(4);
    expect(levelProgress(150)).toMatchObject({ level: 2, current: 50, required: 150 });
  });

  it("unlocks condition-based titles without mechanical effects", () => {
    const first = unlockTitle({ totalClears: 1, combo: 1, difficulty: Difficulty.EASY, bossDefeated: false, unlockedCodes: [], completedAt: new Date().toISOString() });
    expect(first).toMatchObject({ code: "FIRST_STEP", rarity: Rarity.COMMON });
    const momentum = unlockTitle({ totalClears: 3, combo: 3, difficulty: Difficulty.NORMAL, bossDefeated: false, unlockedCodes: ["FIRST_STEP"], completedAt: new Date().toISOString() });
    expect(momentum?.code).toBe("MOMENTUM");
    const final = unlockTitle({ totalClears: 9, combo: 2, difficulty: Difficulty.BOSS, bossDefeated: true, unlockedCodes: [], completedAt: new Date().toISOString() });
    expect(final).toMatchObject({ code: "FINAL_BLOW", rarity: Rarity.LEGENDARY });
  });
});
