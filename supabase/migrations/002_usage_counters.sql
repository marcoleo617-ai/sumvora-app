-- Monthly AI usage tracking for Free/Pro plan limits.
-- Run in Supabase SQL Editor (Dashboard → SQL → New query) or via Supabase CLI.

-- One row per user per UTC calendar month.
create table if not exists public.usage_counters (
  user_id uuid not null references public.profiles (id) on delete cascade,
  period_start date not null,
  ai_calls integer not null default 0 check (ai_calls >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, period_start)
);

alter table public.usage_counters enable row level security;

-- Users can read their own usage (Account page, client hints).
create policy "Users can read own usage"
  on public.usage_counters
  for select
  to authenticated
  using (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies for clients.
-- Writes happen only through consume_ai_credit() below.

-- Atomically consume one AI credit for Free users.
-- Pro users skip the counter (unlimited).
-- Free limit: 25 calls per UTC month (keep in sync with lib/plan-limits.ts).
create or replace function public.consume_ai_credit(p_user_id uuid)
returns table (allowed boolean, ai_calls integer, period_start date)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_plan text;
  v_period date := date_trunc('month', now() at time zone 'utc')::date;
  v_count integer;
  v_free_limit constant integer := 25;
begin
  if p_user_id is distinct from auth.uid() then
    return query select false, 0, v_period;
    return;
  end if;

  select plan into v_plan from public.profiles where id = p_user_id;

  if v_plan is null then
    return query select false, 0, v_period;
    return;
  end if;

  if v_plan = 'pro' then
    return query select true, -1, v_period;
    return;
  end if;

  insert into public.usage_counters (user_id, period_start, ai_calls)
  values (p_user_id, v_period, 1)
  on conflict (user_id, period_start)
  do update set
    ai_calls = public.usage_counters.ai_calls + 1,
    updated_at = now()
  returning public.usage_counters.ai_calls into v_count;

  return query select (v_count <= v_free_limit), v_count, v_period;
end;
$$;

revoke all on function public.consume_ai_credit(uuid) from public;
grant execute on function public.consume_ai_credit(uuid) to authenticated;
