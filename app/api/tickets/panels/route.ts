import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { toPrismaJsonValue } from "@/src/lib/prisma-json";
import { parseJson } from "@/src/lib/api/validation";
import { created, fail } from "@/src/lib/api/response";
import { authErrorResponse, getRequestContext } from "@/src/lib/api/auth";

const createTicketPanelSchema = z.object({
  guildId: z.string().min(1),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  discordChannelId: z.string().optional(),
  embedConfig: z.record(z.string(), z.unknown()).optional(),
  welcomeConfig: z.record(z.string(), z.unknown()).optional(),
  formConfig: z.record(z.string(), z.unknown()).optional()
});

export async function POST(request: Request) {
  try {
    const ctx = await getRequestContext(request);

    if (!ctx.can("ADMIN")) {
      return fail("Insufficient permissions.", 403);
    }

    const body = await parseJson(request, createTicketPanelSchema);
    if (body.guildId !== ctx.guildId) {
      return fail("Unauthorized guild context.", 403);
    }


    const panel = await prisma.ticketPanel.create({
      data: {
        guildId: body.guildId,
        name: body.name,
        slug: body.slug,
        discordChannelId: body.discordChannelId,
        embedConfig: body.embedConfig
          ? toPrismaJsonValue(body.embedConfig as Prisma.InputJsonObject)
          : undefined,
        welcomeConfig: body.welcomeConfig
          ? toPrismaJsonValue(body.welcomeConfig as Prisma.InputJsonObject)
          : undefined,
        formConfig: body.formConfig
          ? toPrismaJsonValue(body.formConfig as Prisma.InputJsonObject)
          : undefined
      }
    });

    return created(panel);
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

    return fail("Failed to create ticket panel.", 500);
  }
}
