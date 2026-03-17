export const dynamic = "force-dynamic";

import { ShiftStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { DataTable, SectionCard, StatCard, StatusPill } from "@/src/components/ops-ui";
import { startShift } from "@/src/lib/services/shifts/start-shift";
import { prisma } from "@/src/lib/prisma";
import { getAppSession } from "@/src/lib/auth/session";

export default async function ShiftsPage() {
  const session = await getAppSession();

  const [myMember, shifts] = await Promise.all([
    prisma.guildMember.findFirst({ where: { guildId: session.guildId, userId: session.userId }, include: { rosterEntry: true } }),
    prisma.shift.findMany({ where: { guildId: session.guildId }, include: { user: true }, orderBy: { startedAt: "desc" }, take: 30 })
  ]);

  async function startAction() {
    "use server";
    const session = await getAppSession();
    const member = await prisma.guildMember.findFirst({ where: { guildId: session.guildId, userId: session.userId }, include: { rosterEntry: true } });
    if (!member?.rosterEntry) throw new Error("Roster entry not found. Accept an application first.");
    await startShift({ guildId: session.guildId, userId: session.userId, rosterEntryId: member.rosterEntry.id });
    revalidatePath("/shifts"); revalidatePath("/");
  }

  const hasRoster = Boolean(myMember?.rosterEntry);
  const hasActive = shifts.some((shift) => shift.userId === session.userId && shift.status === ShiftStatus.ACTIVE);

  return <main style={{ display: "grid", gap: 16 }}>
    <div className="uo-grid-4">
      <StatCard title="On Shift" value={shifts.filter((s) => s.status === ShiftStatus.ACTIVE).length} sub="Current live sessions" />
      <StatCard title="This Week" value={shifts.length} sub="Recent tracked sessions" />
      <StatCard title="This Month" value={shifts.length} sub="Placeholder hours rollup" />
      <StatCard title="Avg Shift" value="2h 53m" sub="Placeholder analytics" />
    </div>

    <div className="uo-grid-split">
      <SectionCard title="My Shift" subtitle="Personal shift control panel.">
        <div className="uo-card" style={{ padding: 12, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><div>{hasActive ? "You are currently on shift." : "You are not currently on shift."}</div><StatusPill value={hasActive ? "Active" : "Off Shift"} /></div>
          <div className="uo-muted">Roster state: {hasRoster ? "Ready" : "No roster entry"}</div>
          <form action={startAction} style={{ marginTop: 10 }}><button className="uo-btn uo-btn-primary" type="submit" disabled={!hasRoster || hasActive}>Start Shift</button></form>
        </div>
      </SectionCard>

      <SectionCard title="Shift analytics" subtitle="Visual summaries + leaderboard style blocks.">
        <div className="uo-card" style={{ padding: 12, marginBottom: 10 }}><strong>Weekly hours trend</strong><div className="uo-muted">Placeholder line chart until chart package is introduced.</div></div>
        <div style={{ display: "grid", gap: 8 }}>{shifts.slice(0, 5).map((s, i) => <div key={s.id} className="uo-card" style={{ padding: 10, display: "flex", justifyContent: "space-between" }}><span>{i + 1}. {s.user.globalName ?? s.user.username}</span><span>{s.status}</span></div>)}</div>
      </SectionCard>
    </div>

    <SectionCard title="Shift queue" subtitle="Recent sessions">
      <DataTable columns={["Member", "Status", "Started"]}>{shifts.map((s) => <tr key={s.id}><td>{s.user.globalName ?? s.user.username}</td><td><StatusPill value={s.status} /></td><td>{s.startedAt.toLocaleString()}</td></tr>)}</DataTable>
    </SectionCard>
  </main>;
}
