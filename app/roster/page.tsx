export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import { getAppSession } from "@/src/lib/auth/session";

export default async function RosterPage() {
  const session = await getAppSession();

  const members = await prisma.guildMember.findMany({
    where: { guildId: session.guildId },
    include: {
      user: true,
      rosterEntry: {
        include: { rank: true, division: true }
      }
    },
    orderBy: { createdAt: "asc" }
  });

  return (
    <main style={{ background: "white", padding: 16, borderRadius: 8, border: "1px solid #e2e8f0" }}>
      <h2>Roster members</h2>
      <ul>
        {members.map((member) => (
          <li key={member.id}>
            <Link href={`/roster/${member.id}`}>
              {member.nickname ?? member.user.globalName ?? member.user.username}
            </Link>{" "}
            - {member.role} - {member.rosterEntry?.rank?.name ?? "No rank"}
          </li>
        ))}
      </ul>
    </main>
  );
}
