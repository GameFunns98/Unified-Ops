import { SectionCard } from "@/src/components/ops-ui";

export default function TeamPage() {
  return <main><SectionCard title="Team & Roles" subtitle="Reviewer, HR, command and admin permission model."><div className="uo-grid-4">{[["Owner","Full access"],["Command","Roster + tickets + approvals"],["HR","Applications + interviews"],["Supervisor","Shift reviews + quotas"]].map(([r,a]) => <div key={r} className="uo-card" style={{padding:14}}><strong>{r}</strong><div className="uo-muted">{a}</div></div>)}</div></SectionCard></main>;
}
