export const dynamic = "force-dynamic";

import { ShiftStatus, SubmissionStatus, TicketStatus } from "@prisma/client";
import { DataTable, SectionCard, StatCard, StatusPill } from "@/src/components/ops-ui";
import { getAppSession } from "@/src/lib/auth/session";
import { prisma } from "@/src/lib/prisma";

export default async function DashboardPage() {
  const session = await getAppSession();

  const [applications, pendingReview, activeMembers, onShift, openTickets, recentSubmissions, syncJobs] = await Promise.all([
    prisma.applicationSubmission.count({ where: { guildId: session.guildId } }),
    prisma.applicationSubmission.count({ where: { guildId: session.guildId, status: { in: [SubmissionStatus.SUBMITTED, SubmissionStatus.IN_REVIEW, SubmissionStatus.INTERVIEW] } } }),
    prisma.guildMember.count({ where: { guildId: session.guildId, isActive: true } }),
    prisma.shift.count({ where: { guildId: session.guildId, status: ShiftStatus.ACTIVE } }),
    prisma.ticket.count({ where: { guildId: session.guildId, status: { in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.WAITING] } } }),
    prisma.applicationSubmission.findMany({ where: { guildId: session.guildId }, include: { template: true, applicant: true }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.discordSyncJob.findMany({ where: { guildId: session.guildId }, orderBy: { createdAt: "desc" }, take: 5 })
  ]);

  return (
    <main style={{ display: "grid", gap: 16 }}>
      <div className="uo-grid-4">
        <StatCard title="Total Applications" value={applications} sub="Recruitment volume" />
        <StatCard title="Pending Review" value={pendingReview} sub="Needs reviewer action" />
        <StatCard title="Active Staff" value={activeMembers} sub={`On shift now: ${onShift}`} />
        <StatCard title="Open Tickets" value={openTickets} sub="SLA monitored" />
      </div>

      <div className="uo-grid-split">
        <SectionCard title="Unified activity control" subtitle="Applications, roster, tickets and shift workflows in one layer.">
          <div className="uo-grid-2">
            {[
              ["Recruitment", "Template builder, review flow, limits and risk scoring."],
              ["Roster", "Ranks, callsigns, certifications, discipline and quotas."],
              ["Ticketing", "Panel builder, forms, queue and audit trace."]
            ].map(([t, d]) => <div key={t} className="uo-card" style={{ padding: 14 }}><strong>{t}</strong><div className="uo-muted">{d}</div></div>)}
          </div>
        </SectionCard>
        <SectionCard title="Live signals" subtitle="Operational health overview.">
          <div style={{ display: "grid", gap: 10 }}>
            {[["Discord sync", syncJobs[0]?.status ?? "Healthy"], ["Shift tracker", `${onShift} active`], ["Application queue", `${pendingReview} pending`], ["Tickets", `${openTickets} open`]].map(([l, v]) => (
              <div key={l} className="uo-card" style={{ padding: 12, display: "flex", justifyContent: "space-between" }}><span>{l}</span><StatusPill value={v} /></div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="uo-grid-split">
        <SectionCard title="Recent applications" subtitle="Live reviewer queue">
          <DataTable columns={["Template", "Applicant", "Stage", "Submitted"]}>
            {recentSubmissions.map((s) => <tr key={s.id}><td>{s.template.name}</td><td>{s.applicant.globalName ?? s.applicant.username}</td><td><StatusPill value={s.status} /></td><td>{s.createdAt.toLocaleString()}</td></tr>)}
          </DataTable>
        </SectionCard>
        <SectionCard title="Discord sync jobs" subtitle="Recent background operations">
          <div style={{ display: "grid", gap: 10 }}>
            {syncJobs.map((j) => <div key={j.id} className="uo-card" style={{ padding: 12 }}><div style={{ display: "flex", justifyContent: "space-between" }}><strong>{j.jobType}</strong><StatusPill value={j.status} /></div><div className="uo-muted" style={{ fontSize: 13 }}>{j.createdAt.toLocaleString()}</div></div>)}
          </div>
        </SectionCard>
      </div>
    </main>
  );
}
