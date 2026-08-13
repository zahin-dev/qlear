import "server-only";
import OpenAI from "openai";
import type { AiPlanner, AlternativeResult, DailyReviewResult, DifficultyInput, ReplanInput } from "@/backend/ai/contracts";
import { MockAiPlanner } from "@/backend/ai/providers/mock";
import { planResultSchema } from "@/shared/validation/schemas";
import type { AppSnapshot, Difficulty, GoalInput, PlanResult, Quest } from "@/shared/types/domain";

const PLAN_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["scopeLevel", "bossTitle", "maxHp", "quests", "summary"],
  properties: {
    scopeLevel: { type: "integer", minimum: 1, maximum: 5 },
    bossTitle: { type: "string" },
    maxHp: { type: "integer", enum: [100, 200, 300, 500, 800] },
    quests: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "description", "difficulty", "estimatedMinutes", "priority", "damage", "scheduledFor", "dueAt", "source", "aiReason", "subquests"],
        properties: {
          title: { type: "string" }, description: { type: "string" }, difficulty: { type: "string", enum: ["EASY", "NORMAL", "HARD", "BOSS"] },
          estimatedMinutes: { type: "integer", minimum: 1 }, priority: { type: "integer", minimum: 1, maximum: 5 }, damage: { type: "integer", minimum: 1 },
          scheduledFor: { type: "string" }, dueAt: { type: "string" }, source: { type: "string", enum: ["AI"] }, aiReason: { type: "string" },
          subquests: { type: "array", maxItems: 3, items: { type: "object", additionalProperties: false, required: ["title", "estimatedMinutes"], properties: { title: { type: "string" }, estimatedMinutes: { type: "integer" } } } },
        },
      },
    },
    summary: { type: "string" },
  },
} as const;

export class OpenAiPlanner implements AiPlanner {
  private readonly fallback = new MockAiPlanner();

  async createPlan(input: GoalInput): Promise<PlanResult> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return this.fallback.createPlan(input);
    try {
      const client = new OpenAI({ apiKey });
      const response = await client.responses.create({
        model: process.env.OPENAI_MODEL ?? "gpt-5-mini",
        instructions: "You are QLEAR's planning engine. Return exactly three concrete, editable quests in Japanese. Never use chatty prose.",
        input: JSON.stringify(input),
        text: { format: { type: "json_schema", name: "qlear_plan", strict: true, schema: PLAN_JSON_SCHEMA } },
      });
      return planResultSchema.parse(JSON.parse(response.output_text)) as PlanResult;
    } catch {
      return this.fallback.createPlan(input);
    }
  }

  estimateDifficulty(input: DifficultyInput): Promise<Difficulty> { return this.fallback.estimateDifficulty(input); }
  replan(input: ReplanInput): Promise<PlanResult> { return this.fallback.replan(input); }
  suggestAlternatives(quest: Quest): Promise<AlternativeResult> { return this.fallback.suggestAlternatives(quest); }
  createDailyReview(snapshot: AppSnapshot): Promise<DailyReviewResult> { return this.fallback.createDailyReview(snapshot); }
}
