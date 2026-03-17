export const dynamic = "force-dynamic";

import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import { getDevSession } from "@/src/lib/dev-session";

export default async function TicketsPage() {
  const session = await getDevSession();

  const [panels, tickets] = await Promise.all([
    prisma.ticketPanel.findMany({ where: { guildId: session.guildId }, orderBy: { createdAt: "desc" } }),
    prisma.ticket.findMany({ where: { guildId: session.guildId }, orderBy: { createdAt: "desc" }, take: 30 })
  ]);

  async function createPanelAction(formData: FormData) {
    "use server";
    const session = await getDevSession();
    await prisma.ticketPanel.create({
      data: {
        guildId: session.guildId,
        name: String(formData.get("name") ?? ""),
        slug: String(formData.get("slug") ?? "")
      }
    });

    revalidatePath("/tickets");
  }

  async function createTicketAction(formData: FormData) {
    "use server";
    const session = await getDevSession();
    const panelId = String(formData.get("panelId") ?? "");

    await prisma.ticket.create({
      data: {
        guildId: session.guildId,
        panelId: panelId || null,
        createdById: session.userId,
        title: String(formData.get("title") ?? ""),
        description: String(formData.get("description") ?? "") || null
      }
    });

    revalidatePath("/tickets");
    revalidatePath("/");
  }

  return (
    <main style={{ display: "grid", gap: 16 }}>
      <section style={{ background: "white", padding: 16, borderRadius: 8, border: "1px solid #e2e8f0" }}>
        <h2>Create ticket panel</h2>
        <form action={createPanelAction} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input name="name" placeholder="Panel name" required />
          <input name="slug" placeholder="panel-slug" required />
          <button type="submit">Create panel</button>
        </form>
      </section>

      <section style={{ background: "white", padding: 16, borderRadius: 8, border: "1px solid #e2e8f0" }}>
        <h2>Create ticket</h2>
        <form action={createTicketAction} style={{ display: "grid", gap: 8, maxWidth: 500 }}>
          <input name="title" placeholder="Ticket title" required />
          <textarea name="description" placeholder="Description" rows={3} />
          <select name="panelId" defaultValue="">
            <option value="">No panel</option>
            {panels.map((panel) => (
              <option key={panel.id} value={panel.id}>
                {panel.name}
              </option>
            ))}
          </select>
          <button type="submit">Create ticket</button>
        </form>
      </section>

      <section style={{ background: "white", padding: 16, borderRadius: 8, border: "1px solid #e2e8f0" }}>
        <h2>Tickets</h2>
        <ul>
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              {ticket.title} - {ticket.status} - {ticket.priority}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
