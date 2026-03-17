import { prisma } from "@/src/lib/prisma";
import { writeAuditLog } from "@/src/lib/audit/write-audit-log";

export const DISCORD_SYNC_JOB_TYPES = {
  MEMBER_SYNC: "MEMBER_SYNC"
} as const;

export type DiscordSyncJobType = (typeof DISCORD_SYNC_JOB_TYPES)[keyof typeof DISCORD_SYNC_JOB_TYPES];

export type MemberSyncPayload = {
  guildMemberId: string;
  discordId: string;
  nickname: string | null;
  callsign: string | null;
  badgeNumber: string | null;
  rankDiscordRoleId: string | null;
};

export function normalizeMemberSyncPayload(payload: MemberSyncPayload): MemberSyncPayload {
  return {
    guildMemberId: payload.guildMemberId,
    discordId: payload.discordId,
    nickname: payload.nickname ?? null,
    callsign: payload.callsign ?? null,
    badgeNumber: payload.badgeNumber ?? null,
    rankDiscordRoleId: payload.rankDiscordRoleId ?? null
  };
}

export async function enqueueDiscordSyncJob(input: {
  guildId: string;
  rosterEntryId?: string | null;
  actorUserId?: string;
  jobType: DiscordSyncJobType;
  payload: MemberSyncPayload;
  summary: string;
}) {
  const payload = normalizeMemberSyncPayload(input.payload);

  const job = await prisma.discordSyncJob.create({
    data: {
      guildId: input.guildId,
      rosterEntryId: input.rosterEntryId,
      jobType: input.jobType,
      status: "QUEUED",
      payload
    }
  });

  await writeAuditLog({
    guildId: input.guildId,
    actorType: input.actorUserId ? "USER" : "SYSTEM",
    actorUserId: input.actorUserId,
    entityType: "DISCORD_SYNC_JOB",
    entityId: job.id,
    action: "discord.sync.queued",
    summary: input.summary,
    payload: {
      jobType: input.jobType,
      payload
    }
  });

  return job;
}
