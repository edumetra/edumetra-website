-- ============================================================
-- Migration 13: Core Data Management Improvements
-- Combines courses, complex fee structures, cutoffs, and rankings.
-- Run this in the Supabase SQL Dashboard → SQL Editor
-- ============================================================

-- -------------------------------------------------------
-- 1. COLLEGES EXTENSION (Accreditations & Intake)
-- -------------------------------------------------------
ALTER TABLE colleges
  ADD COLUMN IF NOT EXISTS accreditations TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS intake_capacity INTEGER;

-- -------------------------------------------------------
-- 2. COLLEGE COURSES (Relational Replacement for JSONB)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS college_courses (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  college_id           UUID REFERENCES colleges(id) ON DELETE CASCADE NOT NULL,
  name                 TEXT NOT NULL,
  duration             TEXT NOT NULL, -- e.g., "5.5 Years"
  eligibility_criteria TEXT,
  created_at           TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE college_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view courses."
  ON college_courses FOR SELECT USING (true);

CREATE POLICY "Admins can manage courses."
  ON college_courses FOR ALL 
  USING (auth.uid() IN (SELECT id FROM admins))
  WITH CHECK (auth.uid() IN (SELECT id FROM admins));

-- -------------------------------------------------------
-- 3. COURSE FEES BREAKDOWN
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS course_fees_breakdown (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id    UUID REFERENCES college_courses(id) ON DELETE CASCADE NOT NULL,
  fee_type     TEXT NOT NULL, -- e.g., "Tuition Fee", "Hostel Fee", "Mess Fee"
  amount       INTEGER NOT NULL,
  is_annual    BOOLEAN DEFAULT true,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE course_fees_breakdown ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view fee breakdowns."
  ON course_fees_breakdown FOR SELECT USING (true);

CREATE POLICY "Admins can manage fee breakdowns."
  ON course_fees_breakdown FOR ALL 
  USING (auth.uid() IN (SELECT id FROM admins))
  WITH CHECK (auth.uid() IN (SELECT id FROM admins));

-- -------------------------------------------------------
-- 4. CUTOFFS ENGINE
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS cutoffs (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  college_id     UUID REFERENCES colleges(id) ON DELETE CASCADE NOT NULL,
  course_id      UUID REFERENCES college_courses(id) ON DELETE CASCADE, -- Optional, can map to entire college
  exam_name      TEXT NOT NULL, -- 'NEET', 'JEE', etc.
  year           INTEGER NOT NULL,
  category       TEXT NOT NULL, -- 'General', 'OBC', 'AIQ', 'State Quota'
  closing_score  NUMERIC,
  closing_rank   INTEGER,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE cutoffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cutoffs."
  ON cutoffs FOR SELECT USING (true);

CREATE POLICY "Admins can manage cutoffs."
  ON cutoffs FOR ALL 
  USING (auth.uid() IN (SELECT id FROM admins))
  WITH CHECK (auth.uid() IN (SELECT id FROM admins));

-- -------------------------------------------------------
-- 5. RANKINGS ENGINE
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS rankings (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  college_id     UUID REFERENCES colleges(id) ON DELETE CASCADE NOT NULL,
  provider       TEXT NOT NULL, -- 'NIRF', 'India Today', 'QS World'
  year           INTEGER NOT NULL,
  rank           INTEGER NOT NULL,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rankings."
  ON rankings FOR SELECT USING (true);

CREATE POLICY "Admins can manage rankings."
  ON rankings FOR ALL 
  USING (auth.uid() IN (SELECT id FROM admins))
  WITH CHECK (auth.uid() IN (SELECT id FROM admins));
