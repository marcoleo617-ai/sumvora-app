import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth/actions";
import { getCurrentUserProfile } from "@/lib/profile";

function formatPlanLabel(plan: string): string {
  return plan === "pro" ? "Pro" : "Free";
}

export default async function AccountPage() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/login");
  }

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
          </dl>

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6">
            <Link href="/#workspace" className="btn-secondary text-center">
              Back to workspace
            </Link>
            <form action={signOut}>
              <button type="submit" className="btn-secondary w-full">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
