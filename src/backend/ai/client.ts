import { MockAiPlanner } from "@/backend/ai/providers/mock";
import { planResultSchema } from "@/shared/validation/schemas";
import type { GoalInput, PlanResult } from "@/shared/types/domain";

export async function requestPlan(input: GoalInput): Promise<PlanResult> {
  try {
    const response = await fetch("/api/ai/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) throw new Error("PLAN_REQUEST_FAILED");
    return planResultSchema.parse(await response.json()) as PlanResult;
  } catch {
    return new MockAiPlanner().createPlan(input);
  }
}
