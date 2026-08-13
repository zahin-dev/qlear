"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/frontend/components/brand/logo";
import { useQlear } from "@/frontend/stores/app-provider";
import { levelProgress } from "@/shared/domain/gamification/core";

const NAVIGATION = [
  { href: "/dashboard", label: "COMMAND", icon: "▦" },
  { href: "/quests", label: "QUEST BOARD", icon: "⊞" },
  { href: "/smash", label: "SMASH", icon: "⌁" },
  { href: "/review", label: "REVIEW", icon: "≡" },
  { href: "/settings", label: "SETTINGS", icon: "+" },
];

export function AppShell({ title, eyebrow, actions, children }: { title: string; eyebrow?: string; actions?: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const { snapshot, loading, error } = useQlear();
  const progress = levelProgress(snapshot?.settings.xp ?? 0);

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <div className="sidebar__top"><Logo /><span className="sidebar__tag">QUEST OPERATING SYSTEM</span></div>
        <nav aria-label="メインナビゲーション" className="nav-list">
          {NAVIGATION.map((item, index) => (
            <Link key={item.href} href={item.href} className={pathname === item.href ? "is-active" : ""}>
              <span className="nav-list__index">0{index + 1}</span><span className="nav-list__icon" aria-hidden="true">{item.icon}</span><span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar__level">
          <div><span className="system-label">LEVEL</span><strong>{progress.level.toString().padStart(2, "0")}</strong></div>
          <div className="mini-progress" aria-label={`レベル進捗 ${progress.percent}%`}><i style={{ width: `${progress.percent}%` }} /></div>
          <small>{progress.current} / {progress.required} XP</small>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div><span className="system-label">{eyebrow ?? "QLEAR // LOCAL SYSTEM"}</span><h1>{title}</h1></div>
          <div className="topbar__actions"><span className="status-dot">LOCAL / ONLINE</span>{actions}</div>
        </header>
        <main id="main-content" className="workspace__content">
          {error ? <div className="system-banner system-banner--error">{error}</div> : loading ? <div className="system-banner">SYNCING LOCAL DATA...</div> : children}
        </main>
      </div>
    </div>
  );
}
