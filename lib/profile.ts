import type { UserPlan, UserProfile } from "@/lib/profile-types";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, plan, created_at, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    email: data.email,
    plan: data.plan as UserPlan,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}
