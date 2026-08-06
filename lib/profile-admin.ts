import type { UserPlan } from "@/lib/profile-types";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export type ProfileBillingLink = {
  paddleCustomerId?: string | null;
  paddleSubscriptionId?: string | null;
};

function isMissingPaddleColumnError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("paddle_customer_id") ||
    lower.includes("paddle_subscription_id") ||
    (lower.includes("column") && lower.includes("does not exist"))
  );
}

export async function findUserIdByEmail(
  email: string,
): Promise<{ userId: string | null; error?: string }> {
  try {
    const supabase = createAdminClient();
    const normalized = email.trim().toLowerCase();

    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .ilike("email", normalized)
      .limit(1)
      .maybeSingle();

    if (error) {
      return { userId: null, error: error.message };
    }

    return { userId: data?.id ?? null };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown admin client error.";
    return { userId: null, error: message };
  }
}

export async function findUserIdByPaddleCustomerId(
  paddleCustomerId: string,
): Promise<{ userId: string | null; error?: string }> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("paddle_customer_id", paddleCustomerId)
      .maybeSingle();

    if (error) {
      if (isMissingPaddleColumnError(error.message)) {
        return {
          userId: null,
          error: "profiles.paddle_customer_id column missing — run migration 004.",
        };
      }
      return { userId: null, error: error.message };
    }

    return { userId: data?.id ?? null };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown admin client error.";
    return { userId: null, error: message };
  }
}

export async function findUserIdByPaddleSubscriptionId(
  paddleSubscriptionId: string,
): Promise<{ userId: string | null; error?: string }> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("paddle_subscription_id", paddleSubscriptionId)
      .maybeSingle();

    if (error) {
      if (isMissingPaddleColumnError(error.message)) {
        return {
          userId: null,
          error:
            "profiles.paddle_subscription_id column missing — run migration 004.",
        };
      }
      return { userId: null, error: error.message };
    }

    return { userId: data?.id ?? null };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown admin client error.";
    return { userId: null, error: message };
  }
}

export async function linkPaddleIdsToProfile(
  userId: string,
  link: ProfileBillingLink,
): Promise<{ ok: true } | { ok: false; error: string; missingColumn?: boolean }> {
  if (!isUuid(userId)) {
    return { ok: false, error: `Invalid user id (expected UUID): ${userId}` };
  }

  const patch: Record<string, string> = {
    updated_at: new Date().toISOString(),
  };

  if (link.paddleCustomerId) {
    patch.paddle_customer_id = link.paddleCustomerId;
  }
  if (link.paddleSubscriptionId) {
    patch.paddle_subscription_id = link.paddleSubscriptionId;
  }

  if (!link.paddleCustomerId && !link.paddleSubscriptionId) {
    return { ok: true };
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", userId)
      .select("id")
      .maybeSingle();

    if (error) {
      return {
        ok: false,
        error: error.message,
        missingColumn: isMissingPaddleColumnError(error.message),
      };
    }

    if (!data) {
      return { ok: false, error: `No profiles row for user id ${userId}.` };
    }

    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown paddle link error.";
    return { ok: false, error: message };
  }
}

export async function updateUserPlan(
  userId: string,
  plan: UserPlan,
): Promise<
  | { ok: true; userId: string; plan: UserPlan }
  | { ok: false; error: string; notFound?: boolean }
> {
  if (!isUuid(userId)) {
    return {
      ok: false,
      error: `Invalid user id (expected UUID): ${userId}`,
      notFound: true,
    };
  }

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("profiles")
      .update({
        plan,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select("id, plan")
      .maybeSingle();

    if (error) {
      return { ok: false, error: error.message };
    }

    if (!data) {
      return {
        ok: false,
        error: `No profiles row updated for user id ${userId}.`,
        notFound: true,
      };
    }

    return { ok: true, userId: data.id, plan: data.plan as UserPlan };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown plan update error.";
    return { ok: false, error: message };
  }
}

export async function upsertProPlanWithPaddleLink(
  userId: string,
  link: ProfileBillingLink,
): Promise<
  | { ok: true; userId: string; plan: UserPlan }
  | { ok: false; error: string; retryable: boolean }
> {
  const planResult = await updateUserPlan(userId, "pro");
  if (!planResult.ok) {
    return {
      ok: false,
      error: planResult.error,
      // Missing profile / bad UUID will not be fixed by Paddle retries.
      retryable: !planResult.notFound,
    };
  }

  const linkResult = await linkPaddleIdsToProfile(userId, link);
  if (!linkResult.ok) {
    if (linkResult.missingColumn) {
      console.warn(
        "[paddle-webhook] paddle id columns missing; plan updated without link",
        { userId, error: linkResult.error },
      );
    } else {
      console.warn("[paddle-webhook] plan updated but paddle id link failed", {
        userId,
        error: linkResult.error,
      });
    }
  }

  return { ok: true, userId: planResult.userId, plan: planResult.plan };
}
