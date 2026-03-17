export const dynamic = "force-dynamic";

import Link from "next/link";
import { ApplicationTemplateStatus, ReviewDecision, SubmissionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { decideApplication } from "@/src/lib/services/applications/decide-application";
import { submitApplication } from "@/src/lib/services/applications/submit-application";
import { DataTable, SectionCard, StatCard, StatusPill } from "@/src/components/ops-ui";
import { prisma } from "@/src/lib/prisma";
import { getAppSession } from "@/src/lib/auth/session";

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<{ view?: string; modal?: string }> }) {
  const session = await getAppSession();
  const { view = "templates", modal } = await searchParams;

  const [templates, submissions] = await Promise.all([
    prisma.applicationTemplate.findMany({ where: { guildId: session.guildId }, include: { fields: { orderBy: { sortOrder: "asc" } } }, orderBy: { createdAt: "asc" } }),
    prisma.applicationSubmission.findMany({ where: { guildId: session.guildId }, include: { applicant: true, template: true }, orderBy: { createdAt: "desc" }, take: 30 })
  ]);

  const primaryTemplate = templates[0];
  const pending = submissions.filter((s) => s.status === SubmissionStatus.SUBMITTED || s.status === SubmissionStatus.IN_REVIEW || s.status === SubmissionStatus.INTERVIEW).length;
  const accepted = submissions.filter((s) => s.status === SubmissionStatus.ACCEPTED).length;

  async function submitAction(formData: FormData) {
    "use server";
    const session = await getAppSession();
    await submitApplication({ guildId: session.guildId, templateId: String(formData.get("templateId") ?? ""), applicantId: session.userId, answers: [{ fieldId: String(formData.get("fieldId") ?? ""), valueText: String(formData.get("answer") ?? "") }] });
    revalidatePath("/applications"); revalidatePath("/");
  }

  async function decisionAction(formData: FormData) {
    "use server";
    const session = await getAppSession();
    await decideApplication({ guildId: session.guildId, submissionId: String(formData.get("submissionId") ?? ""), reviewerId: session.userId, decision: String(formData.get("decision") ?? "REJECT") as ReviewDecision });
    revalidatePath("/applications"); revalidatePath("/roster"); revalidatePath("/");
  }

  return <main style={{ display: "grid", gap: 16 }}>
    <div className="uo-grid-4">
      <StatCard title="Live Templates" value={templates.length} sub="Public and internal" />
      <StatCard title="Pending Review" value={pending} sub="Needs reviewer action" />
      <StatCard title="Accepted" value={accepted} sub="Auto-sync enabled" />
      <StatCard title="Flagged" value={2} sub="Placeholder until risk engine exists" />
    </div>

    <SectionCard title="Applications Control Center" subtitle="Templates, queue, workflows, public page and limits/risk.">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        {["templates", "queue", "workflows", "public", "limits"].map((id) => <Link key={id} className="uo-btn" style={view === id ? { background: "#7c3aed", color: "white", borderColor: "transparent" } : undefined} href={`/applications?view=${id}`}>{id === "public" ? "Public Page" : id === "limits" ? "Limits & Risk" : id[0].toUpperCase() + id.slice(1)}</Link>)}
      </div>

      {view === "templates" && <div style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link className="uo-btn uo-btn-primary" href="/applications?view=templates&modal=template">Create Template</Link>
          <button className="uo-btn">Import Template</button><button className="uo-btn">Clone Existing</button>
        </div>
        <div className="uo-grid-2">{templates.map((t) => <div key={t.id} className="uo-card" style={{ padding: 14 }}><div style={{ display: "flex", justifyContent: "space-between" }}><strong>{t.name}</strong><StatusPill value={t.status} /></div><div className="uo-muted">{t.fields.length} fields • {t.isPublic ? "Public" : "Internal"}</div></div>)}</div>
      </div>}

      {view === "queue" && <div style={{ display: "grid", gap: 12 }}>
        <DataTable columns={["Template", "Applicant", "Stage", "Submitted", "Action"]}>{submissions.map((s) => <tr key={s.id}><td>{s.template.name}</td><td>{s.applicant.globalName ?? s.applicant.username}</td><td><StatusPill value={s.status} /></td><td>{s.createdAt.toLocaleString()}</td><td><form action={decisionAction} style={{ display: "inline-flex", gap: 6 }}><input type="hidden" name="submissionId" value={s.id} /><button className="uo-btn" name="decision" value={ReviewDecision.ACCEPT}>Accept</button><button className="uo-btn" name="decision" value={ReviewDecision.REJECT}>Reject</button></form></td></tr>)}</DataTable>
      </div>}

      {view === "workflows" && <div className="uo-grid-2">{[["Submitted", "Queue + notify HR"], ["Pending Review", "Assign reviewer + checks"], ["Interview", "Scoring checklist"], ["Accepted", "Create roster + sync"], ["Rejected", "Archive + cooldown"]].map(([t, d], i) => <div key={t} className="uo-card" style={{ padding: 14 }}><strong>{i + 1}. {t}</strong><div className="uo-muted">{d}</div></div>)}</div>}

      {view === "public" && <div className="uo-grid-split"><div className="uo-card" style={{ padding: 14 }}><strong>Public page settings</strong><div className="uo-muted">Placeholder controls kept until backend config model exists.</div></div><div className="uo-card" style={{ padding: 14 }}><strong>Public application preview</strong><div className="uo-muted">Dark Discord-styled embed and application card preview.</div></div></div>}

      {view === "limits" && <div className="uo-grid-2"><DataTable columns={["Rule", "Scope", "Value", "State"]}>{[["Cooldown after reject", "Per user", "30 days", "Healthy"], ["Max active submissions", "Per user", "2", "Healthy"], ["Appeal limit", "Template", "1 open", "Healthy"]].map((r) => <tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td><StatusPill value={r[3]} /></td></tr>)}</DataTable><div style={{ display: "grid", gap: 10 }}><div className="uo-card" style={{ padding: 14 }}><strong>Risk signals</strong><div className="uo-muted">Placeholder risk heuristics isolated for future service wiring.</div></div><div className="uo-card" style={{ padding: 14 }}><strong>Escalation actions</strong><div className="uo-muted">Manual-review and ticket escalation placeholders.</div></div></div></div>}
    </SectionCard>

    {primaryTemplate?.fields[0] && <SectionCard title="Quick submit" subtitle="Live submission path remains functional."><form action={submitAction} style={{ display: "grid", gap: 8, maxWidth: 560 }}><input type="hidden" name="templateId" value={primaryTemplate.id} /><input type="hidden" name="fieldId" value={primaryTemplate.fields[0].id} /><label>{primaryTemplate.fields[0].label}</label><textarea name="answer" className="uo-input" rows={4} required /><button className="uo-btn uo-btn-primary" type="submit">Submit application</button></form></SectionCard>}

    {modal === "template" && <section className="uo-card" style={{ borderColor: "rgba(124,58,237,.35)" }}><div className="uo-card-h"><h3 style={{ margin: 0 }}>Create Application Template</h3><Link href="/applications?view=templates" className="uo-btn">Close</Link></div><div className="uo-card-b"><div className="uo-grid-2"><div style={{ display: "grid", gap: 8 }}><input className="uo-input" placeholder="Template name" /><textarea className="uo-input" rows={4} placeholder="Description" /><select className="uo-input"><option>Workflow</option></select></div><div className="uo-card" style={{ padding: 12 }}><strong>Template preview</strong><div className="uo-muted">General, requirements, limits and workflow steps preview.</div></div></div></div></section>}
  </main>;
}
