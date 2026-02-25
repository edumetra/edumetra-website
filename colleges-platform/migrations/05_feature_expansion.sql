-- ============================================================
-- Migration 05: Feature Expansion
-- Run this in the Supabase SQL Dashboard → SQL Editor
-- ============================================================

-- -------------------------------------------------------
-- 1. COLLEGES: New columns for Discovery & Detail features
-- -------------------------------------------------------
ALTER TABLE colleges
  ADD COLUMN IF NOT EXISTS stream TEXT,
  ADD COLUMN IF NOT EXISTS naac_grade TEXT,
  ADD COLUMN IF NOT EXISTS fees_numeric INTEGER,
  ADD COLUMN IF NOT EXISTS review_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS campus_photos TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS courses_fees JSONB DEFAULT '[]';

-- -------------------------------------------------------
-- 2. REVIEWS: Helpful vote count cache
-- -------------------------------------------------------
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS helpful_count INTEGER NOT NULL DEFAULT 0;

-- -------------------------------------------------------
-- 3. REVIEW_HELPFUL_VOTES: One vote per user per review
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS review_helpful_votes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id   UUID REFERENCES reviews(id) ON DELETE CASCADE NOT NULL,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(review_id, user_id)
);

ALTER TABLE review_helpful_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can vote once per review."
  ON review_helpful_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their vote."
  ON review_helpful_votes FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read votes."
  ON review_helpful_votes FOR SELECT
  USING (true);

-- -------------------------------------------------------
-- 4. REVIEW_REPLIES: College rep replies to reviews
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS review_replies (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id   UUID REFERENCES reviews(id) ON DELETE CASCADE NOT NULL,
  author_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL DEFAULT 'College Representative',
  reply_text  TEXT NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE review_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read replies."
  ON review_replies FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert replies."
  ON review_replies FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM admins));

CREATE POLICY "Admins can delete replies."
  ON review_replies FOR DELETE
  USING (auth.uid() IN (SELECT id FROM admins));

-- -------------------------------------------------------
-- 5. SAVED_COLLEGES: User bookmarks
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS saved_colleges (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  college_id  UUID REFERENCES colleges(id) ON DELETE CASCADE NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id, college_id)
);

ALTER TABLE saved_colleges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own saved colleges."
  ON saved_colleges FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- -------------------------------------------------------
-- 6. COLLEGE_QA: Q&A section per college
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS college_qa (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  college_id  UUID REFERENCES colleges(id) ON DELETE CASCADE NOT NULL,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name   TEXT NOT NULL DEFAULT 'Anonymous',
  question    TEXT NOT NULL,
  answer      TEXT,
  answered_by TEXT,
  answered_at TIMESTAMP WITH TIME ZONE,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE college_qa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read Q&A."
  ON college_qa FOR SELECT
  USING (true);

CREATE POLICY "Logged-in users can post questions."
  ON college_qa FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Admins can answer questions."
  ON college_qa FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM admins));

-- -------------------------------------------------------
-- 7. TRIGGER: Keep review_count in sync on colleges
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION update_college_review_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE colleges SET review_count = review_count + 1 WHERE id = NEW.college_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE colleges SET review_count = GREATEST(review_count - 1, 0) WHERE id = OLD.college_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_review_change ON reviews;
CREATE TRIGGER on_review_change
  AFTER INSERT OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_college_review_count();

-- Backfill existing review counts
UPDATE colleges c
SET review_count = (
  SELECT COUNT(*) FROM reviews r
  WHERE r.college_id = c.id AND r.moderation_status = 'visible'
);

-- -------------------------------------------------------
-- 8. TRIGGER: Keep helpful_count in sync on reviews
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = NEW.review_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE reviews SET helpful_count = GREATEST(helpful_count - 1, 0) WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_helpful_vote_change ON review_helpful_votes;
CREATE TRIGGER on_helpful_vote_change
  AFTER INSERT OR DELETE ON review_helpful_votes
  FOR EACH ROW EXECUTE FUNCTION update_review_helpful_count();
