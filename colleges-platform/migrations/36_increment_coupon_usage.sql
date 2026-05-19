-- ============================================================
-- Migration 36: Coupon Usage Increment Function
-- Run this in the Supabase SQL Dashboard → SQL Editor
-- ============================================================

CREATE OR REPLACE FUNCTION public.increment_coupon_usage(p_code TEXT)
RETURNS VOID SECURITY DEFINER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.coupons
  SET used_count = COALESCE(used_count, 0) + 1
  WHERE code = UPPER(p_code);
END;
$$;
