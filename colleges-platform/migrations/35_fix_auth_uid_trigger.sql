-- ============================================================
-- Migration 35: Fix check_profile_update_security trigger
-- Resolves "Database error creating new user" by allowing 
-- Service Role updates (where auth.uid() is null).
-- ============================================================

CREATE OR REPLACE FUNCTION public.check_profile_update_security()
RETURNS TRIGGER SECURITY DEFINER LANGUAGE plpgsql AS $$
BEGIN
  -- Only enforce restrictions if a specific user is logged in (auth.uid() is not null)
  -- and that user is NOT an admin.
  -- This allows Service Role updates (auth.uid() is null) during admin creation to succeed.
  IF auth.uid() IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()) THEN
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
  END IF;
  
  RETURN NEW;
END;
$$;
