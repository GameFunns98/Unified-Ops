import { fail, ok } from "@/src/lib/api/response";
import { authErrorResponse, getRequestContext } from "@/src/lib/api/auth";
import { syncMemberToDiscord } from "@/src/lib/discord/sync-member";

type Params = {
  params: Promise<{ memberId: string }>;
};

export async function POST(request: Request, { params }: Params) {
  try {
    const ctx = await getRequestContext(request);

    if (!ctx.can("SUPERVISOR")) {
      return fail("Insufficient permissions.", 403);
    }

    const { memberId } = await params;
    const job = await syncMemberToDiscord(ctx.guildId, memberId, ctx.userId);
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
