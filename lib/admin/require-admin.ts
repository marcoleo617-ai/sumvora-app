import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AdminSession = {
  userId: string;
  email: string;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Exact email allowlist from ADMIN_EMAIL (server-only). */
export function getConfiguredAdminEmail(): string | null {
  const raw = process.env.ADMIN_EMAIL?.trim();
  if (!raw) {
    return null;
  }
  return normalizeEmail(raw);
}

/**
 * Ensures the current session is the configured admin.
 * - Missing/invalid ADMIN_EMAIL or no session → redirect to login
 * - Wrong email → null (caller should render 403)
 */
export async function requireAdmin(): Promise<AdminSession | null> {
  const adminEmail = getConfiguredAdminEmail();
  if (!adminEmail) {
    console.error("[admin] ADMIN_EMAIL is not configured.");
    redirect("/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  if (normalizeEmail(user.email) !== adminEmail) {
    return null;
  }

  return { userId: user.id, email: normalizeEmail(user.email) };
}
