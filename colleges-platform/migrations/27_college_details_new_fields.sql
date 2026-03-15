-- ============================================================
-- Migration 27: Add New College Details Fields
-- Adds fields for minority status, intake capacity, reservations, and fee structures.
-- ============================================================

ALTER TABLE college_details
  ADD COLUMN IF NOT EXISTS minority_status BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS intake_capacity INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reservation_percentages JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS category_fees JSONB DEFAULT '{}'::jsonb;
