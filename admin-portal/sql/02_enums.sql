-- ============================================================
-- STEP 2: Enums
-- Run after 01_extensions.sql
-- ============================================================

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
    create type public.engagement_message_status as enum (
      'pending', 'queued', 'sent', 'delivered', 'read', 'failed', 'cancelled'
    );
  end if;
end $$;
