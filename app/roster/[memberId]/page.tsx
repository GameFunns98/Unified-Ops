export const dynamic = "force-dynamic";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { updateRosterMember } from "@/src/lib/services/roster/update-roster-member";
import { prisma } from "@/src/lib/prisma";
import { getDevSession } from "@/src/lib/dev-session";

type Props = {
  params: Promise<{ memberId: string }>;
};

export default async function MemberProfilePage({ params }: Props) {
  const session = await getDevSession();
  const { memberId } = await params;

  const [member, ranks, divisions] = await Promise.all([
    prisma.guildMember.findFirst({
      where: { id: memberId, guildId: session.guildId },
      include: { user: true, rosterEntry: true }
    }),
    prisma.rank.findMany({ where: { guildId: session.guildId }, orderBy: { level: "asc" } }),
    prisma.division.findMany({ where: { guildId: session.guildId }, orderBy: { sortOrder: "asc" } })
  ]);

  if (!member || !member.rosterEntry) {
    notFound();
  }

  async function updateAction(formData: FormData) {
    "use server";
    const session = await getDevSession();

    await updateRosterMember({
      guildId: session.guildId,
      memberId,
      actorUserId: session.userId,
      nickname: String(formData.get("nickname") ?? "") || null,
      callsign: String(formData.get("callsign") ?? "") || null,
      badgeNumber: String(formData.get("badgeNumber") ?? "") || null,
      rankId: String(formData.get("rankId") ?? "") || null,
      divisionId: String(formData.get("divisionId") ?? "") || null
    });

    revalidatePath(`/roster/${memberId}`);
    revalidatePath("/roster");
  }

  return (
    <main style={{ background: "white", padding: 16, borderRadius: 8, border: "1px solid #e2e8f0" }}>
      <h2>Member profile</h2>
      <p>User: {member.user.globalName ?? member.user.username}</p>
      <form action={updateAction} style={{ display: "grid", gap: 8, maxWidth: 420 }}>
        <label>
          Nickname
          <input name="nickname" defaultValue={member.nickname ?? ""} />
        </label>
        <label>
          Callsign
          <input name="callsign" defaultValue={member.rosterEntry.callsign ?? ""} />
        </label>
        <label>
          Badge number
          <input name="badgeNumber" defaultValue={member.rosterEntry.badgeNumber ?? ""} />
        </label>
        <label>
          Rank
          <select name="rankId" defaultValue={member.rosterEntry.rankId ?? ""}>
            <option value="">None</option>
            {ranks.map((rank) => (
              <option key={rank.id} value={rank.id}>
                {rank.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Division
          <select name="divisionId" defaultValue={member.rosterEntry.divisionId ?? ""}>
            <option value="">None</option>
            {divisions.map((division) => (
              <option key={division.id} value={division.id}>
                {division.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Save changes</button>
      </form>
    </main>
  );
}
