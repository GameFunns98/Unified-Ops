export const dynamic = "force-dynamic";

import Link from "next/link";
import { DataTable, SectionCard, StatCard, StatusPill } from "@/src/components/ops-ui";
import { prisma } from "@/src/lib/prisma";
import { getAppSession } from "@/src/lib/auth/session";

export default async function RosterPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const session = await getAppSession();
  const { view = "directory" } = await searchParams;

  const members = await prisma.guildMember.findMany({
    where: { guildId: session.guildId },
    include: { user: true, rosterEntry: { include: { rank: true, division: true } } },
    orderBy: { createdAt: "asc" }
  });

  const active = members.filter((m) => m.isActive).length;
  const probation = members.filter((m) => m.status === "PROBATION").length;

  return <main style={{ display: "grid", gap: 16 }}>
    <div className="uo-grid-4">
      <StatCard title="Total Staff" value={members.length} sub="Across all divisions" />
      <StatCard title="Active Members" value={active} sub="Ready for deployment" />
      <StatCard title="Probation" value={probation} sub="Needs review" />
      <StatCard title="Quota Issues" value={2} sub="Placeholder quota analyzer" />
    </div>

    <SectionCard title="Roster Control Center" subtitle="Directory, profile, certifications, discipline and quotas.">
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {["directory", "profile", "certifications", "discipline", "quotas"].map((id) => <Link key={id} className="uo-btn" style={view === id ? { background: "#fbbf24", color: "black", borderColor: "transparent" } : undefined} href={`/roster?view=${id}`}>{id[0].toUpperCase() + id.slice(1)}</Link>)}
      </div>

      {view === "directory" && <DataTable columns={["Rank", "Callsign", "Badge", "Division", "Status", "Discord", "Profile"]}>{members.map((m) => <tr key={m.id}><td>{m.rosterEntry?.rank?.name ?? "—"}</td><td>{m.rosterEntry?.callsign ?? m.callsign ?? "—"}</td><td>{m.rosterEntry?.badgeNumber ?? m.badgeNumber ?? "—"}</td><td>{m.rosterEntry?.division?.name ?? "—"}</td><td><StatusPill value={m.status} /></td><td>{m.nickname ?? m.user.globalName ?? m.user.username}</td><td><Link className="uo-btn" href={`/roster/${m.id}`}>Open</Link></td></tr>)}</DataTable>}

      {view === "profile" && <div className="uo-card" style={{ padding: 14 }}><strong>Member Profile</strong><div className="uo-muted">Select a member in Directory to edit profile, rank, division, callsign and badge using the live form route.</div></div>}

      {view === "certifications" && <div className="uo-grid-2"><DataTable columns={["Member", "Division", "Core Certs", "Advanced", "Expiry", "State"]}>{members.slice(0, 4).map((m, i) => <tr key={m.id}><td>{m.nickname ?? m.user.globalName ?? m.user.username}</td><td>{m.rosterEntry?.division?.name ?? "Unassigned"}</td><td>{i % 2 ? "ALS, ATLS" : "BLS"}</td><td>{i % 2 ? "Instructor" : "-"}</td><td>{i % 2 ? "06/2026" : "Expired"}</td><td><StatusPill value={i % 2 ? "Healthy" : "Missing"} /></td></tr>)}</DataTable><div style={{ display: "grid", gap: 10 }}><div className="uo-card" style={{ padding: 12 }}><strong>Expiring soon</strong><div className="uo-muted">Placeholder certification-expiry feed (schema not yet modeled).</div></div><div className="uo-card" style={{ padding: 12 }}><strong>Missing certs</strong><div className="uo-muted">Placeholder critical certification checker.</div></div></div></div>}

      {view === "discipline" && <div className="uo-grid-2"><DataTable columns={["Member", "Entry Type", "Reason", "Date", "State"]}>{[["Rosalie", "Strike", "Missed trauma call", "15/03/2026", "Open"], ["Angel-1", "Commendation", "Excellent command", "12/03/2026", "Accepted"]].map((r) => <tr key={r[0] + r[1]}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td><StatusPill value={r[4]} /></td></tr>)}</DataTable><div className="uo-card" style={{ padding: 12 }}><strong>Discipline policy triggers</strong><div className="uo-muted">Placeholder policy engine until discipline entities are added server-side.</div></div></div>}

      {view === "quotas" && <div className="uo-grid-2"><DataTable columns={["Quota", "Period", "Required", "Status"]}>{[["Medical Staff Monthly", "30 days", "20h", "Healthy"], ["Academy Training", "14 days", "6h", "Warning"]].map((r) => <tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td><StatusPill value={r[3]} /></td></tr>)}</DataTable><div className="uo-card" style={{ padding: 12 }}><strong>Members below quota</strong><div className="uo-muted">Placeholder quota module isolated until quota schema exists.</div></div></div>}
    </SectionCard>
  </main>;
}
