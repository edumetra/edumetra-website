-- ============================================================
-- Migration 10: Temporary RLS Bypass (Bypass Auth)
-- This allows "No Login" development while keeping polcies in place
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- TEMPORARY BYPASS: Always return true
  -- This allows the admin portal to work without a login session
  -- as requested by the user.
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
