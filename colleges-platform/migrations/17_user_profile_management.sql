-- ============================================================
-- Migration 17: User Profile Management
-- Extends the user_profiles table with additional personal 
-- and academic details, and grants users permission to update
-- their own records.
-- ============================================================

-- 1. Add new profile fields to user_profiles
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS stream TEXT;

-- 2. Add an RLS policy so users can UPDATE their own row
-- (They already have a SELECT policy from migration 04)
DROP POLICY IF EXISTS "Users can update own profile." ON public.user_profiles;
CREATE POLICY "Users can update own profile."
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- 3. Also make sure the handle_new_user() trigger function safely inserts without overriding these fields if we ever upsert
-- Currently it just does an INSERT ... ON CONFLICT (id) DO NOTHING which is perfectly safe for these new columns.
