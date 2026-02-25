-- ============================================================
-- Migration 08: Robust Admin Check (Non-Recursive)
-- Run this in the Supabase SQL Dashboard → SQL Editor
-- ============================================================

-- 1. Create a robust, non-recursive check function
-- SECURITY DEFINER bypasses RLS on the admins table itself
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Update policies to use the function instead of a subquery
-- This breaks the recursion loop permanently.

-- Admins table itself
DROP POLICY IF EXISTS "Admins can view all admins." ON admins;
CREATE POLICY "Admins can view all admins." ON admins FOR SELECT USING (is_admin());

-- Colleges
DROP POLICY IF EXISTS "Admins can view all colleges." ON colleges;
CREATE POLICY "Admins can view all colleges." ON colleges FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admins can update colleges." ON colleges;
CREATE POLICY "Admins can update colleges." ON colleges FOR UPDATE USING (is_admin());

-- College Details
DROP POLICY IF EXISTS "Admins can view all college details." ON college_details;
CREATE POLICY "Admins can view all college details." ON college_details FOR SELECT USING (is_admin());

-- Profiles
DROP POLICY IF EXISTS "Admins can view all profiles." ON user_profiles;
CREATE POLICY "Admins can view all profiles." ON user_profiles FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admins can update profiles." ON user_profiles;
CREATE POLICY "Admins can update profiles." ON user_profiles FOR UPDATE USING (is_admin());

-- Reviews
DROP POLICY IF EXISTS "Admins can view all reviews." ON reviews;
CREATE POLICY "Admins can view all reviews." ON reviews FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admins can update reviews." ON reviews;
CREATE POLICY "Admins can update reviews." ON reviews FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "Admins can delete reviews." ON reviews;
CREATE POLICY "Admins can delete reviews." ON reviews FOR DELETE USING (is_admin());

-- Applications
DROP POLICY IF EXISTS "Admins can view all applications." ON applications;
CREATE POLICY "Admins can view all applications." ON applications FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admins can update applications." ON applications;
CREATE POLICY "Admins can update applications." ON applications FOR UPDATE USING (is_admin());

-- Q&A
DROP POLICY IF EXISTS "Admins can answer questions." ON college_qa;
CREATE POLICY "Admins can answer questions." ON college_qa FOR UPDATE USING (is_admin());

-- Review Replies
DROP POLICY IF EXISTS "Admins can insert replies." ON review_replies;
CREATE POLICY "Admins can insert replies." ON review_replies FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can delete replies." ON review_replies;
CREATE POLICY "Admins can delete replies." ON review_replies FOR DELETE USING (is_admin());
