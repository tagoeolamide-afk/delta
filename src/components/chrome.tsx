"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, type ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import { nav, common } from "@/content/copy";
import { useStore } from "@/lib/store";

const TABS: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: nav.home, icon: "home" },
  { href: "/discover", label: nav.discover, icon: "compass" },
  { href: "/portfolio", label: nav.portfolio, icon: "pie" },
  { href: "/profile", label: nav.profile, icon: "user" },
];

export function TabBar() {
  const path = usePathname();
  return (
    <nav className="tabbar" aria-label="Main">
      {TABS.map((t) => {
        const active = t.href === "/" ? path === "/" : path.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className="tab" aria-current={active ? "page" : undefined}>
            <Icon name={t.icon} size={22} />
            <span>{t.label}</span>
            <span className="tab-dot" aria-hidden />
          </Link>
        );
      })}
    </nav>
  );
}

/** `title` renders as the page's <h1> unless the page supplies its own (`heading={false}`). */
export function TopBar({ back, title, right, onBack, backLabel = common.back, icon = "back", heading = true }: {
  back?: boolean; title?: ReactNode; right?: ReactNode; onBack?: () => void; backLabel?: string; icon?: IconName; heading?: boolean;
}) {
  const router = useRouter();
  return (
    <header className="topbar">
      {back ? (
        <button className="icon-btn" aria-label={backLabel} onClick={onBack ?? (() => (history.length > 1 ? router.back() : router.push("/")))}>
          <Icon name={icon} />
        </button>
      ) : <span style={{ width: 44 }} />}
      {title && heading ? <h1 className="grow topbar-title">{title}</h1> : <div className="grow topbar-title">{title}</div>}
      <div className="hstack" style={{ gap: 0, minWidth: 44, justifyContent: "flex-end" }}>{right}</div>
    </header>
  );
}

/**
 * Remembers scroll position per key across navigation (PRD §8: returning from
 * Asset restores the previous Discover state incl. scroll).
 */
export function useScrollMemory(key: string, ready = true) {
  const { ui, setUi } = useStore();
  const saved = ui[`scroll:${key}`] as number | undefined;
  useLayoutEffect(() => {
    if (ready && saved) window.scrollTo(0, saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);
  useEffect(() => {
    let y = window.scrollY;
    const onScroll = () => { y = window.scrollY; };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); setUi(`scroll:${key}`, y); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
