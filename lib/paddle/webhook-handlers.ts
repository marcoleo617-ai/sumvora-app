import type { UserPlan } from "@/lib/profile-types";
import { updateUserPlan } from "@/lib/profile-admin";

type PaddleWebhookPayload = {
  event_id?: string;
  event_type?: string;
  data?: {
    custom_data?: Record<string, unknown> | null;
    status?: string;
  };
};

function extractUserId(data: PaddleWebhookPayload["data"]): string | null {
  const customData = data?.custom_data;

  if (!customData || typeof customData !== "object") {
    return null;
  }

  const userId = customData.user_id;

  if (typeof userId === "string" && userId.trim().length > 0) {
    return userId.trim();
  }

  return null;
}

async function setPlanForEvent(
  userId: string,
  plan: UserPlan,
  eventType: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const result = await updateUserPlan(userId, plan);

  if (!result.ok) {
    console.error(`Paddle webhook failed to set plan=${plan} for ${eventType}:`, {
      userId,
      error: result.error,
    });
  }

  return result;
}

export async function handlePaddleWebhookEvent(
  payload: PaddleWebhookPayload,
): Promise<{ handled: boolean; error?: string }> {
  const eventType = payload.event_type;
  const userId = extractUserId(payload.data);

  if (!eventType) {
    return { handled: false, error: "Missing event_type." };
  }

  switch (eventType) {
    case "subscription.activated":
    case "transaction.completed": {
      if (!userId) {
        console.warn(`Paddle ${eventType} missing custom_data.user_id`);
        return { handled: true };
      }

      const result = await setPlanForEvent(userId, "pro", eventType);
      return result.ok ? { handled: true } : { handled: false, error: result.error };
    }

    case "subscription.canceled": {
      if (!userId) {
        console.warn("Paddle subscription.canceled missing custom_data.user_id");
        return { handled: true };
      }

      const result = await setPlanForEvent(userId, "free", eventType);
      return result.ok ? { handled: true } : { handled: false, error: result.error };
    }

    default:
      return { handled: true };
  }
}
