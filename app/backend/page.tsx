import { DataTable, SectionCard, StatCard } from "@/src/components/ops-ui";

export default function BackendPage() {
  return <main style={{ display: "grid", gap: 16 }}>
    <div className="uo-grid-4">
      <StatCard title="Core Services" value={6} sub="Auth, API, bot, jobs, storage, audit" />
      <StatCard title="Primary DB" value="Postgres" sub="Prisma ORM" />
      <StatCard title="Queue" value="Redis" sub="BullMQ workers" />
      <StatCard title="Realtime" value="Discord Bot" sub="Roles and nicknames" />
    </div>
    <div className="uo-grid-split">
      <SectionCard title="Backend blueprint" subtitle="Production architecture outline."><div style={{ display: "grid", gap: 10 }}>{[["Frontend", "Next.js app router"],["API","Route handlers"],["Database","PostgreSQL + Prisma"],["Bot service","Discord sync worker"],["Jobs","BullMQ"],["Storage","S3 compatible"]].map(([n,d]) => <div key={n} className="uo-card" style={{padding:12}}><strong>{n}</strong><div className="uo-muted">{d}</div></div>)}</div></SectionCard>
      <SectionCard title="Core API routes" subtitle="High-impact module endpoints.">
        <DataTable columns={["Method", "Route", "Purpose"]}>{[["GET","/api/guilds/:id/dashboard","Unified metrics"],["POST","/api/applications/:templateId/submit","Public submission"],["POST","/api/applications/:id/decision","Accept/reject"],["PATCH","/api/roster/:memberId","Update roster member"],["POST","/api/shifts/start","Start shift"],["POST","/api/tickets/panels","Create panel"],["POST","/api/discord/sync/:memberId","Sync identity"]].map((r) => <tr key={r[1]}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td></tr>)}</DataTable>
      </SectionCard>
    </div>
  </main>;
}
