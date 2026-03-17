import { hasMinimumRole } from "@/src/lib/api/permissions";
import type { AppSession } from "./session";

export function canActAs(session: AppSession, minimumRole: string) {
  return hasMinimumRole(session.role, minimumRole);
}
