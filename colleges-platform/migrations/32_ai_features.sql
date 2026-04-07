-- Migration 32: AI Features Support
-- Tables for storing AI-generated study plans and caching review insights.

-- Table for NEET Prep Plans
CREATE TABLE IF NOT EXISTS public.user_neet_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    form_data JSONB NOT NULL,
    plan_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for user_neet_plans
ALTER TABLE public.user_neet_plans ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own neet plans') THEN
        CREATE POLICY "Users can view own neet plans" ON public.user_neet_plans FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own neet plans') THEN
        CREATE POLICY "Users can insert own neet plans" ON public.user_neet_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Table for AI Review Insights Cache
-- This helps save API costs by not re-generating insights for the same college unless reviews change significantly.
CREATE TABLE IF NOT EXISTS public.ai_review_insights_cache (
    college_id UUID PRIMARY KEY REFERENCES public.colleges(id) ON DELETE CASCADE,
    insights JSONB NOT NULL,
    review_count INTEGER NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for ai_review_insights_cache (Publicly readable)
ALTER TABLE public.ai_review_insights_cache ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view cached insights') THEN
        CREATE POLICY "Anyone can view cached insights" ON public.ai_review_insights_cache FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update cache') THEN
        CREATE POLICY "Admins can update cache" ON public.ai_review_insights_cache FOR ALL USING (true);
    END IF;
END $$;

-- Track AI Usage in user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS ai_usage_count INTEGER DEFAULT 0;

-- Function to safely increment AI usage
CREATE OR REPLACE FUNCTION public.increment_ai_usage(user_id_param UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.user_profiles
    SET ai_usage_count = ai_usage_count + 1
    WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
