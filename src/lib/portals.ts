import { supabase } from "@/integrations/supabase/client";

export const PORTAL_ROLES = [
  "student",
  "employee",
  "employer",
  "startup_founder",
  "international_student",
] as const;

export type PortalRole = (typeof PORTAL_ROLES)[number];

const portalPaths: Record<PortalRole, string> = {
  student: "/portal/student",
  employee: "/portal/employee",
  employer: "/portal/employer",
  startup_founder: "/portal/founder",
  international_student: "/portal/international-student",
};

const portalProfileTables: Record<PortalRole, string> = {
  student: "student_profiles",
  employee: "employee_profiles",
  employer: "employer_profiles",
  startup_founder: "founder_profiles",
  international_student: "international_students",
};

export function normalizePortalRole(value: unknown): PortalRole | null {
  if (typeof value !== "string") return null;

  switch (value.trim().toLowerCase()) {
    case "student":
      return "student";
    case "employee":
      return "employee";
    case "employer":
      return "employer";
    case "startup_founder":
    case "founder":
      return "startup_founder";
    case "international_student":
    case "international-student":
      return "international_student";
    default:
      return null;
  }
}

export function portalPathFor(value: unknown): string | null {
  const role = normalizePortalRole(value);
  return role ? portalPaths[role] : null;
}

export async function activatePortalForUser(
  userId: string,
  role: PortalRole,
): Promise<PortalRole[]> {
  const client = supabase as any;
  const { data: profile, error: readError } = await client
    .from("profiles")
    .select("enabled_portals")
    .eq("id", userId)
    .maybeSingle();

  if (readError) throw readError;

  const existing = Array.isArray(profile?.enabled_portals)
    ? profile.enabled_portals
        .map((value: unknown) => normalizePortalRole(value))
        .filter((value: PortalRole | null): value is PortalRole => value !== null)
    : [];
  const enabledPortals = Array.from(new Set<PortalRole>([...existing, role]));

  const { error: saveError } = await client.from("profiles").upsert(
    {
      id: userId,
      enabled_portals: enabledPortals,
      active_portal: role,
      account_role: role,
      role,
      account_type: role,
    },
    { onConflict: "id" },
  );

  if (saveError) throw saveError;
  return enabledPortals;
}

export async function portalProfileExists(
  userId: string,
  role: PortalRole,
): Promise<boolean> {
  const client = supabase as any;
  const { data, error } = await client
    .from(portalProfileTables[role])
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}
