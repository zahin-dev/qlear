"use client";

import { Button } from "@/frontend/components/ui/button";
import { Panel } from "@/frontend/components/ui/panel";
import { DAMAGE_BY_DIFFICULTY } from "@/shared/domain/gamification/core";
import { Difficulty, type PlanResult } from "@/shared/types/domain";

export function PlanEditor({ plan, onChange, onConfirm, busy = false, confirmLabel = "この作戦で始める" }: {
  plan: PlanResult;
  onChange: (plan: PlanResult) => void;
  onConfirm: () => void;
  busy?: boolean;
  confirmLabel?: string;
}) {
  const updateQuest = (index: number, patch: Partial<PlanResult["quests"][number]>) => {
    const quests = [...plan.quests] as PlanResult["quests"];
    const current = quests[index];
    if (!current) return;
    quests[index] = { ...current, ...patch };
    onChange({ ...plan, quests });
  };
  return (
    <div className="plan-ready">
      <div className="plan-ready__heading"><span className="system-label">PLAN READY // EDITABLE</span><h2>攻略ルートを確認</h2><p>{plan.summary}</p></div>
      <Panel label="BOSS CONFIG" accent="rust" className="boss-config">
        <label className="field"><span>BOSS NAME</span><input value={plan.bossTitle} onChange={(event) => onChange({ ...plan, bossTitle: event.target.value })} /></label>
        <label className="field field--short"><span>MAX HP</span><input type="number" min="1" max="9999" value={plan.maxHp} onChange={(event) => onChange({ ...plan, maxHp: Math.max(1, Number(event.target.value)) })} /></label>
        <div className="scope-readout"><span>SCOPE</span><strong>0{plan.scopeLevel}</strong></div>
      </Panel>
      <div className="plan-quests">
        {plan.quests.map((quest, index) => (
          <Panel key={index} label={`QUEST 0${index + 1}`} accent={index === 0 ? "amber" : undefined} className="plan-quest">
            <label className="field"><span>TITLE</span><input value={quest.title} onChange={(event) => updateQuest(index, { title: event.target.value })} /></label>
            <label className="field"><span>DESCRIPTION</span><textarea rows={3} value={quest.description} onChange={(event) => updateQuest(index, { description: event.target.value })} /></label>
            <div className="field-grid field-grid--4">
              <label className="field"><span>DIFFICULTY</span><select value={quest.difficulty} onChange={(event) => { const difficulty = event.target.value as Difficulty; updateQuest(index, { difficulty, damage: DAMAGE_BY_DIFFICULTY[difficulty] }); }}>{Object.values(Difficulty).map((value) => <option key={value}>{value}</option>)}</select></label>
              <label className="field"><span>MIN</span><input type="number" min="1" value={quest.estimatedMinutes} onChange={(event) => updateQuest(index, { estimatedMinutes: Number(event.target.value) })} /></label>
              <label className="field"><span>DMG</span><input type="number" min="1" value={quest.damage} onChange={(event) => updateQuest(index, { damage: Number(event.target.value) })} /></label>
              <label className="field"><span>PRIORITY</span><input type="number" min="1" max="5" value={quest.priority} onChange={(event) => updateQuest(index, { priority: Number(event.target.value) })} /></label>
            </div>
            <label className="field"><span>SCHEDULE</span><input type="date" value={quest.scheduledFor ?? ""} onChange={(event) => updateQuest(index, { scheduledFor: event.target.value || undefined })} /></label>
          </Panel>
        ))}
      </div>
      <div className="plan-ready__action"><p><span aria-hidden="true">◆</span> AIの提案はすべて変更できます。</p><Button size="large" onClick={onConfirm} disabled={busy || plan.quests.some((quest) => !quest.title.trim())}>{busy ? "SAVING..." : confirmLabel} <span aria-hidden="true">→</span></Button></div>
    </div>
  );
}
