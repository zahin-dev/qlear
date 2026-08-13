import { NextResponse } from "next/server";
import { MockAiPlanner } from "@/backend/ai/providers/mock";
import { OpenAiPlanner } from "@/backend/ai/providers/openai";
import { goalInputSchema, planResultSchema } from "@/shared/validation/schemas";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const input = goalInputSchema.parse(await request.json());
    const planner = process.env.AI_PROVIDER?.toLowerCase() === "openai" ? new OpenAiPlanner() : new MockAiPlanner();
    const plan = planResultSchema.parse(await planner.createPlan(input));
    return NextResponse.json(plan);
  } catch {
    return NextResponse.json({ error: "PLAN_INPUT_INVALID" }, { status: 400 });
  }
}
