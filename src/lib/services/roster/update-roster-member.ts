import { prisma } from "../../prisma";
import { writeAuditLog } from "../../audit/write-audit-log";
import { syncMemberToDiscord } from "../../discord/sync-member";

type UpdateRosterMemberInput = {
  guildId: string;
  memberId: string;
  actorUserId: string;
  rankId?: string | null;
  divisionId?: string | null;
  callsign?: string | null;
  badgeNumber?: string | null;
  nickname?: string | null;
};

export async function updateRosterMember(input: UpdateRosterMemberInput) {
  const member = await prisma.guildMember.findFirst({
    where: {
      id: input.memberId,
      guildId: input.guildId
    },
    include: {
      rosterEntry: true
    }
  });

  if (!member || !member.rosterEntry) {
    throw new Error("Roster member not found.");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const rosterEntry = await tx.rosterEntry.update({
      where: { id: member.rosterEntry!.id },
      data: {
        rankId: input.rankId === undefined ? undefined : input.rankId,
        divisionId: input.divisionId === undefined ? undefined : input.divisionId,
        callsign: input.callsign === undefined ? undefined : input.callsign,
        badgeNumber: input.badgeNumber === undefined ? undefined : input.badgeNumber
      }
    });

    const guildMember = await tx.guildMember.update({
      where: { id: member.id },
      data: {
        nickname: input.nickname === undefined ? undefined : input.nickname,
        callsign: input.callsign === undefined ? undefined : input.callsign,
        badgeNumber: input.badgeNumber === undefined ? undefined : input.badgeNumber
      }
    });

    return { rosterEntry, guildMember };
  });

  await writeAuditLog({
    guildId: input.guildId,
    actorType: "USER",
    actorUserId: input.actorUserId,
    entityType: "ROSTER_ENTRY",
    entityId: updated.rosterEntry.id,
    action: "roster.member.updated",
    summary: `Roster member ${updated.rosterEntry.id} updated`,
    payload: {
      rankId: input.rankId,
      divisionId: input.divisionId,
      callsign: input.callsign,
      badgeNumber: input.badgeNumber,
      nickname: input.nickname
    }
  });

  await syncMemberToDiscord(input.guildId, member.id, input.actorUserId);

  return updated;
}