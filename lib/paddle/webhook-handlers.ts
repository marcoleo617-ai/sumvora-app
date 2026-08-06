import type { UserPlan } from "@/lib/profile-types";
import {
  findUserIdByEmail,
  findUserIdByPaddleCustomerId,
  findUserIdByPaddleSubscriptionId,
  isUuid,
  linkPaddleIdsToProfile,
  updateUserPlan,
  upsertProPlanWithPaddleLink,
} from "@/lib/profile-admin";

type PaddleCustomData = Record<string, unknown> | null | undefined;

type PaddleWebhookData = {
  id?: string;
  status?: string;
  customer_id?: string | null;
  subscription_id?: string | null;
  custom_data?: PaddleCustomData;
  customer?: {
    id?: string;
    email?: string | null;
  } | null;
  email?: string | null;
};

type PaddleWebhookPayload = {
  event_id?: string;
  event_type?: string;
  data?: PaddleWebhookData;
};

export type PaddleWebhookHandleResult = {
  handled: boolean;
  error?: string;
};

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function extractCustomDataUserId(customData: PaddleCustomData): string | null {
  if (!customData || typeof customData !== "object") {
    return null;
  }

  const candidates = [
    customData.user_id,
    customData.userId,
    customData.supabase_user_id,
  ];

  for (const candidate of candidates) {
    const value = asNonEmptyString(candidate);
    if (value && isUuid(value)) {
      return value;
    }
  }

  return null;
}

function extractEmail(data: PaddleWebhookData | undefined): string | null {
  if (!data) {
    return null;
  }

  const fromCustomer = asNonEmptyString(data.customer?.email);
  if (fromCustomer) {
    return fromCustomer;
  }

  const fromRoot = asNonEmptyString(data.email);
  if (fromRoot) {
    return fromRoot;
  }

  const customData = data.custom_data;
  if (customData && typeof customData === "object") {
    return (
      asNonEmptyString(customData.user_email) ??
      asNonEmptyString(customData.email)
    );
  }

  return null;
}

function extractIds(data: PaddleWebhookData | undefined) {
  const entityId = asNonEmptyString(data?.id);

  return {
    paddleCustomerId:
      asNonEmptyString(data?.customer_id) ??
      asNonEmptyString(data?.customer?.id),
    paddleSubscriptionId:
      asNonEmptyString(data?.subscription_id) ??
      (entityId?.startsWith("sub_") ? entityId : null),
    paddleEntityId: entityId,
  };
}

async function resolveSumvoraUserId(
  data: PaddleWebhookData | undefined,
  ids: {
    paddleCustomerId: string | null;
    paddleSubscriptionId: string | null;
  },
): Promise<{ userId: string | null; source: string | null; error?: string }> {
  const fromCustomData = extractCustomDataUserId(data?.custom_data);
  if (fromCustomData) {
    return { userId: fromCustomData, source: "custom_data.user_id" };
  }

  if (ids.paddleSubscriptionId) {
    const bySub = await findUserIdByPaddleSubscriptionId(ids.paddleSubscriptionId);
    if (bySub.userId) {
      return {
        userId: bySub.userId,
        source: "profiles.paddle_subscription_id",
      };
    }
    if (bySub.error && !bySub.error.includes("column missing")) {
      console.warn("[paddle-webhook] subscription id lookup error", {
        error: bySub.error,
      });
    }
  }

  if (ids.paddleCustomerId) {
    const byCustomer = await findUserIdByPaddleCustomerId(ids.paddleCustomerId);
    if (byCustomer.userId) {
      return {
        userId: byCustomer.userId,
        source: "profiles.paddle_customer_id",
      };
    }
    if (byCustomer.error && !byCustomer.error.includes("column missing")) {
      console.warn("[paddle-webhook] customer id lookup error", {
        error: byCustomer.error,
      });
    }
  }

  const email = extractEmail(data);
  if (!email) {
    return {
      userId: null,
      source: null,
      error:
        "Unable to resolve user from custom_data, paddle ids, or customer email.",
    };
  }

  const lookup = await findUserIdByEmail(email);
  if (lookup.error) {
    return {
      userId: null,
      source: "email",
      error: `Email lookup failed for ${email}: ${lookup.error}`,
    };
  }

  if (!lookup.userId) {
    return {
      userId: null,
      source: "email",
      error: `No profiles row found for email ${email}.`,
    };
  }

  return { userId: lookup.userId, source: "email" };
}

function planFromSubscriptionStatus(status: string | undefined): UserPlan | null {
  if (!status) {
    return null;
  }

  switch (status) {
    case "active":
    case "trialing":
      return "pro";
    case "canceled":
    case "paused":
      return "free";
    default:
      return null;
  }
}

async function activateProForUser(
  userId: string,
  eventType: string,
  link: {
    paddleCustomerId: string | null;
    paddleSubscriptionId: string | null;
  },
): Promise<PaddleWebhookHandleResult> {
  console.log("[paddle-webhook] activating pro", {
    eventType,
    userId,
    paddleCustomerId: link.paddleCustomerId,
    paddleSubscriptionId: link.paddleSubscriptionId,
  });

  const result = await upsertProPlanWithPaddleLink(userId, {
    paddleCustomerId: link.paddleCustomerId,
    paddleSubscriptionId: link.paddleSubscriptionId,
  });

  if (!result.ok) {
    console.error("[paddle-webhook] activate pro failed", {
      eventType,
      userId,
      error: result.error,
      retryable: result.retryable,
    });

    // Bad/missing profile won't be fixed by retries — acknowledge to stop 500 loops.
    if (!result.retryable) {
      return { handled: true };
    }

    return { handled: false, error: result.error };
  }

  console.log("[paddle-webhook] activate pro success", {
    eventType,
    userId: result.userId,
    plan: result.plan,
  });

  return { handled: true };
}

async function setPlanForUser(
  userId: string,
  plan: UserPlan,
  eventType: string,
  link: {
    paddleCustomerId: string | null;
    paddleSubscriptionId: string | null;
  },
): Promise<PaddleWebhookHandleResult> {
  console.log("[paddle-webhook] setting plan", {
    eventType,
    userId,
    plan,
  });

  const result = await updateUserPlan(userId, plan);
  if (!result.ok) {
    console.error("[paddle-webhook] set plan failed", {
      eventType,
      userId,
      plan,
      error: result.error,
      notFound: result.notFound ?? false,
    });

    if (result.notFound) {
      return { handled: true };
    }

    return { handled: false, error: result.error };
  }

  const linkResult = await linkPaddleIdsToProfile(userId, {
    paddleCustomerId: link.paddleCustomerId,
    paddleSubscriptionId: link.paddleSubscriptionId,
  });

  if (!linkResult.ok && !linkResult.missingColumn) {
    console.warn("[paddle-webhook] plan set but paddle id link failed", {
      eventType,
      userId,
      error: linkResult.error,
    });
  }

  console.log("[paddle-webhook] set plan success", {
    eventType,
    userId: result.userId,
    plan: result.plan,
  });

  return { handled: true };
}

export async function handlePaddleWebhookEvent(
  payload: PaddleWebhookPayload,
): Promise<PaddleWebhookHandleResult> {
  const eventType = payload.event_type;
  const eventId = payload.event_id;
  const data = payload.data;
  const ids = extractIds(data);

  console.log("[paddle-webhook] event received", {
    eventId: eventId ?? null,
    eventType: eventType ?? null,
    paddleCustomerId: ids.paddleCustomerId,
    paddleSubscriptionId: ids.paddleSubscriptionId,
    paddleEntityId: ids.paddleEntityId,
    status: data?.status ?? null,
    hasCustomData: Boolean(data?.custom_data),
    customDataKeys:
      data?.custom_data && typeof data.custom_data === "object"
        ? Object.keys(data.custom_data)
        : [],
  });

  if (!eventType) {
    return { handled: false, error: "Missing event_type." };
  }

  // transaction.updated is informational — acknowledge without failing.
  if (eventType === "transaction.updated") {
    console.log("[paddle-webhook] acknowledging transaction.updated");
    // Still try to persist mapping if we can resolve the user cheaply.
    const resolvedEarly = await resolveSumvoraUserId(data, ids);
    if (resolvedEarly.userId) {
      await linkPaddleIdsToProfile(resolvedEarly.userId, {
        paddleCustomerId: ids.paddleCustomerId,
        paddleSubscriptionId: ids.paddleSubscriptionId,
      });
    }
    return { handled: true };
  }

  const resolved = await resolveSumvoraUserId(data, ids);

  console.log("[paddle-webhook] user resolution", {
    eventType,
    userId: resolved.userId,
    source: resolved.source,
    error: resolved.error ?? null,
  });

  switch (eventType) {
    case "subscription.created":
    case "subscription.activated":
    case "transaction.completed": {
      if (!resolved.userId) {
        console.error(
          "[paddle-webhook] cannot activate pro — user not resolved",
          {
            eventType,
            paddleCustomerId: ids.paddleCustomerId,
            paddleSubscriptionId: ids.paddleSubscriptionId,
            error: resolved.error,
          },
        );
        // Acknowledge: retries will not invent identity mapping.
        return { handled: true };
      }

      return activateProForUser(resolved.userId, eventType, ids);
    }

    case "subscription.updated": {
      const plan = planFromSubscriptionStatus(data?.status);

      if (!plan) {
        console.log("[paddle-webhook] subscription.updated ignored status", {
          status: data?.status ?? null,
          paddleSubscriptionId: ids.paddleSubscriptionId,
        });

        if (resolved.userId) {
          await linkPaddleIdsToProfile(resolved.userId, {
            paddleCustomerId: ids.paddleCustomerId,
            paddleSubscriptionId: ids.paddleSubscriptionId,
          });
        }

        return { handled: true };
      }

      if (!resolved.userId) {
        console.error(
          "[paddle-webhook] cannot sync plan from subscription.updated",
          {
            paddleCustomerId: ids.paddleCustomerId,
            paddleSubscriptionId: ids.paddleSubscriptionId,
            status: data?.status ?? null,
            error: resolved.error,
          },
        );
        return { handled: true };
      }

      if (plan === "pro") {
        return activateProForUser(resolved.userId, eventType, ids);
      }

      return setPlanForUser(resolved.userId, plan, eventType, ids);
    }

    case "subscription.canceled": {
      if (!resolved.userId) {
        console.error(
          "[paddle-webhook] cannot downgrade — user not resolved",
          {
            eventType,
            paddleCustomerId: ids.paddleCustomerId,
            paddleSubscriptionId: ids.paddleSubscriptionId,
            error: resolved.error,
          },
        );
        return { handled: true };
      }

      return setPlanForUser(resolved.userId, "free", eventType, ids);
    }

    default:
      console.log("[paddle-webhook] unsupported event acknowledged", {
        eventType,
      });
      return { handled: true };
  }
}
