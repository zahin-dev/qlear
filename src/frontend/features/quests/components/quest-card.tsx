"use client";

import { DifficultyBadge } from "@/frontend/features/quests/components/difficulty-badge";
import { Button } from "@/frontend/components/ui/button";
import type { Quest, Subquest } from "@/shared/types/domain";

export function QuestCard({ quest, index, subquests = [], onSmash, onEdit, compact = false }: {
  quest: Quest;
  index: number;
  subquests?: Subquest[];
  onSmash?: () => void;
  onEdit?: () => void;
  compact?: boolean;
}) {
  return (
    <article className={`quest-card ${compact ? "quest-card--compact" : ""} ${quest.status === "CLEARED" ? "is-cleared" : ""}`} data-testid="quest-card">
      <div className="quest-card__number">{String(index + 1).padStart(2, "0")}</div>
      <div className="quest-card__body">
        <div className="quest-card__meta"><DifficultyBadge difficulty={quest.difficulty} /><span>{quest.estimatedMinutes} MIN</span><span>{quest.damage} DMG</span></div>
        <h3>{quest.title}</h3>
        {!compact && <p>{quest.description}</p>}
        {!compact && subquests.length > 0 && <ul className="subquest-list">{subquests.map((item) => <li key={item.id}><span aria-hidden="true">□</span>{item.title}</li>)}</ul>}
        {!compact && <small className="ai-reason">AI // {quest.aiReason}</small>}
      </div>
      <div className="quest-card__actions">
        {onEdit && <Button variant="ghost" size="small" onClick={onEdit} aria-label={`${quest.title}を編集`}>EDIT</Button>}
        {onSmash && quest.status !== "CLEARED" && <Button size="small" onClick={onSmash}>SMASH →</Button>}
      </div>
    </article>
  );
}
