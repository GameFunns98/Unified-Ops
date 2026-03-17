import { fail } from "./response";

export type RequestContext = {
  userId: string;
  guildId?: string;
  role?: string;
};

export function getRequestContext(request: Request): RequestContext {
  const userId = request.headers.get("x-dev-user-id") ?? "";
  const guildId = request.headers.get("x-dev-guild-id") ?? undefined;
  const role = request.headers.get("x-dev-role") ?? undefined;

  if (!userId) {
    throw new Error("UNAUTHENTICATED");
  }

  return { userId, guildId, role };
}

export function authErrorResponse(error: unknown) {
  if (error instanceof Error && error.message === "UNAUTHENTICATED") {
    return fail("Authentication required.", 401);
  }

  return fail("Unauthorized.", 403);
}