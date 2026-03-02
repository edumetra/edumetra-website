-- ============================================================
-- Migration 12: Admin Role-Based Access Control (RBAC)
-- Run this in the Supabase SQL Dashboard → SQL Editor
-- ============================================================

-- -------------------------------------------------------
-- 1. ADMINS: Add 'role' column
-- -------------------------------------------------------
ALTER TABLE admins
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'superadmin'
    CHECK (role IN ('superadmin', 'mini_admin'));

-- Note: Existing admins will automatically be 'superadmin' because of the default value.

-- -------------------------------------------------------
-- 2. UPDATE RLS for Admins Table
-- -------------------------------------------------------
-- Currently, admins can insert/update/delete any other admin. We need to restrict this to 'superadmin' only.

-- Drop existing generic policies if they exist (from migration 02 or manual creation)
DROP POLICY IF EXISTS "Admins can view all admins." ON admins;
DROP POLICY IF EXISTS "Admins can insert admins." ON admins;
DROP POLICY IF EXISTS "Admins can update admins." ON admins;
DROP POLICY IF EXISTS "Admins can delete admins." ON admins;

-- Policy: ALL admins can view the admin list
CREATE POLICY "Admins can view all admins."
  ON admins FOR SELECT
  USING ( auth.uid() IN (SELECT id FROM admins) );

-- Policy: ONLY superadmins can insert new admins
CREATE POLICY "Superadmins can insert admins."
  ON admins FOR INSERT
  WITH CHECK ( 
    auth.uid() IN (SELECT id FROM admins WHERE role = 'superadmin') 
  );

-- Policy: ONLY superadmins can update other admins (change roles)
CREATE POLICY "Superadmins can update admins."
  ON admins FOR UPDATE
  USING ( auth.uid() IN (SELECT id FROM admins WHERE role = 'superadmin') );

-- Policy: ONLY superadmins can delete admins (revoke access)
CREATE POLICY "Superadmins can delete admins."
  ON admins FOR DELETE
  USING ( auth.uid() IN (SELECT id FROM admins WHERE role = 'superadmin') );
