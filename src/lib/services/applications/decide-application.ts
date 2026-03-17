import {
  AuditEntityType,
  MemberStatus,
  ReviewDecision,
  RosterEntryStatus,
  SubmissionStatus
} from "@prisma/client";
import { prisma } from "../../prisma";
import { writeAuditLog } from "../../audit/write-audit-log";
import { syncMemberToDiscord } from "../../discord/sync-member";

type DecideApplicationInput = {
  guildId: string;
  submissionId: string;
  reviewerId: string;
  decision: ReviewDecision;
  notes?: string;
  score?: number;
};

export async function decideApplication(input: DecideApplicationInput) {
  const submission = await prisma.applicationSubmission.findFirst({
    where: {
      id: input.submissionId,
      guildId: input.guildId
    },
    include: {
      applicant: true,
      template: true
    }
  });

  if (!submission) {
    throw new Error("Submission not found.");
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.submissionReview.create({
      data: {
        submissionId: submission.id,
        reviewerId: input.reviewerId,
        decision: input.decision,
        notes: input.notes,
        score: input.score
      }
    });

    if (input.decision === ReviewDecision.ACCEPT) {
      const guildMember = await tx.guildMember.upsert({
        where: {
          guildId_userId: {
            guildId: input.guildId,
            userId: submission.applicantId
          }
        },
        create: {
          guildId: input.guildId,
          userId: submission.applicantId,
          role: "MEMBER",
          status: MemberStatus.PROBATION,
          isActive: true
        },
        update: {
          status: MemberStatus.PROBATION,
          isActive: true
        }
      });

      const rosterEntry = await tx.rosterEntry.upsert({
        where: {
          guildMemberId: guildMember.id
        },
        create: {
          guildId: input.guildId,
          guildMemberId: guildMember.id,
          status: RosterEntryStatus.PROBATION,
          joinedAt: new Date(),
          appointedAt: new Date(),
          notes: `Created from submission ${submission.id}`
        },
        update: {
          status: RosterEntryStatus.PROBATION,
          notes: `Updated from submission ${submission.id}`
        }
      });

      await tx.applicationSubmission.update({
        where: { id: submission.id },
        data: {
          status: SubmissionStatus.ACCEPTED,
          acceptedAt: new Date()
        }
      });

      await tx.submissionRosterHandoff.create({
        data: {
          submissionId: submission.id,
          rosterEntryId: rosterEntry.id,
          status: "COMPLETED",
          payload: {
            createdFromDecision: "ACCEPT"
          }
        }
      });

      return {
        accepted: true,
        rosterEntryId: rosterEntry.id,
        guildMemberId: guildMember.id
      };
    }

    if (input.decision === ReviewDecision.REJECT) {
      await tx.applicationSubmission.update({
        where: { id: submission.id },
        data: {
          status: SubmissionStatus.REJECTED,
          rejectedAt: new Date()
        }
      });

      return { accepted: false };
    }

    await tx.applicationSubmission.update({
      where: { id: submission.id },
      data: {
        status: SubmissionStatus.IN_REVIEW
      }
    });

    return { accepted: false };
  });

  await writeAuditLog({
    guildId: input.guildId,
    actorType: "USER",
    actorUserId: input.reviewerId,
    entityType: AuditEntityType.APPLICATION_SUBMISSION,
    entityId: submission.id,
    action: `application.decision.${input.decision.toLowerCase()}`,
    summary: `Decision ${input.decision} applied to submission ${submission.id}`,
    applicationSubmissionId: submission.id,
    payload: {
      notes: input.notes ?? null,
      score: input.score ?? null,
      accepted: result.accepted
    }
  });

  if (result.accepted && "guildMemberId" in result && result.guildMemberId) {
    await syncMemberToDiscord(input.guildId, result.guildMemberId);
  }

  return result;
}