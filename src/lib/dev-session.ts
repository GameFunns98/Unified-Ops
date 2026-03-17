import { GuildRole } from "@prisma/client";
import { prisma } from "@/src/lib/prisma";

export type DevSession = {
  guildId: string;
  guildName: string;
  userId: string;
  role: GuildRole;
};

export async function getDevSession(): Promise<DevSession> {
  const guildSlug = process.env.DEV_GUILD_SLUG ?? "ems-reux-rp";

  const guild = await prisma.guild.findUnique({
    where: { slug: guildSlug },
    include: {
      members: {
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
        include: { user: true }
      }
    }
  });

  if (!guild || guild.members.length === 0) {
    throw new Error(
      "No dev session found. Run migrations and seed the database, then reload."
    );
  }

  const actor = guild.members[0];

  return {
    guildId: guild.id,
    guildName: guild.name,
    userId: actor.userId,
    role: actor.role
  };
}
