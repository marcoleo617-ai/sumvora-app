-- Fix ambiguous "period_start" in consume_ai_credit (RETURNS TABLE output
-- column name conflicted with usage_counters.period_start).
-- Run in Supabase SQL Editor if 002 is already applied.

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
