"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/frontend/components/layout/app-shell";
import { BossGauge } from "@/frontend/features/boss/components/boss-gauge";
import { DigitalCrumple } from "@/frontend/features/gamification/components/digital-crumple";
import { DifficultyBadge } from "@/frontend/features/quests/components/difficulty-badge";
import { Button } from "@/frontend/components/ui/button";
import { Modal } from "@/frontend/components/ui/modal";
import { SystemState } from "@/frontend/components/ui/system-state";
import { useQlear } from "@/frontend/stores/app-provider";
import { MockAiPlanner } from "@/backend/ai/providers/mock";
import { useUiStore } from "@/frontend/stores/ui-store";
import { QuestStatus, type Quest } from "@/shared/types/domain";

function momentumScore(quest: Quest): number {
  const difficultyWeight = { EASY: 0, NORMAL: 8, HARD: 18, BOSS: 28 }[quest.difficulty];
  const scheduleWeight = quest.scheduledFor && quest.scheduledFor <= new Date().toISOString().slice(0,10) ? -10 : 0;
  return quest.estimatedMinutes + difficultyWeight - quest.priority * 5 + scheduleWeight;
}

export default function SmashPage() {
  const router = useRouter();
  const { snapshot, updateQuest, completeQuest } = useQlear();
  const selectedQuestId = useUiStore((state) => state.selectedQuestId);
  const selectQuest = useUiStore((state) => state.selectQuest);
  const sessionId = useUiStore((state) => state.smashSessionId);
  const completion = useUiStore((state) => state.completion);
  const setCompletion = useUiStore((state) => state.setCompletion);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [routeAlternatives, setRouteAlternatives] = useState<Array<{ title: string; description: string; estimatedMinutes: number; reason: string }>>([]);
  const [previousQuest, setPreviousQuest] = useState<Quest>();
  const [feedback, setFeedback] = useState<string>();
  const [clearing, setClearing] = useState(false);
  const active = useMemo(() => snapshot?.quests.filter((quest) => quest.status !== QuestStatus.CLEARED).sort((a,b) => momentumScore(a) - momentumScore(b)) ?? [], [snapshot]);
  const quest = active.find((item) => item.id === selectedQuestId) ?? active[0];
  useEffect(() => { if (quest && quest.id !== selectedQuestId) selectQuest(quest.id); }, [quest, selectedQuestId, selectQuest]);
  if (!snapshot?.goal || !snapshot.boss) return <AppShell title="SMASH MODE"><SystemState code="NO ACTIVE GOAL" message="CREATE A TARGET TO BEGIN." actionHref="/setup" actionLabel="目標を作る" /></AppShell>;
  if (!quest) return <AppShell title="SMASH MODE"><SystemState code="ROUTE CLEARED" message="NEXT ROUTE IS READY TO BE PLANNED." actionHref="/dashboard" actionLabel="COMMANDへ戻る" /></AppShell>;
  const subquests = snapshot.subquests.filter((item) => item.questId === quest.id);
  const clear = async () => {
    setClearing(true);
    try { const result = await completeQuest(quest.id, sessionId); setCompletion(result); setFeedback(result.boss.currentHp === 0 ? "BOSS HPを削り切った。GOAL CLEAR。" : result.event.combo >= 3 ? `ここまで${result.event.combo}連続CLEAR。` : `いい流れ。次は${active[1]?.estimatedMinutes ?? 15}分で終わる。`); }
    finally { setClearing(false); }
  };
  const simplerRoute = async () => { const result = await new MockAiPlanner().suggestAlternatives(quest); setRouteAlternatives(result.alternatives); };
  return <AppShell title="SMASH MODE" eyebrow="ONE TARGET // ZERO NOISE">
    <div className="smash-layout">
      <section className="smash-main">
        <div className="smash-progress"><span>QUEST {String(snapshot.quests.findIndex((item) => item.id === quest.id) + 1).padStart(2,"0")} / {String(snapshot.quests.length).padStart(2,"0")}</span><i /></div>
        <div className="smash-target">
          <div className="smash-target__meta"><DifficultyBadge difficulty={quest.difficulty} /><span>{quest.estimatedMinutes} MIN</span><span>DAMAGE {quest.damage}</span></div>
          <h2>{quest.title}</h2><p>{quest.description}</p>
          {subquests.length > 0 && <div className="smash-subquests"><span className="system-label">EXECUTION UNITS</span>{subquests.map((item,index) => <div key={item.id}><span>{String(index+1).padStart(2,"0")}</span><p>{item.title}</p><small>{item.estimatedMinutes ? `${item.estimatedMinutes} MIN` : ""}</small></div>)}</div>}
          {feedback && <div className="ai-feedback">AI // {feedback}</div>}
          {previousQuest && <div className="undo-route"><span>別ルートへ変更しました。</span><Button variant="ghost" size="small" onClick={async () => { await updateQuest(previousQuest); setPreviousQuest(undefined); }}>UNDO</Button></div>}
        </div>
        <div className="smash-actions"><Button className="clear-button" size="large" disabled={clearing} onClick={() => void clear()}><span className="clear-button__check">✓</span>{clearing ? "CLEARING..." : "CLEAR"}</Button><div><Button variant="secondary" onClick={() => setShowAlternatives(true)}>別候補を見る</Button><Button variant="ghost" onClick={() => void simplerRoute()}>別ルート</Button><Button variant="ghost" onClick={() => router.push("/quests")}>ボードから選ぶ</Button></div></div>
      </section>
      <aside className="smash-side"><BossGauge boss={snapshot.boss} compact pulse={Boolean(completion)} /><div className="smash-note"><span className="system-label">AI REASON</span><p>{quest.aiReason}</p></div><div className="smash-session"><div><span>SESSION COMBO</span><strong>×{snapshot.settings.currentCombo}</strong></div><div><span>TOTAL XP</span><strong>{snapshot.settings.xp}</strong></div></div></aside>
    </div>
    {showAlternatives && <Modal title="ALTERNATIVE TARGETS // 最大3候補" onClose={() => setShowAlternatives(false)}><div className="alternative-list">{active.slice(0,3).map((item,index) => <button key={item.id} className={item.id === quest.id ? "is-current" : ""} onClick={() => { selectQuest(item.id); setShowAlternatives(false); }}><span>0{index+1}</span><strong>{item.title}</strong><small>{item.estimatedMinutes} MIN // {item.damage} DMG</small></button>)}</div></Modal>}
    {routeAlternatives.length > 0 && <Modal title="別ルート // SMALLER STEP" onClose={() => setRouteAlternatives([])}><div className="route-alternatives">{routeAlternatives.map((item,index) => <button key={item.title} onClick={async () => { setPreviousQuest(quest); await updateQuest({ ...quest, title: item.title, description: item.description, estimatedMinutes: item.estimatedMinutes, source: "ALTERNATIVE", aiReason: item.reason }); setRouteAlternatives([]); }}><span>ROUTE 0{index+1}</span><strong>{item.title}</strong><p>{item.description}</p><small>{item.estimatedMinutes} MIN // {item.reason}</small></button>)}</div></Modal>}
    {completion && <DigitalCrumple outcome={completion} reduced={!snapshot.settings.animationsEnabled || snapshot.settings.reducedEffects} onDone={() => { setCompletion(undefined); selectQuest(undefined); }} />}
  </AppShell>;
}
