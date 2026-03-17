export const dynamic = "force-dynamic";

import { ReviewDecision } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { decideApplication } from "@/src/lib/services/applications/decide-application";
import { submitApplication } from "@/src/lib/services/applications/submit-application";
import { prisma } from "@/src/lib/prisma";
import { getDevSession } from "@/src/lib/dev-session";

export default async function ApplicationsPage() {
  const session = await getDevSession();

  const [templates, submissions] = await Promise.all([
    prisma.applicationTemplate.findMany({
      where: { guildId: session.guildId },
      include: { fields: { orderBy: { sortOrder: "asc" } } },
      orderBy: { createdAt: "asc" }
    }),
    prisma.applicationSubmission.findMany({
      where: { guildId: session.guildId },
      include: { applicant: true, template: true },
      orderBy: { createdAt: "desc" },
      take: 20
    })
  ]);

  const primaryTemplate = templates[0];

  async function submitAction(formData: FormData) {
    "use server";
    const session = await getDevSession();
    const templateId = String(formData.get("templateId") ?? "");
    const fieldId = String(formData.get("fieldId") ?? "");
    const answer = String(formData.get("answer") ?? "");

    await submitApplication({
      guildId: session.guildId,
      templateId,
      applicantId: session.userId,
      answers: [{ fieldId, valueText: answer }]
    });

    revalidatePath("/applications");
    revalidatePath("/");
  }

  async function decisionAction(formData: FormData) {
    "use server";
    const session = await getDevSession();
    const submissionId = String(formData.get("submissionId") ?? "");
    const decision = String(formData.get("decision") ?? "REJECT") as ReviewDecision;

    await decideApplication({
      guildId: session.guildId,
      submissionId,
      reviewerId: session.userId,
      decision
    });

    revalidatePath("/applications");
    revalidatePath("/roster");
    revalidatePath("/");
  }

  return (
    <main style={{ display: "grid", gap: 20 }}>
      <section style={{ background: "white", padding: 16, borderRadius: 8, border: "1px solid #e2e8f0" }}>
        <h2>Application templates</h2>
        <ul>
          {templates.map((template) => (
            <li key={template.id}>
              <strong>{template.name}</strong> ({template.status}) - {template.fields.length} fields
            </li>
          ))}
        </ul>
      </section>

      {primaryTemplate && primaryTemplate.fields[0] && (
        <section style={{ background: "white", padding: 16, borderRadius: 8, border: "1px solid #e2e8f0" }}>
          <h2>Submit application ({primaryTemplate.name})</h2>
          <form action={submitAction} style={{ display: "grid", gap: 8, maxWidth: 500 }}>
            <input type="hidden" name="templateId" value={primaryTemplate.id} />
            <input type="hidden" name="fieldId" value={primaryTemplate.fields[0].id} />
            <label htmlFor="answer">{primaryTemplate.fields[0].label}</label>
            <textarea id="answer" name="answer" required rows={4} />
            <button type="submit">Submit</button>
          </form>
        </section>
      )}

      <section style={{ background: "white", padding: 16, borderRadius: 8, border: "1px solid #e2e8f0" }}>
        <h2>Submissions</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">Template</th>
              <th align="left">Applicant</th>
              <th align="left">Status</th>
              <th align="left">Action</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <tr key={submission.id}>
                <td>{submission.template.name}</td>
                <td>{submission.applicant.globalName ?? submission.applicant.username}</td>
                <td>{submission.status}</td>
                <td>
                  <form action={decisionAction} style={{ display: "inline-flex", gap: 6 }}>
                    <input type="hidden" name="submissionId" value={submission.id} />
                    <button name="decision" value="ACCEPT" type="submit">
                      Accept
                    </button>
                    <button name="decision" value="REJECT" type="submit">
                      Reject
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
