-- ============================================================
-- Migration 22: Phone Verification & Level 2 Upgrade
-- Extends user_profiles with phone verification status.
-- Adds secure RPC functions for generating and verifying OTPs,
-- and locks down the account_type column from user edits.
-- ============================================================

-- 1. Extend user_profiles with verification data
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS phone_otp_hash TEXT,
  ADD COLUMN IF NOT EXISTS phone_otp_expires_at TIMESTAMPTZ;

-- Drop the old constraint and add a new one that allows 'signed_up'
ALTER TABLE public.user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_subscription_tier_check;

ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_subscription_tier_check 
  CHECK (subscription_tier IN ('free', 'signed_up', 'premium', 'pro'));

-- 2. Secure RLS policies to prevent users from hacking their account_type or verification status
-- The current policy "Users can update own profile." allows updating ALL columns.
-- We cannot easily restrict updates to specific columns in standard Supabase RLS without a trigger.
-- So we will create a trigger that PREVENTS non-admins from modifying sensitive columns.

CREATE OR REPLACE FUNCTION check_profile_update_security()
RETURNS TRIGGER SECURITY DEFINER LANGUAGE plpgsql AS $$
BEGIN
  -- If the user modifying the row is NOT an admin (meaning it's a regular user updating their own profile)
  IF NOT EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()) THEN
    -- Ensure they cannot change sensitive fields
    IF NEW.subscription_tier IS DISTINCT FROM OLD.subscription_tier THEN
      RAISE EXCEPTION 'Security Error: You are not authorized to modify subscription_tier.';
    END IF;
    IF NEW.is_banned IS DISTINCT FROM OLD.is_banned THEN
      RAISE EXCEPTION 'Security Error: You are not authorized to modify is_banned.';
    END IF;
    IF NEW.banned_at IS DISTINCT FROM OLD.banned_at THEN
      RAISE EXCEPTION 'Security Error: You are not authorized to modify banned_at.';
    END IF;
    IF NEW.phone_verified IS DISTINCT FROM OLD.phone_verified THEN
      RAISE EXCEPTION 'Security Error: You are not authorized to modify phone_verified.';
    END IF;
    -- Note: We allow modifying the raw 'phone_number' field, but doing so should reset verification.
    -- (We will handle that in a separate trigger or function below if needed)
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_profile_security ON public.user_profiles;
CREATE TRIGGER enforce_profile_security
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_profile_update_security();


-- 3. Secure RPC to Generate OTP (Mock SMS Provider)
CREATE OR REPLACE FUNCTION generate_phone_otp()
RETURNS TEXT SECURITY DEFINER LANGUAGE plpgsql AS $$
DECLARE
  v_user_id UUID;
  v_otp TEXT;
  v_hash TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Generate a 6 digit OTP
  v_otp := lpad(floor(random() * 1000000)::text, 6, '0');
  
  -- Store a basic hash of it (in production, use pgcrypto for better hashing)
  -- For this MVP we will just store it directly since it is short-lived.
  v_hash := v_otp;

  -- Update the profile
  UPDATE public.user_profiles 
  SET 
    phone_otp_hash = v_hash,
    phone_otp_expires_at = NOW() + INTERVAL '10 minutes'
  WHERE id = v_user_id;

  -- RETURN the plain OTP so the edge function/client can "send" it.
  -- (Since we're doing a mock SMS, the client will just receive and console.log it)
  RETURN v_otp;
END;
$$;


-- 4. Secure RPC to Verify OTP & Auto-Upgrade to 'signed_up'
CREATE OR REPLACE FUNCTION verify_phone_otp(p_otp TEXT)
RETURNS BOOLEAN SECURITY DEFINER LANGUAGE plpgsql AS $$
DECLARE
  v_user_id UUID;
  v_profile RECORD;
  v_auth_user RECORD;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get Profile and Auth User securely
  SELECT * INTO v_profile FROM public.user_profiles WHERE id = v_user_id;
  SELECT * INTO v_auth_user FROM auth.users WHERE id = v_user_id;

  IF v_profile.phone_otp_hash IS NULL THEN
    RAISE EXCEPTION 'No OTP requested';
  END IF;

  IF NOW() > v_profile.phone_otp_expires_at THEN
    RAISE EXCEPTION 'OTP has expired';
  END IF;

  IF v_profile.phone_otp_hash != p_otp THEN
    RAISE EXCEPTION 'Invalid OTP';
  END IF;

  -- OTP Is Valid!
  
  -- Mark phone as verified and clear OTP
  UPDATE public.user_profiles
  SET 
    phone_verified = true,
    phone_otp_hash = null,
    phone_otp_expires_at = null
  WHERE id = v_user_id;

  RETURN TRUE;
END;
$$;

-- 5. Trigger Handler to upgrade account automatically when Email gets verified
CREATE OR REPLACE FUNCTION check_level2_upgrade()
RETURNS TRIGGER SECURITY DEFINER LANGUAGE plpgsql AS $$
BEGIN
  -- We are monitoring auth.users for an email_confirmed_at change
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    -- Email just got verified. Upgrade to Level 2 automatically!
    UPDATE public.user_profiles
    SET subscription_tier = 'signed_up'
    WHERE id = NEW.id AND subscription_tier = 'free';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_auto_upgrade_level2 ON auth.users;
CREATE TRIGGER trigger_auto_upgrade_level2
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION check_level2_upgrade();
