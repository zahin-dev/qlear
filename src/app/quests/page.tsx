"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/frontend/components/layout/app-shell";
import { QuestCard } from "@/frontend/features/quests/components/quest-card";
import { QuestEditor } from "@/frontend/features/quests/components/quest-editor";
import { Button } from "@/frontend/components/ui/button";
import { Modal } from "@/frontend/components/ui/modal";
import { SystemState } from "@/frontend/components/ui/system-state";
import { useQlear } from "@/frontend/stores/app-provider";
import { useUiStore } from "@/frontend/stores/ui-store";
import { QuestStatus, type Quest } from "@/shared/types/domain";

const COLUMNS = [QuestStatus.READY, QuestStatus.IN_PROGRESS, QuestStatus.CLEARED];

export default function QuestBoardPage() {
  const router = useRouter();
  const { snapshot, updateQuest, setQuestStatus } = useQlear();
  const selectQuest = useUiStore((state) => state.selectQuest);
  const [editing, setEditing] = useState<Quest>();
  if (!snapshot?.goal || !snapshot.boss) return <AppShell title="QUEST BOARD"><SystemState code="NO QUEST DATA" message="CREATE A TARGET TO BEGIN." actionHref="/setup" actionLabel="目標を作る" /></AppShell>;
  const smash = (quest: Quest) => { selectQuest(quest.id); router.push("/smash"); };
  return <AppShell title="QUEST BOARD" eyebrow="ROUTE MAP // MANUAL CONTROL" actions={<Button size="small" onClick={() => router.push("/smash")}>SMASH MODE →</Button>}>
    <div className="board-intro"><div><span className="system-label">ACTIVE BOSS</span><h2>{snapshot.goal.title}</h2></div><p>AIの提案は命令ではありません。EDITと状態変更で、自分の攻略順へ調整できます。</p></div>
    <div className="quest-board">
      {COLUMNS.map((status) => { const quests = snapshot.quests.filter((quest) => quest.status === status); return <section key={status} className={`board-column board-column--${status.toLowerCase()}`}><header><span>{status}</span><strong>{String(quests.length).padStart(2,"0")}</strong></header><div>{quests.map((quest,index) => <div key={quest.id} className="board-card-wrap"><QuestCard quest={quest} index={index} compact subquests={snapshot.subquests.filter((item) => item.questId === quest.id)} onEdit={() => setEditing(quest)} onSmash={status !== QuestStatus.CLEARED ? () => smash(quest) : undefined} />{status !== QuestStatus.CLEARED && <div className="board-status-actions">{status === QuestStatus.READY ? <Button variant="ghost" size="small" onClick={() => void setQuestStatus(quest.id, QuestStatus.IN_PROGRESS)}>START →</Button> : <Button variant="ghost" size="small" onClick={() => void setQuestStatus(quest.id, QuestStatus.READY)}>← READYへ</Button>}</div>}</div>)}{quests.length === 0 && <div className="column-empty">NO QUESTS<br /><small>ROUTE SLOT EMPTY</small></div>}</div></section>; })}
    </div>
    {editing && <Modal title="QUEST EDIT // FULL CONTROL" onClose={() => setEditing(undefined)} wide><QuestEditor quest={editing} initialSubquests={snapshot.subquests.filter((item) => item.questId === editing.id)} onSave={async (quest, subquests) => { await updateQuest(quest, subquests); setEditing(undefined); }} /></Modal>}
  </AppShell>;
}
