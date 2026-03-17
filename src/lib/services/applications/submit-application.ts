import { LimitType, SubmissionStatus } from "@prisma/client";
import { prisma } from "../../prisma";
import { writeAuditLog } from "../../audit/write-audit-log";

type SubmitApplicationInput = {
  guildId: string;
  templateId: string;
  applicantId: string;
  answers: Array<{
    fieldId: string;
    valueText?: string;
    valueJson?: unknown;
  }>;
};

export async function submitApplication(input: SubmitApplicationInput) {
  const template = await prisma.applicationTemplate.findFirst({
    where: {
      id: input.templateId,
      guildId: input.guildId
    },
    include: {
      workflowDefinition: {
        include: {
          stages: {
            orderBy: { sortOrder: "asc" }
          }
        }
      },
      limits: true
    }
  });

  if (!template) {
    throw new Error("Template not found.");
  }

  const maxActiveLimit = template.limits.find((limit) => limit.type === LimitType.MAX_ACTIVE_SUBMISSIONS);

  if (maxActiveLimit) {
    const maxAllowed = Number(maxActiveLimit.value);
    const activeCount = await prisma.applicationSubmission.count({
      where: {
        templateId: template.id,
        applicantId: input.applicantId,
        status: {
          in: [SubmissionStatus.SUBMITTED, SubmissionStatus.IN_REVIEW, SubmissionStatus.INTERVIEW]
        }
      }
    });

    if (activeCount >= maxAllowed) {
      throw new Error("Active submission limit reached.");
    }
  }

  const firstStage = template.workflowDefinition?.stages[0] ?? null;

  const submission = await prisma.applicationSubmission.create({
    data: {
      guildId: input.guildId,
      templateId: template.id,
      applicantId: input.applicantId,
      currentStageId: firstStage?.id,
      status: SubmissionStatus.SUBMITTED,
      submittedAt: new Date(),
      answers: {
        create: input.answers.map((answer) => ({
          fieldId: answer.fieldId,
          valueText: answer.valueText,
          valueJson: answer.valueJson as never
        }))
      },
      metadata: {
        source: "public-form"
      }
    }
  });

  await writeAuditLog({
    guildId: input.guildId,
    actorType: "USER",
    actorUserId: input.applicantId,
    entityType: "APPLICATION_SUBMISSION",
    entityId: submission.id,
    action: "application.submitted",
    summary: `Submission ${submission.id} created from template ${template.name}`,
    applicationSubmissionId: submission.id
  });

  return submission;
}