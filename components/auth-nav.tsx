import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";

export default async function AuthNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Link href="/login" className="nav-link ml-1 shrink-0">
        Sign in
      </Link>
    );
  }

  return (
    <div className="ml-1 flex shrink-0 items-center gap-1">
      <Link href="/account" className="nav-link">
        Account
      </Link>
      <form action={signOut}>
        <button type="submit" className="nav-link">
          Sign out
        </button>
      </form>
    </div>
  );
}
