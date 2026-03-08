-- Migration: 19_audit_logs_system_events
-- Purpose: Relaxes audit_logs constraints to allow system-level events (like webhooks) that don't have a human admin.

-- 1. Make admin_email nullable (to support System/Webhook actions)
ALTER TABLE public.audit_logs 
ALTER COLUMN admin_email DROP NOT NULL;

-- 2. Add 'SYSTEM' to admin_email if it's null during webhook events or use a special flag
-- (Handled at application level, but schema must allow it)

-- 3. Ensure action_type check includes 'SYSTEM' if needed, or just use 'OTHER'
-- Currently: action_type IN ('CREATE', 'UPDATE', 'DELETE', 'BULK_UPDATE', 'OTHER')
-- We will use 'UPDATE' for role changes.
