import type { UserPlan } from "@/lib/profile-types";
import { createAdminClient } from "@/lib/supabase/admin";

export type AdminUserFilter =
  | "all"
  | "free"
  | "pro"
  | "used_ai"
  | "never_ai";

export type AdminUserRow = {
  id: string;
  email: string | null;
  plan: UserPlan;
  createdAt: string;
  aiCallsThisMonth: number;
  hasUsedAi: boolean;
  /** Best-effort; see getAdminAnalytics notes. */
  lastActivityAt: string | null;
};

export type AdminAnalytics = {
  metrics: {
    totalUsers: number;
    newUsersToday: number;
    newUsersLast7Days: number;
    freeUsers: number;
    proUsers: number;
    aiAnalysesThisMonth: number;
    usersUsedAi: number;
    usersNeverUsedAi: number;
  };
  /** Limitations of last-activity / Pro AI tracking for the UI note. */
  dataNotes: string[];
  recentSignups: AdminUserRow[];
  recentActiveUsers: AdminUserRow[];
  users: AdminUserRow[];
};

function utcPeriodStart(d = new Date()): string {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

function startOfUtcDay(d = new Date()): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}

function daysAgoUtc(days: number): Date {
  const base = startOfUtcDay();
  base.setUTCDate(base.getUTCDate() - days);
  return base;
}

function maxIso(
  a: string | null | undefined,
  b: string | null | undefined,
): string | null {
  if (!a) return b ?? null;
  if (!b) return a;
  return a > b ? a : b;
}

async function fetchLastSignInMap(
  admin: ReturnType<typeof createAdminClient>,
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const perPage = 200;
  let page = 1;

  // Cap pages to avoid unbounded loops on very large projects.
  for (let i = 0; i < 50; i += 1) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      console.error("[admin] listUsers failed:", error.message);
      break;
    }

    const users = data?.users ?? [];
    for (const u of users) {
      if (u.id && u.last_sign_in_at) {
        map.set(u.id, u.last_sign_in_at);
      }
    }

    if (users.length < perPage) {
      break;
    }
    page += 1;
  }

  return map;
}

/**
 * Aggregates admin metrics using the service-role client (server-only).
 *
 * Last activity is best-effort: max(auth last_sign_in_at, usage_counters.updated_at).
 * Pro AI calls are not written to usage_counters today, so AI totals undercount Pro.
 */
export async function getAdminAnalytics(
  filter: AdminUserFilter = "all",
): Promise<AdminAnalytics> {
  const admin = createAdminClient();
  const periodStart = utcPeriodStart();

  const [profilesResult, usageResult, lastSignInMap] = await Promise.all([
    admin
      .from("profiles")
      .select("id, email, plan, created_at")
      .order("created_at", { ascending: false }),
    admin
      .from("usage_counters")
      .select("user_id, period_start, ai_calls, updated_at"),
    fetchLastSignInMap(admin),
  ]);

  if (profilesResult.error) {
    throw new Error(`Failed to load profiles: ${profilesResult.error.message}`);
  }
  if (usageResult.error) {
    throw new Error(
      `Failed to load usage_counters: ${usageResult.error.message}`,
    );
  }

  const profiles = profilesResult.data ?? [];
  const usageRows = usageResult.data ?? [];

  const aiThisMonthByUser = new Map<string, number>();
  const maxUsageUpdatedByUser = new Map<string, string>();
  const usedAiUserIds = new Set<string>();
  let aiAnalysesThisMonth = 0;

  for (const row of usageRows) {
    const userId = row.user_id as string;
    const aiCalls = Number(row.ai_calls) || 0;
    const updatedAt = row.updated_at as string | null;

    if (aiCalls > 0) {
      usedAiUserIds.add(userId);
    }

    if (row.period_start === periodStart) {
      aiThisMonthByUser.set(userId, aiCalls);
      aiAnalysesThisMonth += aiCalls;
    }

    if (updatedAt) {
      maxUsageUpdatedByUser.set(
        userId,
        maxIso(maxUsageUpdatedByUser.get(userId), updatedAt) ?? updatedAt,
      );
    }
  }

  const todayStart = startOfUtcDay().toISOString();
  const weekStart = daysAgoUtc(7).toISOString();

  let newUsersToday = 0;
  let newUsersLast7Days = 0;
  let freeUsers = 0;
  let proUsers = 0;

  const allUsers: AdminUserRow[] = profiles.map((p) => {
    const plan = (p.plan === "pro" ? "pro" : "free") as UserPlan;
    if (plan === "pro") {
      proUsers += 1;
    } else {
      freeUsers += 1;
    }

    const createdAt = p.created_at as string;
    if (createdAt >= todayStart) {
      newUsersToday += 1;
    }
    if (createdAt >= weekStart) {
      newUsersLast7Days += 1;
    }

    const hasUsedAi = usedAiUserIds.has(p.id);
    const lastActivityAt = maxIso(
      lastSignInMap.get(p.id),
      maxUsageUpdatedByUser.get(p.id),
    );

    return {
      id: p.id as string,
      email: (p.email as string | null) ?? null,
      plan,
      createdAt,
      aiCallsThisMonth: aiThisMonthByUser.get(p.id) ?? 0,
      hasUsedAi,
      lastActivityAt,
    };
  });

  const usersUsedAi = usedAiUserIds.size;
  const usersNeverUsedAi = Math.max(0, allUsers.length - usersUsedAi);

  const filtered = allUsers.filter((u) => {
    switch (filter) {
      case "free":
        return u.plan === "free";
      case "pro":
        return u.plan === "pro";
      case "used_ai":
        return u.hasUsedAi;
      case "never_ai":
        return !u.hasUsedAi;
      default:
        return true;
    }
  });

  const recentSignups = [...allUsers]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 10);

  const recentActiveUsers = [...allUsers]
    .filter((u) => u.lastActivityAt)
    .sort((a, b) =>
      (a.lastActivityAt ?? "") < (b.lastActivityAt ?? "") ? 1 : -1,
    )
    .slice(0, 10);

  return {
    metrics: {
      totalUsers: allUsers.length,
      newUsersToday,
      newUsersLast7Days,
      freeUsers,
      proUsers,
      aiAnalysesThisMonth,
      usersUsedAi,
      usersNeverUsedAi,
    },
    dataNotes: [
      "Last activity is best-effort: latest of auth last sign-in and Free-plan AI counter updates. There is no dedicated last_activity column.",
      "Pro AI calls do not write usage_counters today, so monthly AI totals and “used AI” undercount Pro usage.",
    ],
    recentSignups,
    recentActiveUsers,
    users: filtered,
  };
}

export function parseAdminUserFilter(
  value: string | undefined,
): AdminUserFilter {
  switch (value) {
    case "free":
    case "pro":
    case "used_ai":
    case "never_ai":
      return value;
    default:
      return "all";
  }
}
