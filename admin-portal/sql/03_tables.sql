-- ============================================================
-- STEP 3: Tables
-- Run after 02_enums.sql
-- ============================================================

-- Campaign definitions (the journeys: e.g. "Signup 5-Day Activation")
create table if not exists public.engagement_campaigns (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  name             text not null,
  objective        text not null,
  kpi_name         text not null default '7_day_return_rate',
  segment_rule     jsonb not null default '{}'::jsonb,
  is_active        boolean not null default true,
  schedule_version integer not null default 1,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Individual steps within a campaign (day 1 email, day 2 whatsapp, etc.)
create table if not exists public.engagement_steps (
  id               uuid primary key default gen_random_uuid(),
  campaign_id      uuid not null references public.engagement_campaigns(id) on delete cascade,
  step_order       integer not null,
  day_offset       integer not null check (day_offset >= 0),
  channel          public.engagement_channel not null,
  fallback_channel public.engagement_channel,
  template_key     text not null,
  delay_minutes    integer not null default 0,
  max_attempts     integer not null default 3,
  is_active        boolean not null default true,
  metadata         jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now(),
  unique(campaign_id, step_order)
);

-- Per-user channel opt-ins and quiet hours settings
create table if not exists public.user_channel_preferences (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  email_opt_in         boolean not null default true,
  sms_opt_in           boolean not null default false,
  -- rcs shares sms_opt_in: if user opts out of SMS they also opt out of RCS
  whatsapp_opt_in      boolean not null default false,
  timezone             text not null default 'Asia/Kolkata',
  locale               text not null default 'en-IN',
  quiet_hours_start    smallint not null default 22 check (quiet_hours_start between 0 and 23),
  quiet_hours_end      smallint not null default 8 check (quiet_hours_end between 0 and 23),
  max_touches_per_day  smallint not null default 1 check (max_touches_per_day between 1 and 5),
  unsubscribed_at      timestamptz,
  updated_at           timestamptz not null default now()
);

-- One row per user per campaign — tracks their progress through the journey
create table if not exists public.engagement_enrollments (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  campaign_id         uuid not null references public.engagement_campaigns(id) on delete cascade,
  status              public.engagement_enrollment_status not null default 'active',
  current_step_order  integer not null default 1,
  enrolled_at         timestamptz not null default now(),
  next_run_at         timestamptz not null default now(),
  completed_at        timestamptz,
  exited_at           timestamptz,
  exit_reason         text,
  holdout_group       boolean not null default false,
  variant             text not null default 'A',
  metadata            jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique(user_id, campaign_id)
);

-- Every outbound message attempt logged here
create table if not exists public.engagement_messages (
  id                  uuid primary key default gen_random_uuid(),
  enrollment_id       uuid not null references public.engagement_enrollments(id) on delete cascade,
  step_id             uuid not null references public.engagement_steps(id) on delete cascade,
  user_id             uuid not null references auth.users(id) on delete cascade,
  channel             public.engagement_channel not null,
  provider            text not null,
  status              public.engagement_message_status not null default 'pending',
  template_key        text not null,
  idempotency_key     text not null unique,
  provider_message_id text,
  attempt_no          integer not null default 1,
  payload             jsonb not null default '{}'::jsonb,
  error_code          text,
  error_message       text,
  scheduled_at        timestamptz not null default now(),
  sent_at             timestamptz,
  delivered_at        timestamptz,
  read_at             timestamptz,
  created_at          timestamptz not null default now()
);

-- Raw delivery receipts from all provider webhooks
create table if not exists public.provider_delivery_events (
  id                  uuid primary key default gen_random_uuid(),
  message_id          uuid references public.engagement_messages(id) on delete set null,
  provider            text not null,
  provider_message_id text,
  event_type          text not null,
  event_time          timestamptz not null default now(),
  raw_payload         jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now()
);

-- Records when a user completes the target action (the "conversion")
create table if not exists public.engagement_conversions (
  id               uuid primary key default gen_random_uuid(),
  enrollment_id    uuid not null references public.engagement_enrollments(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  conversion_event text not null,
  revenue          numeric(12,2),
  converted_at     timestamptz not null default now(),
  metadata         jsonb not null default '{}'::jsonb
);

-- Audit log of all product-side events that trigger enrollment
create table if not exists public.engagement_event_log (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  event_name  text not null,
  event_time  timestamptz not null default now(),
  metadata    jsonb not null default '{}'::jsonb
);
