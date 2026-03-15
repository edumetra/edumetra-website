-- ============================================================
-- Migration 21: Comprehensive User Profiles
-- Extends the user_profiles table with additional personal, 
-- educational, exam, and preference details.
-- ============================================================

-- Add new columns to public.user_profiles
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS dob DATE,
  
  -- Education
  ADD COLUMN IF NOT EXISTS tenth_board TEXT,
  ADD COLUMN IF NOT EXISTS tenth_passing_year INTEGER,
  ADD COLUMN IF NOT EXISTS tenth_percentage NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS twelfth_board TEXT,
  ADD COLUMN IF NOT EXISTS twelfth_passing_year INTEGER,
  ADD COLUMN IF NOT EXISTS twelfth_percentage NUMERIC(5,2),
  
  -- Entrance Exams
  -- Expected JSON structure: [{"exam": "JEE Main", "score": "95.5", "rank": "15000"}, ...]
  ADD COLUMN IF NOT EXISTS entrance_exams JSONB DEFAULT '[]'::jsonb,
  
  -- Preferences
  -- Storing as JSON arrays for easy reading/writing from React
  ADD COLUMN IF NOT EXISTS preferred_courses JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS preferred_locations JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS budget_range TEXT;

-- Note: The existing RLS policy "Users can update own profile." created in migration 17
-- automatically applies to these new columns as well.
