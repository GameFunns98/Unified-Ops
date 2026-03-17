"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useMemo, useState } from "react";

const nav = [
  ["/", "Overview"],
  ["/applications", "Applications"],
  ["/roster", "Roster"],
  ["/shifts", "Shift Tracking"],
  ["/tickets", "Tickets"],
  ["/automation", "Automation"],
  ["/backend", "Backend"],
  ["/team", "Team & Roles"],
  ["/settings", "Settings"],
  ["/discord-sync", "Discord Sync"]
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const title = useMemo(() => nav.find(([href]) => href === pathname)?.[1] ?? "UnifiedOps", [pathname]);

  return (
    <div className="uo-bg">
      <div className="uo-layout">
        <aside className={`uo-sidebar ${collapsed ? "collapsed" : ""}`}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ width: 42, height: 42, borderRadius: 14, display: "grid", placeItems: "center", background: "#7c3aed", fontWeight: 700 }}>UC</div>
              {!collapsed && <div><div style={{ fontWeight: 700 }}>UnifiedOps</div><div className="uo-muted" style={{ fontSize: 12 }}>Community Control</div></div>}
            </div>
            <button className="uo-btn" onClick={() => setCollapsed((v) => !v)}>≡</button>
          </div>

          <div className="uo-card" style={{ padding: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, display: "grid", placeItems: "center", background: "linear-gradient(135deg,#7c3aed,#d946ef)", fontWeight: 700 }}>MC</div>
              {!collapsed && <div><div style={{ fontWeight: 600 }}>My community</div><div className="uo-muted" style={{ fontSize: 13 }}>EMS / ReuX RP</div></div>}
            </div>
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            {nav.map(([href, label]) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className="uo-btn"
                  style={active ? { background: "rgba(124,58,237,.2)", borderColor: "rgba(124,58,237,.45)", color: "#c4b5fd" } : undefined}
                >
                  {collapsed ? label[0] : label}
                </Link>
              );
            })}
          </div>
          <div style={{ marginTop: "auto" }} className="uo-card">
            <div className="uo-card-b">
              {!collapsed ? <><div style={{ color: "#fcd34d", fontWeight: 700 }}>Premium stack</div><p className="uo-muted" style={{ marginBottom: 0 }}>Applications, roster sync, tickets, quotas, analytics and Discord automation in one platform.</p></> : "★"}
            </div>
          </div>
        </aside>

        <main className="uo-main">
          <div className="uo-container">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
              <div>
                <div className="uo-muted" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".2em" }}>Unified Community Operations Platform</div>
                <h1 style={{ margin: "8px 0", fontSize: 40 }}>{title}</h1>
                <div className="uo-muted">Unified dashboard for recruitment, roster management, shift tracking, tickets and Discord sync.</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <div className="uo-btn">Search members, tickets, applications...</div>
                <button className="uo-btn">🔔</button>
                <button className="uo-btn uo-btn-primary">+ Quick Action</button>
              </div>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function StatCard({ title, value, sub }: { title: string; value: string | number; sub: string }) {
  return <div className="uo-stat"><div className="uo-muted" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase" }}>{title}</div><div style={{ fontSize: 34, fontWeight: 700 }}>{value}</div><div className="uo-muted">{sub}</div></div>;
}

export function SectionCard({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode }) {
  return <section className="uo-card"><div className="uo-card-h"><div><h3 style={{ margin: 0 }}>{title}</h3>{subtitle && <div className="uo-muted" style={{ fontSize: 14 }}>{subtitle}</div>}</div>{action}</div><div className="uo-card-b">{children}</div></section>;
}

export function StatusPill({ value }: { value: string }) {
  const v = value.toLowerCase();
  const style = v.includes("active") || v.includes("accepted") || v.includes("open") || v.includes("healthy")
    ? { background: "rgba(16,185,129,.15)", color: "#6ee7b7", borderColor: "rgba(16,185,129,.3)" }
    : v.includes("pending") || v.includes("waiting") || v.includes("probation") || v.includes("expiring") || v.includes("warning")
      ? { background: "rgba(245,158,11,.15)", color: "#fcd34d", borderColor: "rgba(245,158,11,.3)" }
      : v.includes("reject") || v.includes("missing") || v.includes("suspended")
        ? { background: "rgba(244,63,94,.15)", color: "#fda4af", borderColor: "rgba(244,63,94,.3)" }
        : { background: "rgba(56,189,248,.15)", color: "#7dd3fc", borderColor: "rgba(56,189,248,.3)" };
  return <span className="uo-pill" style={style}>{value}</span>;
}

export function DataTable({ columns, children }: { columns: string[]; children: ReactNode }) {
  return <div style={{ overflow: "auto", border: "1px solid rgba(255,255,255,.1)", borderRadius: 16 }}><table className="uo-table"><thead><tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}

export function Tabs({ items, value, onChange, tone }: { items: [string, string][]; value: string; onChange: (v: string) => void; tone?: "violet" | "amber" }) {
  return <div className="uo-tabs">{items.map(([id, label]) => <button key={id} className="uo-btn" style={value === id ? { background: tone === "amber" ? "#fbbf24" : "#7c3aed", color: tone === "amber" ? "black" : "white", borderColor: "transparent" } : undefined} onClick={() => onChange(id)}>{label}</button>)}</div>;
}
