import Link from "next/link";
import { redirect } from "next/navigation";
import UpgradeToProButton from "@/components/upgrade-to-pro-button";
import { signOut } from "@/lib/auth/actions";
import { FREE_MONTHLY_AI_CALLS } from "@/lib/plan-limits";
import { getCurrentUserProfile } from "@/lib/profile";
import { getMonthlyAiUsage } from "@/lib/usage";

function formatPlanLabel(plan: string): string {
  return plan === "pro" ? "Pro" : "Free";
}

function formatUsageLabel(plan: string, aiCalls: number): string {
  if (plan === "pro") {
    return "Unlimited";
  }

  return `${aiCalls} / ${FREE_MONTHLY_AI_CALLS} used`;
}

export default async function AccountPage() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/login");
  }

  const aiCalls = await getMonthlyAiUsage(profile.id);

  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      <header className="site-navbar">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-6">
          <Link href="/" className="text-lg font-semibold tracking-[-0.02em] text-slate-900">
            Sumvora
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
        <div className="card">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Account
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Your Sumvora profile and plan.
          </p>

          <dl className="mt-6 space-y-4 border-t border-slate-100 pt-6">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Email
              </dt>
              <dd className="mt-1 text-sm text-slate-900">{profile.email ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Plan
              </dt>
              <dd className="mt-1">
                <span className="badge-primary px-3 py-1 text-xs">
                  {formatPlanLabel(profile.plan)}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                AI usage this month
              </dt>
              <dd className="mt-1 text-sm text-slate-900">
                {formatUsageLabel(profile.plan, aiCalls)}
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6">
            {profile.plan === "free" && (
              <UpgradeToProButton email={profile.email} userId={profile.id} />
            )}
            <Link href="/#workspace" className="btn-secondary text-center">
              Back to workspace
            </Link>
            <form action={signOut}>
              <button type="submit" className="btn-secondary w-full">
                Sign out
              </button>
            </form>
            <p className="pt-1 text-center text-sm text-slate-500">
              Need help?{" "}
              <Link
                href="/support"
                className="font-medium text-indigo-600 hover:text-indigo-700"
              >
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
