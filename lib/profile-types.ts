export type UserPlan = "free" | "pro";

export type UserProfile = {
  id: string;
  email: string | null;
  plan: UserPlan;
  created_at: string;
  updated_at: string;
  paddle_customer_id?: string | null;
  paddle_subscription_id?: string | null;
};
