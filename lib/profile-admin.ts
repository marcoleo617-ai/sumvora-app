import type { UserPlan } from "@/lib/profile-types";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateUserPlan(
  userId: string,
  plan: UserPlan,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      plan,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
