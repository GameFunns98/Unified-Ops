import { ReviewDecision } from "@prisma/client";
import { z } from "zod";
import { parseJson } from "@/src/lib/api/validation";
import { fail, ok } from "@/src/lib/api/response";
import { authErrorResponse, getRequestContext } from "@/src/lib/api/auth";
import { hasMinimumRole } from "@/src/lib/api/permissions";
import { decideApplication } from "@/src/lib/services/applications/decide-application";

const decideApplicationSchema = z.object({
  guildId: z.string().min(1),
  decision: z.nativeEnum(ReviewDecision),
  notes: z.string().min(1).optional(),
  score: z.number().finite().optional()
});

type Params = {
  params: Promise<{ submissionId: string }>;
};

export async function POST(request: Request, { params }: Params) {
  try {
    const ctx = getRequestContext(request);

    if (!hasMinimumRole(ctx.role, "REVIEWER")) {
      return fail("Insufficient permissions.", 403);
    }

    const body = await parseJson(request, decideApplicationSchema);
    const { submissionId } = await params;

    const result = await decideApplication({
      guildId: body.guildId,
      submissionId,
      reviewerId: ctx.userId,
      decision: body.decision,
      notes: body.notes,
      score: body.score
    });

    return ok(result);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return authErrorResponse(error);
    }

    if (error instanceof z.ZodError) {
      return fail("Invalid request body.", 422, error.flatten());
    }

    if (error instanceof Error) {
      return fail(error.message, 400);
    }

    return fail("Failed to apply application decision.", 500);
  }
}
