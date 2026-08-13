"use client";

import { useEffect, useState } from "react";
import { Button } from "@/frontend/components/ui/button";
import type { CompletionOutcome } from "@/shared/types/domain";

const PHASES = ["CHECK HIT", "PIXEL CRUMPLE", "TARGET IMPACT", "REWARD SYNC"];

export function DigitalCrumple({ outcome, reduced, onDone }: { outcome: CompletionOutcome; reduced: boolean; onDone: () => void }) {
  const [phase, setPhase] = useState(reduced ? 3 : 0);
  useEffect(() => {
    if (reduced) return;
    const timers = [1, 2, 3].map((next) => window.setTimeout(() => setPhase(next), next * 420));
    return () => timers.forEach(window.clearTimeout);
  }, [reduced]);
  return (
    <div className={`completion-layer phase-${phase}`} role="dialog" aria-modal="true" aria-label="Quest completion result">
      <div className="crumple-stage" aria-hidden="true">
        <div className="crumple-card"><span>✓</span>{Array.from({ length: 24 }, (_, index) => <i key={index} />)}</div>
        <div className="impact-line" />
      </div>
      <div className="completion-readout" aria-live="assertive">
        <span className="system-label">{PHASES[phase]}</span>
        {phase < 3 ? <h2>{phase === 0 ? "CLEAR." : phase === 1 ? "CRUMPLING..." : "BOSS HIT"}</h2> : (
          <>
            <h2>QUEST CLEAR</h2>
            <div className="reward-grid">
              <div><span>DAMAGE</span><strong>-{outcome.event.damage}</strong></div>
              <div><span>XP</span><strong>+{outcome.event.xp}</strong></div>
              <div><span>COMBO</span><strong>×{outcome.event.combo}</strong></div>
            </div>
            {outcome.title && <div className={`title-unlock rarity--${outcome.title.rarity.toLowerCase()}`}><span>CLEAR TITLE UNLOCKED</span><strong>{outcome.title.name}</strong><small>{outcome.title.rarity}</small></div>}
            <Button size="large" onClick={onDone}>NEXT QUEST →</Button>
          </>
        )}
      </div>
    </div>
  );
}
