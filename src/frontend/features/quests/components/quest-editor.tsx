"use client";

import { useState } from "react";
import { Button } from "@/frontend/components/ui/button";
import { DAMAGE_BY_DIFFICULTY } from "@/shared/domain/gamification/core";
import { createId } from "@/shared/utils/identifiers";
import { Difficulty, QuestStatus, type Quest, type Subquest } from "@/shared/types/domain";

export function QuestEditor({ quest, initialSubquests, onSave }: { quest: Quest; initialSubquests: Subquest[]; onSave: (quest: Quest, subquests: Subquest[]) => Promise<void> }) {
  const [draft, setDraft] = useState(quest);
  const [subquests, setSubquests] = useState(initialSubquests);
  const [saving, setSaving] = useState(false);
  const updateSubquest = (index: number, title: string) => setSubquests((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, title } : item));
  const addSubquest = () => setSubquests((items) => items.length >= 3 ? items : [...items, { id: createId("subquest"), questId: quest.id, title: "", status: QuestStatus.READY, order: items.length }]);
  return (
    <form className="quest-editor" onSubmit={async (event) => { event.preventDefault(); setSaving(true); try { await onSave(draft, subquests.filter((item) => item.title.trim())); } finally { setSaving(false); } }}>
      <label className="field"><span>TITLE</span><input required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label>
      <label className="field"><span>DESCRIPTION</span><textarea rows={4} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label>
      <div className="field-grid field-grid--4">
        <label className="field"><span>DIFFICULTY</span><select value={draft.difficulty} onChange={(event) => { const difficulty = event.target.value as Difficulty; setDraft({ ...draft, difficulty, damage: DAMAGE_BY_DIFFICULTY[difficulty] }); }}>{Object.values(Difficulty).map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="field"><span>EST. MIN</span><input type="number" min="1" value={draft.estimatedMinutes} onChange={(event) => setDraft({ ...draft, estimatedMinutes: Number(event.target.value) })} /></label>
        <label className="field"><span>PRIORITY</span><input type="number" min="1" max="5" value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: Number(event.target.value) })} /></label>
        <label className="field"><span>DAMAGE</span><input type="number" min="1" value={draft.damage} onChange={(event) => setDraft({ ...draft, damage: Number(event.target.value) })} /></label>
      </div>
      <div className="field-grid">
        <label className="field"><span>SCHEDULED FOR</span><input type="date" value={draft.scheduledFor ?? ""} onChange={(event) => setDraft({ ...draft, scheduledFor: event.target.value || undefined })} /></label>
        <label className="field"><span>DUE AT</span><input type="date" value={draft.dueAt ?? ""} onChange={(event) => setDraft({ ...draft, dueAt: event.target.value || undefined })} /></label>
      </div>
      <fieldset className="subquest-editor"><legend>SUBQUESTS // 0–3</legend>{subquests.map((subquest, index) => <div key={subquest.id}><span>{String(index + 1).padStart(2,"0")}</span><input aria-label={`Subquest ${index + 1}`} value={subquest.title} onChange={(event) => updateSubquest(index, event.target.value)} /><Button type="button" variant="ghost" size="small" onClick={() => setSubquests((items) => items.filter((item) => item.id !== subquest.id).map((item, itemIndex) => ({ ...item, order: itemIndex })))}>REMOVE</Button></div>)}{subquests.length < 3 && <Button type="button" variant="secondary" size="small" onClick={addSubquest}>+ ADD SUBQUEST</Button>}</fieldset>
      <div className="modal-actions"><Button type="submit" disabled={saving}>{saving ? "SAVING..." : "SAVE QUEST"}</Button></div>
    </form>
  );
}
