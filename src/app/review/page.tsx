"use client";

import { useEffect, useMemo } from "react";
import { AppShell } from "@/frontend/components/layout/app-shell";
import { Panel } from "@/frontend/components/ui/panel";
import { SystemState } from "@/frontend/components/ui/system-state";
import { useQlear } from "@/frontend/stores/app-provider";
import { localDateKey } from "@/shared/utils/dates";
import { createId } from "@/shared/utils/identifiers";
import { Rarity, QuestStatus, type DailyReview } from "@/shared/types/domain";

export default function ReviewPage() {
  const { snapshot, saveDailyReview } = useQlear();
  const today = localDateKey();
  const metrics = useMemo(() => {
    const events = snapshot?.completionEvents.filter((event) => event.completedAt.startsWith(today)) ?? [];
    const boss = snapshot?.boss;
    return {
      events,
      clearCount: events.length,
      damage: events.reduce((sum,event) => sum + event.damage,0),
      xp: events.reduce((sum,event) => sum + event.xp,0),
      maxCombo: Math.max(0,...events.map((event) => event.combo)),
      estimatedMinutes: events.reduce((sum,event) => sum + event.estimatedMinutes,0),
      bossProgress: boss ? Math.round(((boss.maxHp - boss.currentHp) / boss.maxHp) * 100) : 0,
    };
  }, [snapshot, today]);
  const nextQuest = snapshot?.quests.find((quest) => quest.status !== QuestStatus.CLEARED);
  const reviewText = metrics.clearCount >= 3 ? "今日は小さいタスクから勢いを作れた。" : metrics.clearCount > 0 ? "一つのCLEARで、目標を確実に前へ進めた。" : "次の一手を選べる状態まで整っている。";
  const nextText = nextQuest ? `次は「${nextQuest.title}」から始める。` : "作戦を組み直し、次の3件を選ぶ。";

  useEffect(() => {
    if (!snapshot?.goal) return;
    const existing = snapshot.dailyReviews.find((review) => review.date === today);
    const signature = [metrics.clearCount,metrics.damage,metrics.xp,metrics.maxCombo,metrics.estimatedMinutes,metrics.bossProgress].join(":");
    const existingSignature = existing ? [existing.clearCount,existing.damage,existing.xp,existing.maxCombo,existing.estimatedMinutes,existing.bossProgress].join(":") : "";
    if (signature === existingSignature) return;
    const now = new Date().toISOString();
    const review: DailyReview = {
      id: existing?.id ?? createId("review"),
      date: today,
      clearCount: metrics.clearCount,
      damage: metrics.damage,
      xp: metrics.xp,
      maxCombo: metrics.maxCombo,
      estimatedMinutes: metrics.estimatedMinutes,
      bossProgress: metrics.bossProgress,
      aiReview: reviewText,
      next: nextText,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    void saveDailyReview(review);
  }, [snapshot, today, metrics, reviewText, nextText, saveDailyReview]);

  if (!snapshot?.goal || !snapshot.boss) return <AppShell title="TODAY REPORT"><SystemState code="NO REVIEW DATA" message="CLEAR A QUEST TO CREATE A REPORT." actionHref="/setup" actionLabel="目標を作る" /></AppShell>;
  return <AppShell title="TODAY REPORT" eyebrow={`${today} // DAILY REVIEW`}>
    <div className="review-grid">
      <section className="report-hero"><div><span className="system-label">TODAY // {new Date().toLocaleDateString("ja-JP", { weekday: "long" })}</span><h2>{metrics.clearCount > 0 ? `${metrics.clearCount} QUEST${metrics.clearCount === 1 ? "" : "S"} CLEARED.` : "ROUTE READY."}</h2><p>{snapshot.goal.title}</p></div><div className="report-grade"><span>BOSS</span><strong>{metrics.bossProgress}%</strong></div></section>
      <div className="metric-grid">
        {[['CLEAR',metrics.clearCount],['DAMAGE',metrics.damage],['XP',metrics.xp],['COMBO MAX',`×${metrics.maxCombo}`],['TIME CLEARED',`${metrics.estimatedMinutes}m`]].map(([label,value]) => <Panel key={label} className="metric-card"><span>{label}</span><strong>{value}</strong><i /></Panel>)}
      </div>
      <Panel label="AI REVIEW" accent="signal" className="review-copy"><div><span>REVIEW</span><p>「{reviewText}」</p></div><div><span>NEXT</span><p>「{nextText}」</p></div></Panel>
      <Panel label="COMPLETION HISTORY" className="history-panel"><div className="history-list">{snapshot.completionEvents.map((event) => <article key={event.id}><time>{new Intl.DateTimeFormat("ja-JP", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(event.completedAt))}</time><div><strong>{event.questTitle}</strong><span>QUEST CLEAR</span></div><div><span>-{event.damage} DMG</span><span>+{event.xp} XP</span><span>×{event.combo}</span></div></article>)}{snapshot.completionEvents.length === 0 && <div className="history-empty">NO COMPLETION EVENTS // 最初のCLEARがここに記録されます。</div>}</div></Panel>
      <Panel label="CLEAR ARCHIVE" className="archive-panel"><div className="title-archive">{snapshot.titles.map((title) => <article key={title.id} className={`rarity--${title.rarity.toLowerCase()}`}><span>{title.rarity}</span><strong>{title.name}</strong><p>{title.description}</p><time>{new Date(title.unlockedAt).toLocaleDateString("ja-JP")}</time></article>)}{snapshot.titles.length === 0 && <div className="archive-locked"><span>◇</span><p>最初のQuestをCLEARすると、TITLEが解除されます。</p></div>}{snapshot.titles.length > 0 && Object.values(Rarity).filter((rarity) => !snapshot.titles.some((title) => title.rarity === rarity)).slice(0,2).map((rarity) => <article key={rarity} className="title-locked"><span>{rarity}</span><strong>LOCKED</strong><p>条件はまだ非公開</p></article>)}</div></Panel>
    </div>
  </AppShell>;
}
