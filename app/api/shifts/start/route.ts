import { z } from "zod";
import { parseJson } from "@/src/lib/api/validation";
import { fail, created } from "@/src/lib/api/response";
import { authErrorResponse, getRequestContext } from "@/src/lib/api/auth";
import { startShift } from "@/src/lib/services/shifts/start-shift";

const startShiftSchema = z.object({
  guildId: z.string().min(1),
  rosterEntryId: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const ctx = await getRequestContext(request);
    const body = await parseJson(request, startShiftSchema);
    if (body.guildId !== ctx.guildId) {
      return fail("Unauthorized guild context.", 403);
    }


    const shift = await startShift({
      guildId: body.guildId,
      userId: ctx.userId,
      rosterEntryId: body.rosterEntryId
    });

    return created(shift);
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

    return fail("Failed to start shift.", 500);
  }
}
