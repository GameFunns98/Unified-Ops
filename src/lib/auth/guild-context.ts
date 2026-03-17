import type { AppSession } from "./session";

export function getCurrentGuildContext(session: AppSession, requestedGuildId?: string) {
  if (requestedGuildId && requestedGuildId !== session.guildId) {
    throw new Error("FORBIDDEN_GUILD");
  }

  return {
    guildId: session.guildId,
    guildName: session.guildName
  };
}
