import { prisma } from "@/src/lib/prisma";
import { getAppSession } from "@/src/lib/auth/session";

type SyncPayload = {
  guildMemberId?: string;
  discordId?: string;
  callsign?: string | null;
  badgeNumber?: string | null;
};

function payloadSummary(payload: unknown) {
  const item = (payload ?? {}) as SyncPayload;
  return [item.guildMemberId, item.discordId, item.callsign, item.badgeNumber].filter(Boolean).join(" • ");
}

export default async function DiscordSyncJobsPage() {
  const session = await getAppSession();

  const jobs = await prisma.discordSyncJob.findMany({
    where: { guildId: session.guildId },
    orderBy: { createdAt: "desc" },
    take: 30
  });

  return (
    <main>
      <h2>Discord Sync Jobs</h2>
      <p style={{ color: "#475569" }}>Recent queued and processed jobs for this guild.</p>
      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f8fafc", textAlign: "left" }}>
              <th style={{ padding: 10 }}>Status</th>
              <th style={{ padding: 10 }}>Type</th>
              <th style={{ padding: 10 }}>Created</th>
              <th style={{ padding: 10 }}>Completed</th>
              <th style={{ padding: 10 }}>Payload</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                <td style={{ padding: 10 }}>{job.status}</td>
                <td style={{ padding: 10 }}>{job.jobType}</td>
                <td style={{ padding: 10 }}>{job.createdAt.toISOString()}</td>
                <td style={{ padding: 10 }}>{job.completedAt ? job.completedAt.toISOString() : "—"}</td>
                <td style={{ padding: 10 }}>{payloadSummary(job.payload) || "—"}</td>
              </tr>
            ))}
            {jobs.length === 0 ? (
              <tr>
                <td style={{ padding: 10 }} colSpan={5}>
                  No Discord sync jobs yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}
