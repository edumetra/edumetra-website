-- Migration 14: Add Premium Tiers to college_details

-- Add columns for feature visibility at different tiers.
-- If the column already exists (e.g. from previous attempts), IF NOT EXISTS prevents errors.
ALTER TABLE public.college_details
    ADD COLUMN IF NOT EXISTS visible_in_free text[] DEFAULT '{}'::text[],
    ADD COLUMN IF NOT EXISTS visible_in_signed_up text[] DEFAULT '{}'::text[],
    ADD COLUMN IF NOT EXISTS visible_in_pro text[] DEFAULT '{}'::text[],
    ADD COLUMN IF NOT EXISTS visible_in_premium text[] DEFAULT '{}'::text[];

-- Optional: Drop the unused premium_locked_features if it exists (but we verified it doesn't)
-- ALTER TABLE public.college_details DROP COLUMN IF EXISTS premium_locked_features;
