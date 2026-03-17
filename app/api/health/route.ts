import { ok } from "@/src/lib/api/response";

export async function GET() {
  return ok({
    service: "unified-ops",
    status: "healthy",
    now: new Date().toISOString()
  });
}