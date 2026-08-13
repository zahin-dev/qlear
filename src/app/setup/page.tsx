"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/frontend/components/brand/logo";
import { Button } from "@/frontend/components/ui/button";
import { PlanEditor } from "@/frontend/features/planning/components/plan-editor";
import { useQlear } from "@/frontend/stores/app-provider";
import { requestPlan } from "@/backend/ai/client";
import { goalInputSchema } from "@/shared/validation/schemas";
import type { Energy, GoalInput, PlanResult } from "@/shared/types/domain";

const ANALYSIS_STEPS = ["ANALYZING GOAL...", "ESTIMATING SCOPE...", "BUILDING BOSS...", "GENERATING 3 QUESTS...", "SETTING ROUTE...", "READY."];

export default function SetupPage() {
  const router = useRouter();
  const { savePlan, snapshot } = useQlear();
  const [form, setForm] = useState<GoalInput>({ title: "", energy: "NORMAL" });
  const [stage, setStage] = useState<"input" | "loading" | "ready">("input");
  const [analysisStep, setAnalysisStep] = useState(0);
  const [plan, setPlan] = useState<PlanResult>();
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const createPlan = async () => {
    const parsed = goalInputSchema.safeParse({ ...form, availableMinutesPerDay: form.availableMinutesPerDay || undefined });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "入力を確認してください"); return; }
    setError(undefined); setStage("loading"); setAnalysisStep(0);
    const delay = process.env.NEXT_PUBLIC_FAST_MODE === "true" ? 8 : 180;
    const progress = window.setInterval(() => setAnalysisStep((current) => Math.min(current + 1, ANALYSIS_STEPS.length - 1)), delay);
    try {
      const result = await requestPlan(parsed.data);
      await new Promise((resolve) => window.setTimeout(resolve, delay * 5));
      setAnalysisStep(5); setPlan(result); setStage("ready");
    } catch { setError("PLANを生成できませんでした。もう一度試してください。"); setStage("input"); }
    finally { window.clearInterval(progress); }
  };

  const confirm = async () => {
    if (!plan) return;
    setSaving(true);
    try { await savePlan(form, plan); router.push("/dashboard"); }
    catch { setError("LOCAL DATAへ保存できませんでした。"); setSaving(false); }
  };

  return (
    <main id="main-content" className="setup-page">
      <header className="setup-header"><Logo /><div>{snapshot?.goal && <Link href="/dashboard">COMMANDへ戻る</Link>}<span className="status-dot">LOCAL MODE</span></div></header>
      {stage === "input" && <section className="setup-terminal">
        <div className="setup-terminal__index"><span>NEW MISSION</span><strong>01</strong><i /></div>
        <div className="setup-terminal__form">
          <span className="system-label">GOAL INPUT // COMMAND TERMINAL</span>
          <h1>何を終わらせたい？</h1>
          <p>大きくても、まだ曖昧でも大丈夫。AIが次の3つへ分解します。</p>
          <label className="goal-input"><span className="sr-only">終わらせたい目標</span><textarea autoFocus rows={4} placeholder="9月までにポートフォリオを完成させる" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
          <div className="setup-options">
            <label className="field"><span>TARGET DATE // OPTIONAL</span><input type="date" value={form.targetDate ?? ""} onChange={(event) => setForm({ ...form, targetDate: event.target.value || undefined })} /></label>
            <label className="field"><span>DAILY TIME // OPTIONAL</span><select value={form.availableMinutesPerDay ?? ""} onChange={(event) => setForm({ ...form, availableMinutesPerDay: event.target.value ? Number(event.target.value) : undefined })}><option value="">AIに任せる</option><option value="15">15 MIN</option><option value="30">30 MIN</option><option value="45">45 MIN</option><option value="60">60 MIN</option><option value="90">90 MIN</option><option value="120">120 MIN</option></select></label>
            <fieldset className="energy-select"><legend>ENERGY // OPTIONAL</legend><div>{(["LOW","NORMAL","HIGH"] as Energy[]).map((energy) => <button type="button" key={energy} className={form.energy === energy ? "is-active" : ""} onClick={() => setForm({ ...form, energy })}>{energy}</button>)}</div></fieldset>
          </div>
          {error && <p className="form-error" role="alert">ERR // {error}</p>}
          <div className="setup-terminal__action"><small>入力内容はこの端末内に保存されます。</small><Button size="large" onClick={() => void createPlan()}>攻略プランを作る <span>→</span></Button></div>
        </div>
      </section>}
      {stage === "loading" && <section className="analysis-screen" aria-live="polite">
        <div className="analysis-screen__grid" aria-hidden="true">{Array.from({ length: 48 }, (_, index) => <i key={index} className={index <= analysisStep * 8 ? "is-on" : ""} />)}</div>
        <div><span className="system-label">AI QUEST DIRECTOR</span><h1>{ANALYSIS_STEPS[analysisStep]}</h1><ol>{ANALYSIS_STEPS.map((step, index) => <li key={step} className={index < analysisStep ? "is-done" : index === analysisStep ? "is-active" : ""}><span>{index < analysisStep ? "✓" : String(index + 1).padStart(2,"0")}</span>{step}</li>)}</ol></div>
      </section>}
      {stage === "ready" && plan && <section className="setup-plan"><button className="back-link" onClick={() => setStage("input")}>← INPUTへ戻る</button>{error && <p className="form-error" role="alert">ERR // {error}</p>}<PlanEditor plan={plan} onChange={setPlan} onConfirm={() => void confirm()} busy={saving} /></section>}
    </main>
  );
}
