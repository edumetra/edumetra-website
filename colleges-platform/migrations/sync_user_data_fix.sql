-- ============================================================
-- Sync User Data Fix: email, phone_number, last_sign_in_at
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Ensure columns exist in user_profiles
ALTER TABLE public.user_profiles 
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ;

-- 2. Update the handle_new_user() trigger to sync more fields from auth.users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id, 
    email, 
    full_name, 
    phone_number,
    last_sign_in_at
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    NEW.last_sign_in_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    last_sign_in_at = EXCLUDED.last_sign_in_at,
    full_name = CASE 
      WHEN user_profiles.full_name IS NULL OR user_profiles.full_name = '' 
      THEN EXCLUDED.full_name 
      ELSE user_profiles.full_name 
    END,
    phone_number = CASE 
      WHEN user_profiles.phone_number IS NULL OR user_profiles.phone_number = '' 
      THEN EXCLUDED.phone_number 
      ELSE user_profiles.phone_number 
    END;
  RETURN NEW;
END;
$$;

-- 3. Perform a one-time sync for all existing users to fix "dummy records"
UPDATE public.user_profiles p
SET 
  email = u.email,
  last_sign_in_at = u.last_sign_in_at,
  full_name = COALESCE(NULLIF(p.full_name, ''), u.raw_user_meta_data->>'full_name', ''),
  phone_number = COALESCE(NULLIF(p.phone_number, ''), u.raw_user_meta_data->>'phone', '')
FROM auth.users u
WHERE p.id = u.id;
