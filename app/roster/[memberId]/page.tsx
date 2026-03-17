export const dynamic = "force-dynamic";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { SectionCard, StatusPill } from "@/src/components/ops-ui";
import { updateRosterMember } from "@/src/lib/services/roster/update-roster-member";
import { prisma } from "@/src/lib/prisma";
import { getAppSession } from "@/src/lib/auth/session";

type Props = { params: Promise<{ memberId: string }>; };

export default async function MemberProfilePage({ params }: Props) {
  const session = await getAppSession();
  const { memberId } = await params;

  const [member, ranks, divisions] = await Promise.all([
    prisma.guildMember.findFirst({ where: { id: memberId, guildId: session.guildId }, include: { user: true, rosterEntry: { include: { rank: true, division: true } } } }),
    prisma.rank.findMany({ where: { guildId: session.guildId }, orderBy: { level: "asc" } }),
    prisma.division.findMany({ where: { guildId: session.guildId }, orderBy: { sortOrder: "asc" } })
  ]);

  if (!member || !member.rosterEntry) notFound();

  async function updateAction(formData: FormData) {
    "use server";
    const session = await getAppSession();
    await updateRosterMember({ guildId: session.guildId, memberId, actorUserId: session.userId, nickname: String(formData.get("nickname") ?? "") || null, callsign: String(formData.get("callsign") ?? "") || null, badgeNumber: String(formData.get("badgeNumber") ?? "") || null, rankId: String(formData.get("rankId") ?? "") || null, divisionId: String(formData.get("divisionId") ?? "") || null });
    revalidatePath(`/roster/${memberId}`); revalidatePath("/roster");
  }

  return <main style={{ display: "grid", gap: 16 }}>
    <div className="uo-grid-split">
      <SectionCard title={member.nickname ?? member.user.globalName ?? member.user.username} subtitle={`${member.rosterEntry.rank?.name ?? "No rank"} • Badge ${member.rosterEntry.badgeNumber ?? "-"}`}>
        <div style={{ display: "grid", gap: 10 }}>
          <div><StatusPill value={member.status} /></div>
          <div className="uo-card" style={{ padding: 12 }}><div className="uo-muted">Identity block</div><div>Discord: {member.user.discordId}</div><div>Division: {member.rosterEntry.division?.name ?? "-"}</div><div>Callsign: {member.rosterEntry.callsign ?? "-"}</div></div>
          <div className="uo-card" style={{ padding: 12 }}><div className="uo-muted">Certifications</div><div>ATLS, ALS, Instructor (placeholder cert matrix until schema lands).</div></div>
          <div className="uo-card" style={{ padding: 12 }}><div className="uo-muted">Discipline</div><div>0 active strikes • placeholder discipline feed.</div></div>
          <div className="uo-card" style={{ padding: 12 }}><div className="uo-muted">Quota status</div><div>Monthly quota met • placeholder quota service.</div></div>
        </div>
      </SectionCard>

      <SectionCard title="Edit member profile" subtitle="Live update wired to roster service.">
        <form action={updateAction} style={{ display: "grid", gap: 10 }}>
          <input className="uo-input" name="nickname" defaultValue={member.nickname ?? ""} placeholder="Nickname" />
          <input className="uo-input" name="callsign" defaultValue={member.rosterEntry.callsign ?? ""} placeholder="Callsign" />
          <input className="uo-input" name="badgeNumber" defaultValue={member.rosterEntry.badgeNumber ?? ""} placeholder="Badge number" />
          <select className="uo-input" name="rankId" defaultValue={member.rosterEntry.rankId ?? ""}><option value="">None</option>{ranks.map((rank) => <option key={rank.id} value={rank.id}>{rank.name}</option>)}</select>
          <select className="uo-input" name="divisionId" defaultValue={member.rosterEntry.divisionId ?? ""}><option value="">None</option>{divisions.map((division) => <option key={division.id} value={division.id}>{division.name}</option>)}</select>
          <button className="uo-btn uo-btn-primary" type="submit">Save changes</button>
        </form>
      </SectionCard>
    </div>
  </main>;
}
