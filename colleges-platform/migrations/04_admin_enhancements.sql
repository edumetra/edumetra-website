-- ============================================================
-- Migration 04: Admin Enhancements
-- Run this in the Supabase SQL Dashboard → SQL Editor
-- ============================================================

-- -------------------------------------------------------
-- 1. COLLEGES: Replace is_published with visibility enum
-- -------------------------------------------------------

-- Add new visibility column with default 'draft'
ALTER TABLE colleges
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'draft'
    CHECK (visibility IN ('public', 'draft', 'hidden'));

-- Migrate existing data
UPDATE colleges SET visibility = 'public' WHERE is_published = TRUE;
UPDATE colleges SET visibility = 'draft'  WHERE is_published = FALSE;

-- Update RLS: public sees only 'public' colleges
DROP POLICY IF EXISTS "Public can view published colleges." ON colleges;
DROP POLICY IF EXISTS "Public can view published colleges." ON colleges;
CREATE POLICY "Public can view published colleges."
  ON colleges FOR SELECT
  USING (visibility = 'public');

-- Admins see everything (already created in migration 03, kept for safety)
DROP POLICY IF EXISTS "Admins can view all colleges." ON colleges;
CREATE POLICY "Admins can view all colleges."
  ON colleges FOR SELECT
  USING (auth.uid() IN (SELECT id FROM admins));

-- Allow admins to update visibility
DROP POLICY IF EXISTS "Admins can update colleges." ON colleges;
CREATE POLICY "Admins can update colleges."
  ON colleges FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM admins));

-- -------------------------------------------------------
-- 2. REVIEWS: Replace is_approved with moderation_status
-- -------------------------------------------------------

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS moderation_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (moderation_status IN ('visible', 'hidden', 'pending'));

-- Migrate existing data
UPDATE reviews SET moderation_status = 'visible' WHERE is_approved = TRUE;
UPDATE reviews SET moderation_status = 'pending' WHERE is_approved = FALSE;

-- Update RLS: public sees only 'visible' reviews
DROP POLICY IF EXISTS "Public can view approved reviews." ON reviews;
DROP POLICY IF EXISTS "Public reviews are viewable by everyone." ON reviews;
DROP POLICY IF EXISTS "Public can view visible reviews." ON reviews;
CREATE POLICY "Public can view visible reviews."
  ON reviews FOR SELECT
  USING (moderation_status = 'visible');

-- Admins see all reviews
DROP POLICY IF EXISTS "Admins can view all reviews." ON reviews;
CREATE POLICY "Admins can view all reviews."
  ON reviews FOR SELECT
  USING (auth.uid() IN (SELECT id FROM admins));

DROP POLICY IF EXISTS "Admins can update reviews." ON reviews;
CREATE POLICY "Admins can update reviews."
  ON reviews FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM admins));

DROP POLICY IF EXISTS "Admins can delete reviews." ON reviews;
CREATE POLICY "Admins can delete reviews."
  ON reviews FOR DELETE
  USING (auth.uid() IN (SELECT id FROM admins));

-- -------------------------------------------------------
-- 3. USER PROFILES: account_type + ban control
-- -------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  account_type TEXT NOT NULL DEFAULT 'free'
    CHECK (account_type IN ('free', 'premium', 'pro')),
  is_banned   BOOLEAN NOT NULL DEFAULT FALSE,
  banned_at   TIMESTAMP WITH TIME ZONE,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
DROP POLICY IF EXISTS "Users can view own profile." ON user_profiles;
CREATE POLICY "Users can view own profile."
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins can read all profiles
DROP POLICY IF EXISTS "Admins can view all profiles." ON user_profiles;
CREATE POLICY "Admins can view all profiles."
  ON user_profiles FOR SELECT
  USING (auth.uid() IN (SELECT id FROM admins));

-- Admins can update (ban/unban, change account type)
DROP POLICY IF EXISTS "Admins can update profiles." ON user_profiles;
CREATE POLICY "Admins can update profiles."
  ON user_profiles FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM admins));

-- Auto-create profile on new user signup via trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.user_profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
