-- ============================================================
-- STEP 7: Seed Data — First Campaign
-- Run after 06_functions_triggers.sql
-- Safe to re-run: uses ON CONFLICT DO UPDATE (upsert)
-- ============================================================

-- Signup Activation Campaign
insert into public.engagement_campaigns (slug, name, objective, kpi_name, segment_rule, is_active)
values (
  'signup_activation_5day',
  'Signup Activation 5-Day',
  'Drive users to complete first key action within 7 days of signup',
  '7_day_return_rate',
  '{"type": "signup_inactive_24h", "requires": {"first_key_action": false}}'::jsonb,
  true
)
on conflict (slug) do update set
  objective        = excluded.objective,
  kpi_name         = excluded.kpi_name,
  segment_rule     = excluded.segment_rule,
  is_active        = excluded.is_active,
  updated_at       = now();

-- Campaign Steps (Day 1, 2, 3, 5)
-- step_order=4 is day 5 (day_offset=5) — not a mistake, just the 4th step
with campaign as (
  select id from public.engagement_campaigns where slug = 'signup_activation_5day'
)
insert into public.engagement_steps (
  campaign_id, step_order, day_offset, channel, fallback_channel,
  template_key, delay_minutes, max_attempts, metadata
)
select
  campaign.id,
  s.step_order,
  s.day_offset,
  s.channel::public.engagement_channel,
  s.fallback_channel::public.engagement_channel,
  s.template_key,
  0,
  3,
  '{}'::jsonb
from campaign
join (
  values
    -- step_order, day_offset, channel,    fallback,  template_key
    (1,            1,          'email',    'whatsapp', 'onboarding_day1_email_v1'),
    (2,            2,          'whatsapp', 'sms',      'onboarding_day2_whatsapp_v1'),
    (3,            3,          'rcs',      'sms',      'onboarding_day3_rcs_v1'),
    (4,            5,          'email',    'sms',      'onboarding_day5_email_offer_v1')
) as s(step_order, day_offset, channel, fallback_channel, template_key) on true
on conflict (campaign_id, step_order) do update set
  day_offset       = excluded.day_offset,
  channel          = excluded.channel,
  fallback_channel = excluded.fallback_channel,
  template_key     = excluded.template_key,
  max_attempts     = excluded.max_attempts,
  is_active        = true;
