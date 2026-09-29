"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { track } from "@/lib/analytics";
import { activity as t } from "@/content/copy";
import { ActivityRow } from "@/components/portfolio";
import { EmptyState, SkeletonRows } from "@/components/feedback";
import { TopBar } from "@/components/chrome";

export default function ActivityPage() {
  const s = useStore();
  useEffect(() => { track("activity_viewed"); }, []);
  const groups = new Map<string, typeof s.orders>();
  for (const o of s.orders) {
    const k = new Date(o.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    groups.set(k, [...(groups.get(k) ?? []), o]);
  }
  return (
    <main id="content">
      <TopBar back title={t.title} />
      <div className="screen no-tabs">
        {!s.ready ? <SkeletonRows n={5} /> : s.orders.length === 0 ? (
          <EmptyState icon="clock" title={t.empty} body={t.emptyBody} action={<Link href="/discover" className="btn btn-secondary">Explore assets</Link>} />
        ) : [...groups].map(([day, orders]) => (
          <section key={day} style={{ marginBottom: 20 }}>
            <h2 className="label" style={{ padding: "8px 0" }}>{day}</h2>
            <ul>{orders.map((o) => <li key={o.id}><ActivityRow order={o} /></li>)}</ul>
          </section>
        ))}
      </div>
    </main>
  );
}
