import { AuditActorType, AuditEntityType, Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { toPrismaNullableJsonValue } from "../prisma-json";

type WriteAuditLogInput = {
  guildId: string;
  actorType: AuditActorType;
  actorUserId?: string;
  entityType: AuditEntityType;
  entityId: string;
  action: string;
  summary?: string;
  payload?: Prisma.JsonValue;
  applicationSubmissionId?: string;
};

export async function writeAuditLog(input: WriteAuditLogInput) {
  return prisma.auditLog.create({
    data: {
      guildId: input.guildId,
      actorType: input.actorType,
      actorUserId: input.actorUserId,
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      summary: input.summary,
      payload: toPrismaNullableJsonValue(input.payload),
      applicationSubmissionId: input.applicationSubmissionId
    }
  });
}
