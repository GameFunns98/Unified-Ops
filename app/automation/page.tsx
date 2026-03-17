import { SectionCard, StatusPill } from "@/src/components/ops-ui";

export default function AutomationPage() {
  return <main className="uo-grid-2">
    <SectionCard title="Automation rules" subtitle="Cross-module triggers and actions.">
      <div style={{ display: "grid", gap: 10 }}>{[
        ["Accepted applicant", "Create roster record, assign probation rank and sync Discord roles"],
        ["Strike threshold reached", "Open internal review ticket and notify command"],
        ["Quota missed", "Flag member and send reminder"],
        ["Certification expired", "Restrict advanced division eligibility"]
      ].map(([n, d]) => <div key={n} className="uo-card" style={{ padding: 12 }}><strong>{n}</strong><div className="uo-muted">{d}</div></div>)}</div>
    </SectionCard>
    <SectionCard title="Integrations" subtitle="Discord, webhooks, audit export and jobs.">
      <div style={{ display: "grid", gap: 10 }}>{[["Discord bot", "Connected"], ["Webhook events", "12 active"], ["Audit export", "Enabled"], ["Nightly backups", "Healthy"]].map(([n, s]) => <div key={n} className="uo-card" style={{ padding: 12, display: "flex", justifyContent: "space-between" }}><span>{n}</span><StatusPill value={s} /></div>)}</div>
    </SectionCard>
  </main>;
}
