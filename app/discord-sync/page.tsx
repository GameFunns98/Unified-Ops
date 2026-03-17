export const dynamic = "force-dynamic";

import { DataTable, SectionCard, StatusPill } from "@/src/components/ops-ui";
import { prisma } from "@/src/lib/prisma";
import { getAppSession } from "@/src/lib/auth/session";

type SyncPayload = { guildMemberId?: string; discordId?: string; callsign?: string | null; badgeNumber?: string | null; };

function payloadSummary(payload: unknown) {
  const item = (payload ?? {}) as SyncPayload;
  return [item.guildMemberId, item.discordId, item.callsign, item.badgeNumber].filter(Boolean).join(" • ");
}

export default async function DiscordSyncJobsPage() {
  const session = await getAppSession();
  const jobs = await prisma.discordSyncJob.findMany({ where: { guildId: session.guildId }, orderBy: { createdAt: "desc" }, take: 30 });

  return (
    <main style={{ display: "grid", gap: 16 }}>
      <SectionCard title="Discord Sync Jobs" subtitle="Queued and processed jobs for this guild.">
        <DataTable columns={["Status", "Type", "Created", "Completed", "Payload"]}>
          {jobs.map((job) => <tr key={job.id}><td><StatusPill value={job.status} /></td><td>{job.jobType}</td><td>{job.createdAt.toISOString()}</td><td>{job.completedAt?.toISOString() ?? "—"}</td><td>{payloadSummary(job.payload) || "—"}</td></tr>)}
        </DataTable>
      </SectionCard>
    </main>
  );
}
