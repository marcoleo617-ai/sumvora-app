-- Link Paddle Sandbox/live customer + subscription IDs to Sumvora profiles.
-- Run in Supabase SQL Editor if not applied via CLI.

alter table public.profiles
  add column if not exists paddle_customer_id text,
  add column if not exists paddle_subscription_id text;

create unique index if not exists profiles_paddle_customer_id_uidx
  on public.profiles (paddle_customer_id)
  where paddle_customer_id is not null;

create unique index if not exists profiles_paddle_subscription_id_uidx
  on public.profiles (paddle_subscription_id)
  where paddle_subscription_id is not null;
