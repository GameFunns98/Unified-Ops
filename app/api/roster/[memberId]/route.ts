import { z } from "zod";
import { parseJson } from "@/src/lib/api/validation";
import { fail, ok } from "@/src/lib/api/response";
import { authErrorResponse, getRequestContext } from "@/src/lib/api/auth";
import { hasMinimumRole } from "@/src/lib/api/permissions";
import { updateRosterMember } from "@/src/lib/services/roster/update-roster-member";

const patchSchema = z.object({
  guildId: z.string().min(1),
  rankId: z.string().nullable().optional(),
  divisionId: z.string().nullable().optional(),
  callsign: z.string().nullable().optional(),
  badgeNumber: z.string().nullable().optional(),
  nickname: z.string().nullable().optional()
});

type Params = {
  params: Promise<{ memberId: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const ctx = getRequestContext(request);

    if (!hasMinimumRole(ctx.role, "SUPERVISOR")) {
      return fail("Insufficient permissions.", 403);
    }

    const body = await parseJson(request, patchSchema);
    const { memberId } = await params;

    const result = await updateRosterMember({
      guildId: body.guildId,
      memberId,
      actorUserId: ctx.userId,
      rankId: body.rankId,
      divisionId: body.divisionId,
      callsign: body.callsign,
      badgeNumber: body.badgeNumber,
      nickname: body.nickname
    });

    return ok(result);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return authErrorResponse(error);
    }

    if (error instanceof z.ZodError) {
      return fail("Invalid request body.", 422, error.flatten());
    }

    if (error instanceof Error) {
      return fail(error.message, 400);
    }

    return fail("Failed to update roster member.", 500);
  }
}