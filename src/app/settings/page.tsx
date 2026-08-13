"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/frontend/components/layout/app-shell";
import { Button } from "@/frontend/components/ui/button";
import { Modal } from "@/frontend/components/ui/modal";
import { Panel } from "@/frontend/components/ui/panel";
import { SystemState } from "@/frontend/components/ui/system-state";
import { useQlear } from "@/frontend/stores/app-provider";
import { MockAiPlanner } from "@/backend/ai/providers/mock";
import type { Energy } from "@/shared/types/domain";

export default function SettingsPage() {
  const router = useRouter();
  const { snapshot, updateGoal, updateBossHp, updateSettings, exportData, importData, reset, savePlan } = useQlear();
  const importRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string>();
  const [confirmReset, setConfirmReset] = useState(false);
  const [goalDraft, setGoalDraft] = useState({ title: snapshot?.goal?.title ?? "", targetDate: snapshot?.goal?.targetDate ?? "", availableMinutesPerDay: snapshot?.goal?.availableMinutesPerDay ?? 45, energy: (snapshot?.goal?.energy ?? "NORMAL") as Energy });
  const [bossHp, setBossHp] = useState(snapshot?.boss?.maxHp ?? 300);

  useEffect(() => {
    const task = window.setTimeout(() => {
      if (snapshot?.goal) setGoalDraft({ title: snapshot.goal.title, targetDate: snapshot.goal.targetDate ?? "", availableMinutesPerDay: snapshot.goal.availableMinutesPerDay ?? 45, energy: snapshot.goal.energy });
      if (snapshot?.boss) setBossHp(snapshot.boss.maxHp);
    }, 0);
    return () => window.clearTimeout(task);
    // Rehydrate only when the active aggregate changes; settings refreshes must not overwrite in-progress edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot?.goal?.id, snapshot?.boss?.id]);

  if (!snapshot) return <AppShell title="SETTINGS"><SystemState code="SETTINGS UNAVAILABLE" message="LOCAL DATA IS INITIALIZING." /></AppShell>;
  const downloadExport = async () => {
    const exportDocument = await exportData();
    const url = URL.createObjectURL(new Blob([JSON.stringify(exportDocument,null,2)], { type: "application/json" }));
    const link = document.body.appendChild(document.createElement("a"));
    link.href = url; link.download = `qlear-export-${new Date().toISOString().slice(0,10)}.json`; link.click(); link.remove(); URL.revokeObjectURL(url); setStatus("EXPORT COMPLETE");
  };
  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    try { await importData(JSON.parse(await file.text()) as unknown); setStatus("IMPORT COMPLETE // VALID DATA RESTORED"); }
    catch { setStatus("IMPORT REJECTED // INVALID OR UNSUPPORTED DATA"); }
    finally { event.target.value = ""; }
  };
  const loadDemo = async () => {
    const input = { title: "個人Webサービスをリリースする", description: "小さくても実際に使えるサービスを公開する", targetDate: new Date(Date.now()+14*86400000).toISOString().slice(0,10), availableMinutesPerDay: 60, energy: "NORMAL" as const };
    const plan = await new MockAiPlanner().createPlan(input); await savePlan(input, { ...plan, scopeLevel: 3, maxHp: 300 }); router.push("/dashboard");
  };
  return <AppShell title="SETTINGS" eyebrow="LOCAL SYSTEM // USER CONTROL">
    <div className="settings-layout">
      {status && <div className="system-banner" role="status">{status}<button onClick={() => setStatus(undefined)}>×</button></div>}
      <Panel label="AI MODE" className="settings-section"><div className="settings-row"><div><h2>Quest Director</h2><p>APIキーがない場合もMock fallbackで全機能が動きます。</p></div><label className="field field--compact"><span>PROVIDER</span><select value={snapshot.settings.aiMode} onChange={(event) => void updateSettings({ aiMode: event.target.value as "MOCK" | "OPENAI" })}><option value="MOCK">MOCK</option><option value="OPENAI">OPENAI / FALLBACK</option></select></label></div></Panel>
      <Panel label="GOAL SETTINGS" className="settings-section"><div className="settings-form"><label className="field"><span>GOAL TITLE</span><input disabled={!snapshot.goal} value={goalDraft.title} onChange={(event) => setGoalDraft({ ...goalDraft, title: event.target.value })} /></label><div className="field-grid field-grid--4"><label className="field"><span>TARGET DATE</span><input type="date" disabled={!snapshot.goal} value={goalDraft.targetDate} onChange={(event) => setGoalDraft({ ...goalDraft, targetDate: event.target.value })} /></label><label className="field"><span>DAILY MIN</span><input type="number" min="5" max="720" disabled={!snapshot.goal} value={goalDraft.availableMinutesPerDay} onChange={(event) => setGoalDraft({ ...goalDraft, availableMinutesPerDay: Number(event.target.value) })} /></label><label className="field"><span>ENERGY</span><select disabled={!snapshot.goal} value={goalDraft.energy} onChange={(event) => setGoalDraft({ ...goalDraft, energy: event.target.value as Energy })}><option>LOW</option><option>NORMAL</option><option>HIGH</option></select></label><label className="field"><span>BOSS MAX HP</span><input type="number" min="1" max="9999" disabled={!snapshot.boss} value={bossHp} onChange={(event) => setBossHp(Number(event.target.value))} /></label></div><div className="settings-actions"><Button disabled={!snapshot.goal || !snapshot.boss} onClick={async () => { await updateGoal({ title: goalDraft.title, targetDate: goalDraft.targetDate || undefined, availableMinutesPerDay: goalDraft.availableMinutesPerDay, energy: goalDraft.energy }); await updateBossHp(bossHp); setStatus("GOAL SETTINGS SAVED"); }}>SAVE GOAL</Button></div></div></Panel>
      <Panel label="EFFECTS" className="settings-section"><div className="toggle-list"><label><span><strong>ANIMATION</strong><small>Digital CrumpleとDamage演出</small></span><input type="checkbox" checked={snapshot.settings.animationsEnabled} onChange={(event) => void updateSettings({ animationsEnabled: event.target.checked })} /><i /></label><label><span><strong>REDUCED EFFECTS</strong><small>完了演出を短い状態変化へ置換</small></span><input type="checkbox" checked={snapshot.settings.reducedEffects} onChange={(event) => void updateSettings({ reducedEffects: event.target.checked })} /><i /></label></div></Panel>
      <Panel label="DATA // LOCAL FIRST" className="settings-section"><div className="data-actions"><article><div><h2>EXPORT DATA</h2><p>全Goal、Quest、CLEAR履歴、設定をJSONへ保存。</p></div><Button variant="secondary" onClick={() => void downloadExport()}>EXPORT</Button></article><article><div><h2>IMPORT DATA</h2><p>Zod検証を通過したQLEAR exportだけを復元。</p></div><input className="sr-only" ref={importRef} type="file" accept="application/json" onChange={(event) => void importFile(event)} /><Button variant="secondary" onClick={() => importRef.current?.click()}>IMPORT</Button></article>{(process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_E2E_MODE === "true") && <article><div><h2>LOAD DEMO</h2><p>開発用のWebサービス公開Goalを作成。</p></div><Button variant="ghost" onClick={() => void loadDemo()}>LOAD DEMO</Button></article>}<article className="danger-zone"><div><h2>RESET ALL DATA</h2><p>この端末内のQLEARデータをすべて消去。</p></div><Button variant="danger" onClick={() => setConfirmReset(true)}>RESET</Button></article></div></Panel>
    </div>
    {confirmReset && <Modal title="RESET ALL DATA?" onClose={() => setConfirmReset(false)}><div className="reset-confirm"><p>Goal、Boss、Quest、CLEAR履歴、Title、設定がこの端末から削除されます。この操作はUNDOできません。</p><div><Button variant="ghost" onClick={() => setConfirmReset(false)}>CANCEL</Button><Button variant="danger" onClick={async () => { await reset(); setConfirmReset(false); router.push("/"); }}>RESET ALL DATA</Button></div></div></Modal>}
  </AppShell>;
}
