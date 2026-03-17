import { z } from "zod";
import { parseJson } from "@/src/lib/api/validation";
import { created, fail } from "@/src/lib/api/response";
import { authErrorResponse, getRequestContext } from "@/src/lib/api/auth";
import { submitApplication } from "@/src/lib/services/applications/submit-application";

const submitApplicationSchema = z.object({
  guildId: z.string().min(1),
  answers: z.array(
    z.object({
      fieldId: z.string().min(1),
      valueText: z.string().optional(),
      valueJson: z.unknown().optional()
    })
  )
});

type Params = {
  params: Promise<{ templateId: string }>;
};

export async function POST(request: Request, { params }: Params) {
  try {
    const ctx = getRequestContext(request);
    const body = await parseJson(request, submitApplicationSchema);
    const { templateId } = await params;

    const submission = await submitApplication({
      guildId: body.guildId,
      templateId,
      applicantId: ctx.userId,
      answers: body.answers
    });

    return created(submission);
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

    return fail("Failed to submit application.", 500);
  }
}
