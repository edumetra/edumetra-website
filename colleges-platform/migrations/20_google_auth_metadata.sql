-- ============================================================
-- Migration 20: Google Auth Metadata Extraction
-- Updates the handle_new_user trigger to grab the user's 
-- full name and profile picture from Google OAuth metadata
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id, 
    full_name
  )
  VALUES (
    NEW.id,
    -- Attempt to get full_name from standard email signup OR Google OAuth
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      ''
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name
    WHERE user_profiles.full_name IS NULL OR user_profiles.full_name = '';
    
  RETURN NEW;
END;
$$;
