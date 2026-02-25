-- ============================================================
-- Migration 07: Fix Admin RLS Recursion
-- Run this in the Supabase SQL Dashboard → SQL Editor
-- ============================================================

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Admins can view all admins." ON admins;

-- Replace with a non-recursive policy
-- This allows a user to see their own entry in the admins table.
-- This is sufficient for other tables to check "auth.uid() IN (SELECT id FROM admins)"
-- as the subquery will correctly return the user's ID if they are an admin.
CREATE POLICY "Admins can view their own record"
  ON admins FOR SELECT
  USING (auth.uid() = id);
