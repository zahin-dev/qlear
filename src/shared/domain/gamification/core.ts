import { Difficulty, Rarity, type ClearTitle } from "@/shared/types/domain";
import { createId } from "@/shared/utils/identifiers";
import { clamp } from "@/shared/utils/numbers";

export const DAMAGE_BY_DIFFICULTY: Record<Difficulty, number> = {
  [Difficulty.EASY]: 8,
  [Difficulty.NORMAL]: 14,
  [Difficulty.HARD]: 22,
  [Difficulty.BOSS]: 35,
};

export function applyDamage(currentHp: number, damage: number): number {
  return clamp(currentHp - Math.max(0, damage), 0, currentHp);
}

export function calculateXp(combo: number): number {
  return 10 + Math.min(10, Math.max(0, combo) * 2);
}

export function levelFromXp(xp: number): number {
  if (xp < 100) return 1;
  if (xp < 250) return 2;
  if (xp < 450) return 3;
  let level = 4;
  let threshold = 450;
  let increment = 250;
  while (xp >= threshold + increment) {
    threshold += increment;
    increment += 50;
    level += 1;
  }
  return level;
}

export function levelProgress(xp: number): { level: number; current: number; required: number; percent: number } {
  const level = levelFromXp(xp);
  const thresholds = [0, 100, 250, 450];
  let start = thresholds[level - 1] ?? 450;
  let end = thresholds[level] ?? 700;
  if (level > 4) {
    start = 450;
    let increment = 250;
    for (let currentLevel = 4; currentLevel < level; currentLevel += 1) {
      start += increment;
      increment += 50;
    }
    end = start + increment;
  }
  const current = xp - start;
  const required = end - start;
  return { level, current, required, percent: Math.round((current / required) * 100) };
}

interface TitleContext {
  totalClears: number;
  combo: number;
  difficulty: Difficulty;
  bossDefeated: boolean;
  unlockedCodes: string[];
  completedAt: string;
}

const TITLE_RULES = [
  { code: "FIRST_STEP", name: "FIRST STEP", rarity: Rarity.COMMON, description: "最初のQuestをCLEARした", test: (c: TitleContext) => c.totalClears === 1 },
  { code: "FINAL_BLOW", name: "FINAL BLOW", rarity: Rarity.LEGENDARY, description: "BOSSの最後のHPを削り切った", test: (c: TitleContext) => c.bossDefeated },
  { code: "CHAIN_BREAKER", name: "CHAIN BREAKER", rarity: Rarity.EPIC, description: "COMBO ×5を達成した", test: (c: TitleContext) => c.combo >= 5 },
  { code: "HARD_CUT", name: "HARD CUT", rarity: Rarity.EPIC, description: "HARD以上のQuestをCLEARした", test: (c: TitleContext) => c.difficulty === Difficulty.HARD || c.difficulty === Difficulty.BOSS },
  { code: "MOMENTUM", name: "MOMENTUM", rarity: Rarity.RARE, description: "COMBO ×3を達成した", test: (c: TitleContext) => c.combo >= 3 },
] as const;

export function unlockTitle(context: TitleContext): ClearTitle | undefined {
  const rule = TITLE_RULES.find((candidate) => !context.unlockedCodes.includes(candidate.code) && candidate.test(context));
  if (!rule) return undefined;
  return {
    id: createId("title"),
    code: rule.code,
    name: rule.name,
    rarity: rule.rarity,
    description: rule.description,
    unlockedAt: context.completedAt,
  };
}
