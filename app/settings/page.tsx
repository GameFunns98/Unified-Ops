import { SectionCard } from "@/src/components/ops-ui";

export default function SettingsPage() {
  return <main><SectionCard title="Guild settings" subtitle="Branding, public pages, module controls and audit."><div className="uo-grid-2">{[["Branding","Logo, colors, icon set"],["Public pages","Application and ticket entry pages"],["Limits","Quota rules and reviewer caps"],["Audit","Event history and exports"]].map(([n,d]) => <div key={n} className="uo-card" style={{padding:14}}><strong>{n}</strong><div className="uo-muted">{d}</div></div>)}</div></SectionCard></main>;
}
