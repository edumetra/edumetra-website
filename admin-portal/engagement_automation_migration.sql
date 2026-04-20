-- ============================================================
-- Engagement automation: multi-channel journeys
-- Run this in Supabase SQL editor
-- ============================================================

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'engagement_channel') then
    create type public.engagement_channel as enum ('email', 'sms', 'rcs', 'whatsapp');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'engagement_enrollment_status') then
    create type public.engagement_enrollment_status as enum ('active', 'paused', 'completed', 'exited');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'engagement_message_status') then
    create type public.engagement_message_status as enum ('pending', 'queued', 'sent', 'delivered', 'read', 'failed', 'cancelled');
  end if;
end $$;

create table if not exists public.engagement_campaigns (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  objective text not null,
  kpi_name text not null default '7_day_return_rate',
  segment_rule jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  schedule_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.engagement_steps (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.engagement_campaigns(id) on delete cascade,
  step_order integer not null,
  day_offset integer not null check (day_offset >= 0),
  channel public.engagement_channel not null,
  fallback_channel public.engagement_channel,
  template_key text not null,
  delay_minutes integer not null default 0,
  max_attempts integer not null default 3,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(campaign_id, step_order)
);

create table if not exists public.user_channel_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email_opt_in boolean not null default true,
  sms_opt_in boolean not null default false,
  whatsapp_opt_in boolean not null default false,
  timezone text not null default 'Asia/Kolkata',
  locale text not null default 'en-IN',
  quiet_hours_start smallint not null default 22 check (quiet_hours_start between 0 and 23),
  quiet_hours_end smallint not null default 8 check (quiet_hours_end between 0 and 23),
  max_touches_per_day smallint not null default 1 check (max_touches_per_day between 1 and 5),
  unsubscribed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.engagement_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  campaign_id uuid not null references public.engagement_campaigns(id) on delete cascade,
  status public.engagement_enrollment_status not null default 'active',
  current_step_order integer not null default 1,
  enrolled_at timestamptz not null default now(),
  next_run_at timestamptz not null default now(),
  completed_at timestamptz,
  exited_at timestamptz,
  exit_reason text,
  holdout_group boolean not null default false,
  variant text not null default 'A',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, campaign_id)
);

create table if not exists public.engagement_messages (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.engagement_enrollments(id) on delete cascade,
  step_id uuid not null references public.engagement_steps(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  channel public.engagement_channel not null,
  provider text not null,
  status public.engagement_message_status not null default 'pending',
  template_key text not null,
  idempotency_key text not null unique,
  provider_message_id text,
  attempt_no integer not null default 1,
  payload jsonb not null default '{}'::jsonb,
  error_code text,
  error_message text,
  scheduled_at timestamptz not null default now(),
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.provider_delivery_events (
  id uuid primary key default gen_random_uuid(),
  message_id uuid references public.engagement_messages(id) on delete set null,
  provider text not null,
  provider_message_id text,
  event_type text not null,
  event_time timestamptz not null default now(),
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.engagement_conversions (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.engagement_enrollments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  conversion_event text not null,
  revenue numeric(12,2),
  converted_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.engagement_event_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_name text not null,
  event_time timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists idx_engagement_enrollments_status_next_run
  on public.engagement_enrollments (status, next_run_at);
create index if not exists idx_engagement_messages_status_sent
  on public.engagement_messages (status, sent_at);
create index if not exists idx_provider_delivery_events_message_time
  on public.provider_delivery_events (message_id, event_time);
create index if not exists idx_engagement_steps_campaign_order
  on public.engagement_steps (campaign_id, step_order);
create index if not exists idx_engagement_messages_user_sent
  on public.engagement_messages (user_id, sent_at desc);
create index if not exists idx_engagement_event_log_user_time
  on public.engagement_event_log (user_id, event_time desc);

alter table public.engagement_campaigns enable row level security;
alter table public.engagement_steps enable row level security;
alter table public.engagement_enrollments enable row level security;
alter table public.engagement_messages enable row level security;
alter table public.user_channel_preferences enable row level security;
alter table public.provider_delivery_events enable row level security;
alter table public.engagement_conversions enable row level security;
alter table public.engagement_event_log enable row level security;

drop policy if exists "service role campaigns" on public.engagement_campaigns;
create policy "service role campaigns"
  on public.engagement_campaigns for all
  using (true) with check (true);
drop policy if exists "service role steps" on public.engagement_steps;
create policy "service role steps"
  on public.engagement_steps for all
  using (true) with check (true);
drop policy if exists "service role enrollments" on public.engagement_enrollments;
create policy "service role enrollments"
  on public.engagement_enrollments for all
  using (true) with check (true);
drop policy if exists "service role messages" on public.engagement_messages;
create policy "service role messages"
  on public.engagement_messages for all
  using (true) with check (true);
drop policy if exists "service role channel preferences" on public.user_channel_preferences;
create policy "service role channel preferences"
  on public.user_channel_preferences for all
  using (true) with check (true);
drop policy if exists "service role delivery events" on public.provider_delivery_events;
create policy "service role delivery events"
  on public.provider_delivery_events for all
  using (true) with check (true);
drop policy if exists "service role conversions" on public.engagement_conversions;
create policy "service role conversions"
  on public.engagement_conversions for all
  using (true) with check (true);
drop policy if exists "service role event log" on public.engagement_event_log;
create policy "service role event log"
  on public.engagement_event_log for all
  using (true) with check (true);

create or replace function public.touch_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_engagement_campaigns_updated_at on public.engagement_campaigns;
create trigger trg_engagement_campaigns_updated_at
before update on public.engagement_campaigns
for each row execute function public.touch_updated_at_column();

drop trigger if exists trg_engagement_enrollments_updated_at on public.engagement_enrollments;
create trigger trg_engagement_enrollments_updated_at
before update on public.engagement_enrollments
for each row execute function public.touch_updated_at_column();

create or replace function public.resolve_user_channel(
  p_user_id uuid,
  p_primary_channel public.engagement_channel,
  p_fallback_channel public.engagement_channel default null
)
returns public.engagement_channel
language plpgsql
security definer
as $$
declare
  prefs record;
begin
  select * into prefs
  from public.user_channel_preferences
  where user_id = p_user_id;

  if p_primary_channel = 'email' and coalesce(prefs.email_opt_in, true) then
    return p_primary_channel;
  elsif p_primary_channel = 'sms' and coalesce(prefs.sms_opt_in, false) then
    return p_primary_channel;
  elsif p_primary_channel = 'rcs' and coalesce(prefs.sms_opt_in, false) then
    return p_primary_channel;
  elsif p_primary_channel = 'whatsapp' and coalesce(prefs.whatsapp_opt_in, false) then
    return p_primary_channel;
  end if;

  if p_fallback_channel is null then
    return null;
  end if;

  if p_fallback_channel = 'email' and coalesce(prefs.email_opt_in, true) then
    return p_fallback_channel;
  elsif p_fallback_channel = 'sms' and coalesce(prefs.sms_opt_in, false) then
    return p_fallback_channel;
  elsif p_fallback_channel = 'rcs' and coalesce(prefs.sms_opt_in, false) then
    return p_fallback_channel;
  elsif p_fallback_channel = 'whatsapp' and coalesce(prefs.whatsapp_opt_in, false) then
    return p_fallback_channel;
  end if;

  return null;
end;
$$;

insert into public.engagement_campaigns (slug, name, objective, kpi_name, segment_rule, is_active)
values (
  'signup_activation_5day',
  'Signup Activation 5-Day',
  'Drive users to complete first key action in 7 days',
  '7_day_return_rate',
  '{"type":"signup_inactive_24h","requires":{"first_key_action":false}}'::jsonb,
  true
)
on conflict (slug) do update
set objective = excluded.objective,
    kpi_name = excluded.kpi_name,
    segment_rule = excluded.segment_rule,
    is_active = excluded.is_active,
    updated_at = now();

with campaign as (
  select id from public.engagement_campaigns where slug = 'signup_activation_5day'
)
insert into public.engagement_steps (
  campaign_id, step_order, day_offset, channel, fallback_channel, template_key, delay_minutes, max_attempts, metadata
)
select campaign.id, s.step_order, s.day_offset, s.channel::public.engagement_channel, s.fallback_channel::public.engagement_channel, s.template_key, 0, 3, '{}'::jsonb
from campaign
join (
  values
    (1, 1, 'email', 'whatsapp', 'onboarding_day1_email_v1'),
    (2, 2, 'whatsapp', 'sms', 'onboarding_day2_whatsapp_v1'),
    (3, 3, 'rcs', 'sms', 'onboarding_day3_rcs_v1'),
    (4, 5, 'email', 'sms', 'onboarding_day5_email_offer_v1')
) as s(step_order, day_offset, channel, fallback_channel, template_key) on true
on conflict (campaign_id, step_order) do update
set day_offset = excluded.day_offset,
    channel = excluded.channel,
    fallback_channel = excluded.fallback_channel,
    template_key = excluded.template_key,
    max_attempts = excluded.max_attempts,
    is_active = true;
