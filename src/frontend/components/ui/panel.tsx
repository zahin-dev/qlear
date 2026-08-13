import type { HTMLAttributes, ReactNode } from "react";

interface PanelProps extends HTMLAttributes<HTMLElement> {
  label?: string;
  accent?: "amber" | "signal" | "rust";
  children: ReactNode;
}

export function Panel({ label, accent, className = "", children, ...props }: PanelProps) {
  return (
    <section className={`panel ${accent ? `panel--${accent}` : ""} ${className}`} {...props}>
      {label && <div className="panel__label"><span>{label}</span><i aria-hidden="true" /></div>}
      {children}
    </section>
  );
}
