export const dynamic = "force-dynamic";

import { revalidatePath } from "next/cache";
import { DataTable, SectionCard, StatCard, StatusPill } from "@/src/components/ops-ui";
import { prisma } from "@/src/lib/prisma";
import { getAppSession } from "@/src/lib/auth/session";

export default async function TicketsPage() {
  const session = await getAppSession();

  const [panels, tickets] = await Promise.all([
    prisma.ticketPanel.findMany({ where: { guildId: session.guildId }, orderBy: { createdAt: "desc" } }),
    prisma.ticket.findMany({ where: { guildId: session.guildId }, orderBy: { createdAt: "desc" }, take: 30 })
  ]);

  async function createPanelAction(formData: FormData) {
    "use server";
    const session = await getAppSession();
    await prisma.ticketPanel.create({ data: { guildId: session.guildId, name: String(formData.get("name") ?? ""), slug: String(formData.get("slug") ?? "") } });
    revalidatePath("/tickets");
  }

  async function createTicketAction(formData: FormData) {
    "use server";
    const session = await getAppSession();
    const panelId = String(formData.get("panelId") ?? "");
    await prisma.ticket.create({ data: { guildId: session.guildId, panelId: panelId || null, createdById: session.userId, title: String(formData.get("title") ?? ""), description: String(formData.get("description") ?? "") || null } });
    revalidatePath("/tickets"); revalidatePath("/");
  }

  return <main style={{ display: "grid", gap: 16 }}>
    <div className="uo-grid-4">
      <StatCard title="Open tickets" value={tickets.filter((t) => ["OPEN", "IN_PROGRESS", "WAITING"].includes(t.status)).length} sub="Live queue" />
      <StatCard title="Avg response" value="12m" sub="Placeholder SLA metric" />
      <StatCard title="Resolved" value={tickets.filter((t) => t.status === "RESOLVED").length} sub="Historical count" />
      <StatCard title="Satisfaction" value="4.8/5" sub="Placeholder feedback module" />
    </div>

    <div className="uo-grid-split">
      <SectionCard title="Ticket overview" subtitle="Panel builder, reviews and queue controls.">
        <form action={createPanelAction} style={{ display: "grid", gap: 8, marginBottom: 10 }}>
          <input className="uo-input" name="name" placeholder="Panel name" required />
          <input className="uo-input" name="slug" placeholder="panel-slug" required />
          <button className="uo-btn uo-btn-primary" type="submit">Create panel</button>
        </form>
        <form action={createTicketAction} style={{ display: "grid", gap: 8 }}>
          <input className="uo-input" name="title" placeholder="Ticket title" required />
          <textarea className="uo-input" name="description" rows={3} placeholder="Description" />
          <select className="uo-input" name="panelId" defaultValue=""><option value="">No panel</option>{panels.map((p) => <option value={p.id} key={p.id}>{p.name}</option>)}</select>
          <button className="uo-btn" type="submit">Create ticket</button>
        </form>
      </SectionCard>

      <SectionCard title="Panel preview" subtitle="Dark Discord-like embed preview.">
        <div className="uo-card" style={{ padding: 12 }}><div className="uo-muted">Embed title</div><div>Create a ticket</div></div>
        <div className="uo-card" style={{ padding: 12, marginTop: 8 }}><div className="uo-muted">Discord preview</div><div style={{ borderLeft: "4px solid #7c3aed", padding: 10, marginTop: 8, background: "#232428", borderRadius: 8 }}>Please click button below to create support ticket.</div></div>
      </SectionCard>
    </div>

    <SectionCard title="Ticket queue" subtitle="Filtered by status, priority and type.">
      <DataTable columns={["ID", "Title", "Priority", "Assignee", "Status"]}>{tickets.map((t) => <tr key={t.id}><td>{t.id.slice(0, 8)}</td><td>{t.title}</td><td>{t.priority}</td><td>{t.assignedToId ?? "Unassigned"}</td><td><StatusPill value={t.status} /></td></tr>)}</DataTable>
    </SectionCard>
  </main>;
}
