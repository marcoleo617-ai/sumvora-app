-- Harden EXECUTE privileges on SECURITY DEFINER helpers.
-- Does not change function bodies, auth.uid() checks, or RLS policies.

-- consume_ai_credit: must remain callable by signed-in users (AI usage limits).
-- Block PUBLIC / anon; keep authenticated.
revoke all on function public.consume_ai_credit(uuid) from public;
revoke execute on function public.consume_ai_credit(uuid) from anon;
grant execute on function public.consume_ai_credit(uuid) to authenticated;

-- handle_new_user: trigger-only. Must not be callable as an RPC by API roles.
-- Signup still works via AFTER/AFTER INSERT trigger on auth.users (runs as definer).
revoke all on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;
