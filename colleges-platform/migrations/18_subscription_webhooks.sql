-- Migration: 18_subscription_webhooks
-- Purpose: Adds subscription tracking fields to user_profiles to verify premium access and auto-downgrade expired roles.

-- 1. Add subscription tracking columns
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS premium_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS razorpay_customer_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT DEFAULT NULL;

-- 2. Performance Indexes (to quickly isolate expiring subscriptions)
CREATE INDEX IF NOT EXISTS idx_user_profiles_premium_until ON public.user_profiles(premium_until);
CREATE INDEX IF NOT EXISTS idx_user_profiles_rzp_sub_id ON public.user_profiles(razorpay_subscription_id);

-- Optional: Create a database cron trigger or schedule (requires pg_cron) to auto-downgrade expired users back to 'free'
-- If pg_cron is enabled in Supabase:
-- SELECT cron.schedule('downgrade-expired-premiums', '0 * * * *', $$
--   UPDATE public.user_profiles
--   SET account_type = 'free', premium_until = NULL, razorpay_subscription_id = NULL
--   WHERE premium_until < NOW() AND account_type IN ('premium', 'pro');
-- $$);
