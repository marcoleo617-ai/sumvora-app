import { getCurrentUserProfile } from "@/lib/profile";
import type { UserProfile } from "@/lib/profile-types";
import { NextResponse } from "next/server";

type AuthSuccess = { profile: UserProfile };
type AuthFailure = { error: NextResponse };

export async function requireAuth(): Promise<AuthSuccess | AuthFailure> {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    return {
      error: NextResponse.json(
        { error: "Sign in required.", code: "UNAUTHORIZED" },
        { status: 401 },
      ),
    };
  }

  return { profile };
}
