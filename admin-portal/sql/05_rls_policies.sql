-- ============================================================
-- STEP 5: Row Level Security (RLS)
-- Run after 04_indexes.sql
--
-- DESIGN:
--   All engagement tables are SERVER-SIDE ONLY (accessed via service role key).
--   The service role bypasses RLS entirely — no policies needed for it.
--
--   We enable RLS and add RESTRICTIVE policies so that:
--     - Frontend clients (anon / authenticated) cannot access these tables at all
--     - Users can read/update ONLY their own preferences (user_channel_preferences)
--     - Everything else is blocked from non-service-role access
-- ============================================================

alter table public.engagement_campaigns         enable row level security;
alter table public.engagement_steps             enable row level security;
alter table public.engagement_enrollments       enable row level security;
alter table public.engagement_messages          enable row level security;
alter table public.user_channel_preferences     enable row level security;
alter table public.provider_delivery_events     enable row level security;
alter table public.engagement_conversions       enable row level security;
alter table public.engagement_event_log         enable row level security;

-- ── engagement_campaigns ──────────────────────────────────────
-- Server-only. No frontend access. Service role bypasses RLS.
drop policy if exists "campaigns_no_public_access" on public.engagement_campaigns;
-- No policy = no access for anon/authenticated. Service role still works.

-- ── engagement_steps ─────────────────────────────────────────
drop policy if exists "steps_no_public_access" on public.engagement_steps;
-- No policy = no access for anon/authenticated.

-- ── engagement_enrollments ───────────────────────────────────
-- Users can read their own enrollment status (e.g. for frontend status pages).
-- Only service role can insert/update/delete.
drop policy if exists "enrollments_user_read_own" on public.engagement_enrollments;
create policy "enrollments_user_read_own"
  on public.engagement_enrollments
  for select
  using (auth.uid() = user_id);

-- ── engagement_messages ──────────────────────────────────────
-- Users can read their own message history.
-- Only service role can insert/update/delete.
drop policy if exists "messages_user_read_own" on public.engagement_messages;
create policy "messages_user_read_own"
  on public.engagement_messages
  for select
  using (auth.uid() = user_id);

-- ── user_channel_preferences ─────────────────────────────────
-- Users can read and update their own preferences (opt-in/out toggles on frontend).
-- Only service role can insert (created server-side on first enrollment).
drop policy if exists "prefs_user_read_own" on public.user_channel_preferences;
create policy "prefs_user_read_own"
  on public.user_channel_preferences
  for select
  using (auth.uid() = user_id);

drop policy if exists "prefs_user_update_own" on public.user_channel_preferences;
create policy "prefs_user_update_own"
  on public.user_channel_preferences
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── provider_delivery_events ─────────────────────────────────
-- Server-only. No user-facing access.
-- No policy = blocked for non-service-role.

-- ── engagement_conversions ───────────────────────────────────
-- Users can read their own conversions.
drop policy if exists "conversions_user_read_own" on public.engagement_conversions;
create policy "conversions_user_read_own"
  on public.engagement_conversions
  for select
  using (auth.uid() = user_id);

-- ── engagement_event_log ─────────────────────────────────────
-- Server-only audit trail. No user access.
-- No policy = blocked for non-service-role.
