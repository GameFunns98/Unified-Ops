import { prisma } from "../prisma";
import { writeAuditLog } from "../audit/write-audit-log";

export async function syncMemberToDiscord(guildId: string, memberId: string) {
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

  const job = await prisma.discordSyncJob.create({
    data: {
      guildId,
      rosterEntryId: member.rosterEntry?.id,
      jobType: "MEMBER_SYNC",
      status: "QUEUED",
      payload: {
        guildMemberId: member.id,
        discordId: member.user.discordId,
        nickname: member.nickname,
        callsign: member.callsign,
        badgeNumber: member.badgeNumber,
        rankDiscordRoleId: member.rosterEntry?.rank?.discordRoleId ?? null
      }
    }
  });

  await writeAuditLog({
    guildId,
    actorType: "SYSTEM",
    entityType: "DISCORD_SYNC_JOB",
    entityId: job.id,
    action: "discord.sync.queued",
    summary: `Queued Discord sync for member ${member.id}`,
    payload: { guildMemberId: member.id }
  });

  return job;
}