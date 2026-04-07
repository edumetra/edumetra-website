-- Add is_subscriber_only boolean to news_updates
ALTER TABLE public.news_updates
ADD COLUMN IF NOT EXISTS is_subscriber_only BOOLEAN DEFAULT false;
