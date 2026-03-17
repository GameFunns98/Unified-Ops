export const dynamic = "force-dynamic";

import { ShiftStatus, SubmissionStatus, TicketStatus } from "@prisma/client";
import { prisma } from "@/src/lib/prisma";
import { getAppSession } from "@/src/lib/auth/session";

export default async function DashboardPage() {
  const session = await getAppSession();

  const [applications, pendingReview, activeMembers, onShift, openTickets] = await Promise.all([
    prisma.applicationSubmission.count({ where: { guildId: session.guildId } }),
    prisma.applicationSubmission.count({
      where: {
        guildId: session.guildId,
        status: { in: [SubmissionStatus.SUBMITTED, SubmissionStatus.IN_REVIEW, SubmissionStatus.INTERVIEW] }
      }
    }),
    prisma.guildMember.count({ where: { guildId: session.guildId, isActive: true } }),
    prisma.shift.count({ where: { guildId: session.guildId, status: ShiftStatus.ACTIVE } }),
    prisma.ticket.count({
      where: { guildId: session.guildId, status: { in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.WAITING] } }
    })
  ]);

  const metrics = [
    ["Total applications", applications],
    ["Pending review", pendingReview],
    ["Active members", activeMembers],
    ["On shift", onShift],
    ["Open tickets", openTickets]
  ];

  return (
    <main>
      <p style={{ marginTop: 0 }}>Guild: {session.guildName}</p>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
        {metrics.map(([label, value]) => (
          <article key={label} style={{ background: "white", padding: 16, borderRadius: 8, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 13, color: "#475569" }}>{label}</div>
            <strong style={{ fontSize: 24 }}>{value}</strong>
          </article>
        ))}
      </section>
    </main>
  );
}
