import { ShiftStatus } from "@prisma/client";
import { prisma } from "../../prisma";
import { writeAuditLog } from "../../audit/write-audit-log";

type StartShiftInput = {
  guildId: string;
  userId: string;
  rosterEntryId: string;
};

export async function startShift(input: StartShiftInput) {
  const existing = await prisma.shift.findFirst({
    where: {
      guildId: input.guildId,
      userId: input.userId,
      status: ShiftStatus.ACTIVE
    }
  });

  if (existing) {
    throw new Error("User already has an active shift.");
  }

  const shift = await prisma.shift.create({
    data: {
      guildId: input.guildId,
      userId: input.userId,
      rosterEntryId: input.rosterEntryId,
      status: ShiftStatus.ACTIVE,
      startedAt: new Date()
    }
  });

  await writeAuditLog({
    guildId: input.guildId,
    actorType: "USER",
    actorUserId: input.userId,
    entityType: "SHIFT",
    entityId: shift.id,
    action: "shift.started",
    summary: `Shift ${shift.id} started`
  });

  return shift;
}