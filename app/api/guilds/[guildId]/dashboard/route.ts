import { ShiftStatus, SubmissionStatus, TicketStatus } from "@prisma/client";
import { prisma } from "@/src/lib/prisma";
import { ok, fail } from "@/src/lib/api/response";
import { authErrorResponse, getRequestContext } from "@/src/lib/api/auth";

type Params = {
  params: Promise<{ guildId: string }>;
};

export async function GET(request: Request, { params }: Params) {
  try {
    const { guildId } = await params;
    await getRequestContext(request, guildId);

    const [applications, pendingReview, activeMembers, onShift, openTickets] = await Promise.all([
      prisma.applicationSubmission.count({ where: { guildId } }),
      prisma.applicationSubmission.count({
        where: {
          guildId,
          status: {
            in: [SubmissionStatus.SUBMITTED, SubmissionStatus.IN_REVIEW, SubmissionStatus.INTERVIEW]
          }
        }
      }),
      prisma.guildMember.count({ where: { guildId, isActive: true } }),
      prisma.shift.count({ where: { guildId, status: ShiftStatus.ACTIVE } }),
      prisma.ticket.count({
        where: {
          guildId,
          status: {
            in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.WAITING]
          }
        }
      })
    ]);

    return ok({
      metrics: {
        applications,
        pendingReview,
        activeMembers,
        onShift,
        openTickets
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return authErrorResponse(error);
    }

    return fail("Failed to load dashboard.", 500);
  }
}
