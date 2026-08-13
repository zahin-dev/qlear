"use client";

import { useEffect, type ReactNode } from "react";
import { Button } from "@/frontend/components/ui/button";

export function Modal({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className={`modal ${wide ? "modal--wide" : ""}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header className="modal__header"><h2 id="modal-title">{title}</h2><Button variant="ghost" size="small" onClick={onClose} aria-label="閉じる">×</Button></header>
        <div className="modal__body">{children}</div>
      </section>
    </div>
  );
}
