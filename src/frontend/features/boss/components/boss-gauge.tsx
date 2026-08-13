import type { Boss } from "@/shared/types/domain";

export function BossGauge({ boss, compact = false, pulse = false }: { boss: Boss; compact?: boolean; pulse?: boolean }) {
  const defeated = boss.currentHp === 0;
  const percent = Math.round(((boss.maxHp - boss.currentHp) / boss.maxHp) * 100);
  const remaining = Math.round((boss.currentHp / boss.maxHp) * 100);
  return (
    <div className={`boss-gauge ${compact ? "boss-gauge--compact" : ""} ${pulse ? "is-hit" : ""}`}>
      <div className="boss-gauge__header"><span className="system-label">{defeated ? "BOSS // CLEARED" : "BOSS // ACTIVE TARGET"}</span><span>SCOPE {boss.scopeLevel}</span></div>
      <h2>{boss.title}</h2>
      <div className="boss-gauge__numbers"><span>HP</span><strong>{boss.currentHp.toString().padStart(3, "0")} / {boss.maxHp.toString().padStart(3, "0")}</strong><em>{defeated ? "CLEAR" : `${remaining}% REMAIN`}</em></div>
      <div className="hp-track" role="progressbar" aria-label="Boss remaining HP" aria-valuemin={0} aria-valuemax={boss.maxHp} aria-valuenow={boss.currentHp}>
        <i style={{ width: `${remaining}%` }} />
        <span aria-hidden="true" />
      </div>
      <div className="boss-gauge__footer"><span>{percent}% DEFEATED</span><span>{boss.maxHp - boss.currentHp} TOTAL DAMAGE</span></div>
    </div>
  );
}
