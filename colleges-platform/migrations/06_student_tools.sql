-- Migration 06: Student Tools & Monetization columns

-- Cutoffs data for Eligibility Checker
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS cutoffs JSONB DEFAULT '[]'::jsonb;
-- Format: [{ "exam": "jee_main", "min_score": 85, "max_rank": null }, { "exam": "jee_advanced", "max_rank": 10000 }]

-- Subscription tier on user profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT NOT NULL DEFAULT 'free'
    CHECK (subscription_tier IN ('free', 'premium', 'pro'));

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

-- Index for faster eligibility queries
CREATE INDEX IF NOT EXISTS colleges_stream_idx ON colleges (stream) WHERE visibility = 'public';
CREATE INDEX IF NOT EXISTS colleges_state_fees_idx ON colleges (location_state, fees_numeric) WHERE visibility = 'public';

-- RLS: users can only read their own subscription tier  
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());
