import { GuildRole } from "@prisma/client";
import { getDevSession } from "@/src/lib/dev-session";

export type AuthMode = "dev" | "discord_oauth";

export type AppSession = {
  userId: string;
  guildId: string;
  guildName?: string;
  role?: GuildRole;
  mode: AuthMode;
};

export function getAuthMode(): AuthMode {
  return process.env.AUTH_MODE === "discord_oauth" ? "discord_oauth" : "dev";
}

function getOAuthRequestSession(request: Request): AppSession {
  const userId = request.headers.get("x-auth-user-id") ?? "";
  const guildId = request.headers.get("x-auth-guild-id") ?? "";
  const roleHeader = request.headers.get("x-auth-role");

  if (!userId || !guildId) {
    throw new Error("UNAUTHENTICATED");
  }

  return {
    userId,
    guildId,
    role: roleHeader ? (roleHeader as GuildRole) : undefined,
    mode: "discord_oauth"
  };
}

export async function getAppSession(request?: Request): Promise<AppSession> {
  const mode = getAuthMode();

  if (mode === "dev") {
    const dev = await getDevSession();
    return {
      userId: dev.userId,
      guildId: dev.guildId,
      guildName: dev.guildName,
      role: dev.role,
      mode
    };
  }

  if (!request) {
    throw new Error("UNAUTHENTICATED");
  }

  return getOAuthRequestSession(request);
}
