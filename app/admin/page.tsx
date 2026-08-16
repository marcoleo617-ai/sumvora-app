import Link from "next/link";
import type { Metadata } from "next";
import {
  getAdminAnalytics,
  parseAdminUserFilter,
  type AdminUserFilter,
  type AdminUserRow,
} from "@/lib/admin/analytics";
import { requireAdmin } from "@/lib/admin/require-admin";

export const metadata: Metadata = {
  title: "Admin Analytics — Sumvora",
  robots: { index: false, follow: false },
};

/** Always load fresh aggregates; never cache privileged user data. */
export const dynamic = "force-dynamic";

const FILTERS: { id: AdminUserFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "free", label: "Free" },
  { id: "pro", label: "Pro" },
  { id: "used_ai", label: "Used AI" },
  { id: "never_ai", label: "Never Used AI" },
];

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  });
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card !p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
        {value.toLocaleString("en-US")}
      </p>
    </div>
  );
}

function UsersTable({
  title,
  users,
  empty,
}: {
  title: string;
  users: AdminUserRow[];
  empty: string;
}) {
  return (
    <section className="card overflow-hidden !p-0">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      </div>
      {users.length === 0 ? (
        <p className="px-5 py-8 text-sm text-slate-500">{empty}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Signup</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">AI this month</th>
                <th className="px-4 py-3 font-medium">Last activity</th>
                <th className="px-4 py-3 font-medium">User ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="text-slate-800">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {u.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        u.plan === "pro" ? "badge-primary" : "badge"
                      }
                    >
                      {u.plan === "pro" ? "Pro" : "Free"}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-slate-600">
                    {u.aiCallsThisMonth}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                    {formatDate(u.lastActivityAt)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">
                    {u.id}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const session = await requireAdmin();

  if (!session) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center bg-slate-50 px-6">
        <div className="card max-w-md text-center">
          <h1 className="text-xl font-semibold text-slate-900">Forbidden</h1>
          <p className="mt-2 text-sm text-slate-600">
            You do not have access to this page.
          </p>
          <Link href="/" className="btn-secondary mt-6 inline-flex">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const params = await searchParams;
  const filter = parseAdminUserFilter(params.filter);

  let analytics;
  try {
    analytics = await getAdminAnalytics(filter);
  } catch (error) {
    console.error("[admin] analytics load failed:", error);
    return (
      <div className="flex min-h-full flex-col items-center justify-center bg-slate-50 px-6">
        <div className="card max-w-md text-center">
          <h1 className="text-xl font-semibold text-slate-900">
            Admin unavailable
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Could not load analytics. Confirm{" "}
            <code className="text-xs">SUPABASE_SERVICE_ROLE_KEY</code> is set
            on the server.
          </p>
          <Link href="/" className="btn-secondary mt-6 inline-flex">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const { metrics } = analytics;

  return (
    <div className="min-h-full bg-slate-50">
      <header className="site-navbar">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="text-lg font-semibold tracking-[-0.02em] text-slate-900"
          >
            Sumvora
          </Link>
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Admin · {session.email}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Admin Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Internal registered-user and AI usage overview. Times shown in UTC.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <MetricCard label="Total Users" value={metrics.totalUsers} />
          <MetricCard label="New This Week" value={metrics.newUsersLast7Days} />
          <MetricCard label="Free Users" value={metrics.freeUsers} />
          <MetricCard label="Pro Users" value={metrics.proUsers} />
          <MetricCard
            label="AI Analyses This Month"
            value={metrics.aiAnalysesThisMonth}
          />
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard label="New Users Today" value={metrics.newUsersToday} />
          <MetricCard label="Used AI (ever)" value={metrics.usersUsedAi} />
          <MetricCard
            label="Never Used AI"
            value={metrics.usersNeverUsedAi}
          />
        </div>

        <div className="mt-4 space-y-1 text-xs text-slate-500">
          {analytics.dataNotes.map((note) => (
            <p key={note}>• {note}</p>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            const href =
              f.id === "all" ? "/admin" : `/admin?filter=${f.id}`;
            return (
              <Link
                key={f.id}
                href={href}
                className={
                  active
                    ? "inline-flex h-9 items-center rounded-lg bg-slate-900 px-3 text-sm font-medium text-white"
                    : "inline-flex h-9 items-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                }
              >
                {f.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-6 space-y-6">
          <UsersTable
            title={`Users (${analytics.users.length})`}
            users={analytics.users}
            empty="No users match this filter."
          />
          <UsersTable
            title="Recent signups"
            users={analytics.recentSignups}
            empty="No signups yet."
          />
          <UsersTable
            title="Recent active users"
            users={analytics.recentActiveUsers}
            empty="No activity signals available yet."
          />
        </div>
      </main>
    </div>
  );
}
