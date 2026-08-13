import Link from "next/link";

export function SystemState({ code, message, actionHref, actionLabel }: { code: string; message: string; actionHref?: string; actionLabel?: string }) {
  return (
    <div className="system-state" role="status">
      <div className="system-state__signal" aria-hidden="true"><i /><i /><i /></div>
      <p className="system-label">{code}</p>
      <h2>{message}</h2>
      {actionHref && actionLabel && <Link className="button button--primary button--default" href={actionHref}>{actionLabel}</Link>}
    </div>
  );
}
