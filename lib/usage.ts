import { FREE_MONTHLY_AI_CALLS } from "@/lib/plan-limits";
import { createClient } from "@/lib/supabase/server";

export type AiCreditResult = {
  allowed: boolean;
  aiCalls: number;
  periodStart: string;
  unlimited: boolean;
};

function getCurrentUtcPeriodStart(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

export async function getMonthlyAiUsage(userId: string): Promise<number> {
  const supabase = await createClient();
  const periodStart = getCurrentUtcPeriodStart();

  const { data, error } = await supabase
    .from("usage_counters")
    .select("ai_calls")
    .eq("user_id", userId)
    .eq("period_start", periodStart)
    .maybeSingle();

  if (error || !data) {
    return 0;
  }

  return data.ai_calls;
}

export async function consumeAiCredit(userId: string): Promise<AiCreditResult> {
  const supabase = await createClient();
  const periodStart = getCurrentUtcPeriodStart();

  const { data, error } = await supabase.rpc("consume_ai_credit", {
    p_user_id: userId,
  });

  if (error || !data?.[0]) {
    console.error("consume_ai_credit error:", error);
    return {
      allowed: false,
      aiCalls: 0,
      periodStart,
      unlimited: false,
    };
  }

  const row = data[0] as {
    allowed: boolean;
    ai_calls: number;
    period_start: string;
  };

  const unlimited = row.ai_calls === -1;

  return {
    allowed: row.allowed,
    aiCalls: unlimited ? 0 : row.ai_calls,
    periodStart: row.period_start,
    unlimited,
  };
}

export function usageLimitResponse(credit: AiCreditResult) {
  return {
    error: "Monthly AI limit reached.",
    code: "USAGE_LIMIT_EXCEEDED",
    usage: {
      aiCalls: credit.aiCalls,
      limit: FREE_MONTHLY_AI_CALLS,
      periodStart: credit.periodStart,
    },
  };
}
