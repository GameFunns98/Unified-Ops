import { canActAs } from "@/src/lib/auth/permissions";
import { getAppSession } from "@/src/lib/auth/session";
import { getCurrentGuildContext } from "@/src/lib/auth/guild-context";
import { fail } from "./response";

export type RequestContext = {
  userId: string;
  guildId: string;
  role?: string;
  can: (minimumRole: string) => boolean;
};

export async function getRequestContext(request: Request, requestedGuildId?: string): Promise<RequestContext> {
  const session = await getAppSession(request);
  const guild = getCurrentGuildContext(session, requestedGuildId);

  return {
    userId: session.userId,
    guildId: guild.guildId,
    role: session.role,
    can: (minimumRole: string) => canActAs(session, minimumRole)
  };
}

export function authErrorResponse(error: unknown) {
  if (error instanceof Error && error.message === "UNAUTHENTICATED") {
    return fail("Authentication required.", 401);
  }

  if (error instanceof Error && error.message === "FORBIDDEN_GUILD") {
    return fail("Unauthorized guild context.", 403);
  }

  return fail("Unauthorized.", 403);
}
