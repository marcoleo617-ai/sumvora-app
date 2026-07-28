import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignUpForm from "@/components/signup-form";

export default async function SignUpPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/account");
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
            Create account
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Start with a free Sumvora account.
          </p>

          <div className="mt-6">
            <SignUpForm />
          </div>
        </div>
      </main>
    </div>
  );
}
