export const dynamic = "force-dynamic";

import { ShiftStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { startShift } from "@/src/lib/services/shifts/start-shift";
import { prisma } from "@/src/lib/prisma";
import { getAppSession } from "@/src/lib/auth/session";

export default async function ShiftsPage() {
  const session = await getAppSession();

  const [myMember, shifts] = await Promise.all([
    prisma.guildMember.findFirst({
      where: { guildId: session.guildId, userId: session.userId },
      include: { rosterEntry: true }
    }),
    prisma.shift.findMany({
      where: { guildId: session.guildId },
      include: { user: true },
      orderBy: { startedAt: "desc" },
      take: 20
    })
  ]);

  async function startAction() {
    "use server";
    const session = await getAppSession();
    const member = await prisma.guildMember.findFirst({
      where: { guildId: session.guildId, userId: session.userId },
      include: { rosterEntry: true }
    });

    if (!member?.rosterEntry) {
      throw new Error("Roster entry not found. Accept an application first.");
    }

    await startShift({ guildId: session.guildId, userId: session.userId, rosterEntryId: member.rosterEntry.id });

    revalidatePath("/shifts");
    revalidatePath("/");
  }

  const hasRoster = Boolean(myMember?.rosterEntry);
  const hasActive = shifts.some((shift) => shift.userId === session.userId && shift.status === ShiftStatus.ACTIVE);

  return (
    <main style={{ display: "grid", gap: 16 }}>
      <section style={{ background: "white", padding: 16, borderRadius: 8, border: "1px solid #e2e8f0" }}>
        <h2>Shift control</h2>
        <p>Roster state: {hasRoster ? "Ready" : "No roster entry"}</p>
        <p>Current shift: {hasActive ? "Active" : "Not on shift"}</p>
        <form action={startAction}>
          <button type="submit" disabled={!hasRoster || hasActive}>
            Start shift
          </button>
        </form>
      </section>

      <section style={{ background: "white", padding: 16, borderRadius: 8, border: "1px solid #e2e8f0" }}>
        <h2>Recent shifts</h2>
        <ul>
          {shifts.map((shift) => (
            <li key={shift.id}>
              {(shift.user.globalName ?? shift.user.username)} - {shift.status} - {shift.startedAt.toLocaleString()}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
