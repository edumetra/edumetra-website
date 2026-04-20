-- ============================================================
-- STEP 4: Indexes
-- Run after 03_tables.sql
-- ============================================================

-- Critical index: scheduler picks due enrollments by status + next_run_at
create index if not exists idx_engagement_enrollments_status_next_run
  on public.engagement_enrollments (status, next_run_at);

-- Daily cap check: count today's messages per user
create index if not exists idx_engagement_messages_user_sent
  on public.engagement_messages (user_id, sent_at desc);

-- Webhook ingestion: look up message by provider_message_id
create index if not exists idx_engagement_messages_provider_msg_id
  on public.engagement_messages (provider_message_id);

-- Status reporting
create index if not exists idx_engagement_messages_status_sent
  on public.engagement_messages (status, sent_at);

-- Delivery events timeline per message
create index if not exists idx_provider_delivery_events_message_time
  on public.provider_delivery_events (message_id, event_time);

-- Step lookup by campaign+order (hot path in dispatcher)
create index if not exists idx_engagement_steps_campaign_order
  on public.engagement_steps (campaign_id, step_order);

-- Event log — look up recent events per user
create index if not exists idx_engagement_event_log_user_time
  on public.engagement_event_log (user_id, event_time desc);

-- Conversion lookup per user
create index if not exists idx_engagement_conversions_user
  on public.engagement_conversions (user_id, converted_at desc);
