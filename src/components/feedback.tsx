"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import { useStore } from "@/lib/store";
import { common } from "@/content/copy";

export function Banner({ tone, icon, children, role }: { tone: "warn" | "info" | "error"; icon?: IconName; children: ReactNode; role?: "status" | "alert" }) {
  return (
    <div className={`banner banner-${tone}`} role={role}>
      <span className="ico"><Icon name={icon ?? (tone === "info" ? "info" : "alert")} size={18} /></span>
      <div style={{ minWidth: 0 }}>{children}</div>
    </div>
  );
}

export function Skeleton({ w = "100%", h = 14, r = 8, style }: { w?: number | string; h?: number; r?: number; style?: React.CSSProperties }) {
  return <span className="sk" aria-hidden style={{ width: w, height: h, borderRadius: r, ...style }} />;
}

export function SkeletonRows({ n = 4, label = "Loading" }: { n?: number; label?: string }) {
  return (
    <div role="status" aria-label={label}>
      {Array.from({ length: n }).map((_, i) => (
        <div className="row" key={i}>
          <Skeleton w={40} h={40} r={20} />
          <div className="stack-8"><Skeleton w="55%" h={14} /><Skeleton w="38%" h={12} /></div>
          <div className="stack-8" style={{ justifyItems: "end", display: "grid" }}><Skeleton w={64} h={14} /><Skeleton w={44} h={12} /></div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, body, action, icon = "compass" }: { title: string; body?: string; action?: ReactNode; icon?: IconName }) {
  return (
    <div style={{ padding: "28px 4px", display: "grid", gap: 10, justifyItems: "start" }}>
      <span style={{ display: "grid", placeItems: "center", width: 44, height: 44, borderRadius: 22, background: "var(--surface)", color: "var(--ink-2)" }}>
        <Icon name={icon} />
      </span>
      <p className="h-section">{title}</p>
      {body && <p className="muted" style={{ maxWidth: "34ch" }}>{body}</p>}
      {action && <div style={{ marginTop: 6 }}>{action}</div>}
    </div>
  );
}

export function RetryState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="tile between" role="alert" style={{ padding: "12px 14px" }}>
      <span className="small">{message}</span>
      <button className="btn btn-ghost btn-sm" onClick={onRetry}><Icon name="refresh" size={16} />{common.retry}</button>
    </div>
  );
}

/** Accessible bottom sheet: focus moves in, Escape closes, focus returns. */
export function Sheet({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>("button, a, input, [tabindex]:not([tabindex='-1'])");
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = overflow; prev?.focus(); };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby={id} ref={ref} tabIndex={-1}>
        <div className="sheet-grip" />
        <div className="sheet-head">
          <h2 id={id} className="h-section">{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label={common.close}><Icon name="close" /></button>
        </div>
        <div style={{ paddingTop: 4 }}>{children}</div>
        {footer && <div style={{ marginTop: 20 }}>{footer}</div>}
      </div>
    </>
  );
}

export function Toasts() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div className="toast" key={t.id}>
          <span className="hstack"><Icon name="check" size={18} />{t.text}</span>
          {t.action && <button className="btn-link" onClick={() => { t.action!.run(); dismissToast(t.id); }}>{t.action.label}</button>}
        </div>
      ))}
    </div>
  );
}

export function OfflineBar() {
  const { lab } = useStore();
  if (!lab.offline) return null;
  return (
    <div className="offline-bar" role="status">
      <Icon name="wifiOff" size={16} /> {common.offline}
    </div>
  );
}
