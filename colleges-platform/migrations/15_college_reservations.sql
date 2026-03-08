-- ============================================================
-- Migration 15: College Reservations and Minority Status
-- Run this in the Supabase SQL Dashboard → SQL Editor
-- ============================================================

ALTER TABLE colleges
  ADD COLUMN IF NOT EXISTS minority_status TEXT,
  ADD COLUMN IF NOT EXISTS seat_reservations TEXT;
