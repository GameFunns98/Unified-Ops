import { prisma } from "../prisma";
import { DISCORD_SYNC_JOB_TYPES, enqueueDiscordSyncJob } from "./sync-jobs";

export async function syncMemberToDiscord(guildId: string, memberId: string, actorUserId?: string) {
  const member = await prisma.guildMember.findFirst({
    where: {
      id: memberId,
      guildId
    },
    include: {
      user: true,
      rosterEntry: {
        include: {
          rank: true
        }
      }
    }
  });

  if (!member) {
    throw new Error("Member not found.");
  }

  return enqueueDiscordSyncJob({
    guildId,
    rosterEntryId: member.rosterEntry?.id,
    actorUserId,
    jobType: DISCORD_SYNC_JOB_TYPES.MEMBER_SYNC,
    summary: `Queued Discord sync for member ${member.id}`,
    payload: {
      guildMemberId: member.id,
      discordId: member.user.discordId,
      nickname: member.nickname,
      callsign: member.callsign,
      badgeNumber: member.badgeNumber,
      rankDiscordRoleId: member.rosterEntry?.rank?.discordRoleId ?? null
    }
  });
}
