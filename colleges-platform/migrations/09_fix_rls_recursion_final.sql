-- ============================================================
-- Migration 09: Final RLS Recursion Fix & Insert Restrictions
-- Run this in the Supabase SQL Dashboard → SQL Editor
-- ============================================================

-- 1. Break the recursion loop on the admins table
-- We must NOT call is_admin() inside the admins table's own policy.
DROP POLICY IF EXISTS "Admins can view all admins." ON admins;
CREATE POLICY "Admins can view all admins." 
  ON admins FOR SELECT 
  USING (auth.uid() = id);

-- 2. Restrict college insertion to admins
-- This replaces the "Anyone can insert" policy from migration 00
DROP POLICY IF EXISTS "Anyone can insert colleges" ON colleges;
CREATE POLICY "Admins can insert colleges" 
  ON colleges FOR INSERT 
  WITH CHECK (is_admin());

-- 3. Restrict college details insertion and update to admins
DROP POLICY IF EXISTS "Anyone can insert details" ON college_details;
CREATE POLICY "Admins can insert details" 
  ON college_details FOR INSERT 
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Anyone can update details" ON college_details;
CREATE POLICY "Admins can update details" 
  ON college_details FOR UPDATE 
  USING (is_admin());
