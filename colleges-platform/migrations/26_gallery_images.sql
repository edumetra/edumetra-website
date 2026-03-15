-- ============================================================
-- Migration 26: Add gallery_images to colleges table
-- ============================================================

ALTER TABLE colleges ADD COLUMN IF NOT EXISTS gallery_images text[];
