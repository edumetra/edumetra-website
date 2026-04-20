-- ============================================================
-- STEP 6: Functions and Triggers
-- Run after 05_rls_policies.sql
-- ============================================================

-- ── auto-update updated_at timestamps ────────────────────────
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

drop trigger if exists trg_user_channel_preferences_updated_at on public.user_channel_preferences;
create trigger trg_user_channel_preferences_updated_at
  before update on public.user_channel_preferences
  for each row execute function public.touch_updated_at_column();

-- ── resolve_user_channel RPC ─────────────────────────────────
-- Resolves which channel to actually use for a user, checking their opt-ins.
-- Returns the primary channel if opted-in, fallback if not, or NULL if neither.
-- Note: RCS shares sms_opt_in since they're delivered via the same SMS number.
-- Called by the dispatcher engine via supabase.rpc('resolve_user_channel', {...})
create or replace function public.resolve_user_channel(
  p_user_id         uuid,
  p_primary_channel public.engagement_channel,
  p_fallback_channel public.engagement_channel default null
)
returns public.engagement_channel
language plpgsql
security definer
as $$
declare
  prefs record;

  -- Helper to check if a given channel is opted-in for this user
  function_check_channel boolean;
begin
  select * into prefs
  from public.user_channel_preferences
  where user_id = p_user_id;

  -- Check primary channel consent
  if p_primary_channel = 'email'    and coalesce(prefs.email_opt_in, true)    then return p_primary_channel; end if;
  if p_primary_channel = 'whatsapp' and coalesce(prefs.whatsapp_opt_in, false) then return p_primary_channel; end if;
  if p_primary_channel = 'sms'      and coalesce(prefs.sms_opt_in, false)      then return p_primary_channel; end if;
  -- RCS uses sms_opt_in (same number, same consent)
  if p_primary_channel = 'rcs'      and coalesce(prefs.sms_opt_in, false)      then return p_primary_channel; end if;

  -- Primary not available — try fallback
  if p_fallback_channel is null then return null; end if;

  if p_fallback_channel = 'email'    and coalesce(prefs.email_opt_in, true)    then return p_fallback_channel; end if;
  if p_fallback_channel = 'whatsapp' and coalesce(prefs.whatsapp_opt_in, false) then return p_fallback_channel; end if;
  if p_fallback_channel = 'sms'      and coalesce(prefs.sms_opt_in, false)      then return p_fallback_channel; end if;
  if p_fallback_channel = 'rcs'      and coalesce(prefs.sms_opt_in, false)      then return p_fallback_channel; end if;

  -- No eligible channel
  return null;
end;
$$;
