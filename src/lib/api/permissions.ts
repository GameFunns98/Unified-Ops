const roleOrder = [
  "MEMBER",
  "REVIEWER",
  "SUPERVISOR",
  "HR",
  "COMMAND",
  "ADMIN",
  "OWNER"
] as const;

export function hasMinimumRole(currentRole: string | undefined, requiredRole: string) {
  if (!currentRole) return false;

  const currentIndex = roleOrder.indexOf(currentRole as (typeof roleOrder)[number]);
  const requiredIndex = roleOrder.indexOf(requiredRole as (typeof roleOrder)[number]);

  if (currentIndex === -1 || requiredIndex === -1) return false;
  return currentIndex >= requiredIndex;
}