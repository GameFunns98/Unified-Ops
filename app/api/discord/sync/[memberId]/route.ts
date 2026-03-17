import { fail, ok } from "@/src/lib/api/response";
import { authErrorResponse, getRequestContext } from "@/src/lib/api/auth";
import { hasMinimumRole } from "@/src/lib/api/permissions";
import { syncMemberToDiscord } from "@/src/lib/discord/sync-member";

type Params = {
  params: Promise<{ memberId: string }>;
};

export async function POST(request: Request, { params }: Params) {
  try {
    const ctx = getRequestContext(request);

    if (!hasMinimumRole(ctx.role, "SUPERVISOR")) {
      return fail("Insufficient permissions.", 403);
    }

    const { memberId } = await params;
    const guildId = request.headers.get("x-dev-guild-id");

    if (!guildId) {
      return fail("Missing guild context.", 400);
    }

    const job = await syncMemberToDiscord(guildId, memberId);
    return ok(job);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return authErrorResponse(error);
    }

    if (error instanceof Error) {
      return fail(error.message, 400);
    }

    return fail("Failed to queue Discord sync.", 500);
  }
}