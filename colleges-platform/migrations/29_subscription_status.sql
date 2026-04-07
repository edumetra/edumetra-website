-- Migration: 29_subscription_status
-- Purpose: Adds subscription_status column to track Razorpay recurring mandates.

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT NULL;

-- Example values: 'active', 'past_due', 'cancelled', 'halted', 'completed'
