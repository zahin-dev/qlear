"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/frontend/components/layout/app-shell";
import { BossGauge } from "@/frontend/features/boss/components/boss-gauge";
import { QuestCard } from "@/frontend/features/quests/components/quest-card";
import { Button } from "@/frontend/components/ui/button";
import { Modal } from "@/frontend/components/ui/modal";
import { Panel } from "@/frontend/components/ui/panel";
import { SystemState } from "@/frontend/components/ui/system-state";
import { PlanEditor } from "@/frontend/features/planning/components/plan-editor";
import { useQlear } from "@/frontend/stores/app-provider";
import { MockAiPlanner } from "@/backend/ai/providers/mock";
import { formatShortDate, localDateKey } from "@/shared/utils/dates";
import { useUiStore } from "@/frontend/stores/ui-store";
import { GoalStatus, QuestStatus, type PlanResult } from "@/shared/types/domain";

export default function DashboardPage() {
  const router = useRouter();
  const { snapshot, replaceRoute } = useQlear();
  const selectQuest = useUiStore((state) => state.selectQuest);
  const [replan, setReplan] = useState<PlanResult>();
  const [planning, setPlanning] = useState(false);
  const [saving, setSaving] = useState(false);
  if (!snapshot?.goal || !snapshot.boss) return <AppShell title="COMMAND CENTER"><SystemState code="NO ACTIVE GOAL" message="CREATE A TARGET TO BEGIN." actionHref="/setup" actionLabel="目標を作る" /></AppShell>;
  const { goal, boss } = snapshot;
  const active = snapshot.quests.filter((quest) => quest.status !== QuestStatus.CLEARED).slice(0,3);
  const todayDamage = snapshot.completionEvents.filter((event) => event.completedAt.startsWith(localDateKey())).reduce((sum,event) => sum + event.damage,0);
  const recommended = [...active].sort((a,b) => (a.estimatedMinutes + a.priority * -8) - (b.estimatedMinutes + b.priority * -8))[0];
  const startSmash = (id: string) => { selectQuest(id); router.push("/smash"); };
  const generateReplan = async () => {
    setPlanning(true);
    const result = await new MockAiPlanner().replan({ goal: { title: goal.title, description: goal.description, targetDate: goal.targetDate, availableMinutesPerDay: goal.availableMinutesPerDay, energy: goal.energy }, remainingBossHp: boss.currentHp, completedTitles: snapshot.completionEvents.map((event) => event.questTitle), activeQuests: active });
    setReplan(result); setPlanning(false);
  };

  return <AppShell title="COMMAND CENTER" actions={<Button variant="secondary" size="small" disabled={planning || goal.status === GoalStatus.COMPLETED} onClick={() => void generateReplan()}>{planning ? "REPLANNING..." : "作戦を組み直す"}</Button>}>
    <div className="dashboard-grid">
      <section className="active-goal-strip"><div><span className="system-label">ACTIVE GOAL // 01</span><h2>{goal.title}</h2></div><div><span>TARGET</span><strong>{formatShortDate(goal.targetDate)}</strong></div><div><span>DAILY</span><strong>{goal.availableMinutesPerDay ? `${goal.availableMinutesPerDay} MIN` : "45 MIN"}</strong></div><div><span>ENERGY</span><strong>{goal.energy}</strong></div></section>
      <Panel label="PRIMARY TARGET" accent="rust" className="dashboard-boss"><BossGauge boss={boss} /><div className="boss-stats"><div><span>TODAY DAMAGE</span><strong>{todayDamage}</strong></div><div><span>PROJECTED CLEAR</span><strong>{formatShortDate(goal.targetDate ?? active.at(-1)?.scheduledFor)}</strong></div><div><span>COMBO MAX</span><strong>×{snapshot.settings.maxCombo}</strong></div></div></Panel>
      <Panel label="TACTICAL STATUS" accent="signal" className="tactical-panel"><div className="momentum"><span>MOMENTUM</span><strong>{snapshot.settings.currentCombo >= 2 ? "HIGH" : "READY"}</strong></div><div className="tactical-panel__focus"><span>RECOMMENDED</span><strong>{recommended ? `QUEST ${String(recommended.order + 1).padStart(2,"0")}` : "ROUTE CLEAR"}</strong><p>{recommended?.aiReason ?? "次の作戦を組み直せます。"}</p></div><dl><div><dt>SCHEDULE</dt><dd>{goal.targetDate ? "ON TRACK" : "OPEN ROUTE"}</dd></div><div><dt>AI MODE</dt><dd>{snapshot.settings.aiMode}</dd></div><div><dt>LOCAL DATA</dt><dd>SYNCED</dd></div></dl></Panel>
      <section className="next-quests"><header><div><span className="system-label">ACTIVE ROUTE</span><h2>NEXT 3 QUESTS</h2></div><span>{active.length} / 3 READY</span></header><div className="next-quests__list">{active.map((quest,index) => <QuestCard key={quest.id} quest={quest} index={index} subquests={snapshot.subquests.filter((item) => item.questId === quest.id)} onSmash={() => startSmash(quest.id)} />)}{Array.from({ length: Math.max(0,3-active.length) },(_,index) => <div key={index} className="empty-quest-slot"><span>0{active.length + index + 1}</span><p>{goal.status === GoalStatus.COMPLETED ? "GOAL CLEAR" : "CLEAR後、作戦を組み直してください"}</p></div>)}</div></section>
    </div>
    {replan && <Modal title="REPLAN // 次の3 QUEST" onClose={() => setReplan(undefined)} wide><PlanEditor plan={replan} onChange={setReplan} confirmLabel="新しい作戦を反映" busy={saving} onConfirm={async () => { setSaving(true); await replaceRoute(replan); setReplan(undefined); setSaving(false); }} /></Modal>}
  </AppShell>;
}
