-- ============================================================
-- Migration 34: Coupon Management System
-- Run this in the Supabase SQL Dashboard → SQL Editor
-- ============================================================

-- 1. Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_percentage NUMERIC NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
    razorpay_offer_id TEXT, -- Associated Offer ID from Razorpay Dashboard
    is_active BOOLEAN DEFAULT TRUE,
    max_uses INTEGER, -- Optional limit on total uses
    used_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- Public (Students) can view active coupons to validate them
CREATE POLICY "Public can view active coupons."
  ON coupons FOR SELECT
  USING ( is_active = true AND (expires_at IS NULL OR expires_at > NOW()) );

-- Admins (Superadmin only) can manage coupons
CREATE POLICY "Superadmins can manage coupons."
  ON coupons FOR ALL
  USING ( 
    auth.uid() IN (SELECT id FROM admins WHERE role = 'superadmin') 
  );

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);
