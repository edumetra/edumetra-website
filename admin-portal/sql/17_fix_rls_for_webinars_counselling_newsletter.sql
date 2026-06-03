-- ============================================================
-- STEP 17: Fix RLS policies for public forms & registrations
-- Fixes insertion failures for anonymous (guest) users on:
--   - counselling_requests
--   - webinar_interests
--   - event_registrations (guest registrations)
--   - newsletter_subscriptions
-- ============================================================

BEGIN;

-- 1. Counselling Requests
ALTER TABLE IF EXISTS public.counselling_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can submit counselling request" ON public.counselling_requests;
DROP POLICY IF EXISTS "Admins can read counselling requests" ON public.counselling_requests;
DROP POLICY IF EXISTS "Authenticated users can manage counselling requests" ON public.counselling_requests;

CREATE POLICY "Anyone can submit counselling request"
  ON public.counselling_requests
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage counselling requests"
  ON public.counselling_requests
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- 2. Webinar Interests (Never Miss an Event form)
ALTER TABLE IF EXISTS public.webinar_interests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can submit webinar interest" ON public.webinar_interests;
DROP POLICY IF EXISTS "Admins can read webinar interests" ON public.webinar_interests;
DROP POLICY IF EXISTS "Authenticated users can manage webinar interests" ON public.webinar_interests;

CREATE POLICY "Anyone can submit webinar interest"
  ON public.webinar_interests
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage webinar interests"
  ON public.webinar_interests
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- 3. Event Registrations (Guest and Authenticated check-ins)
ALTER TABLE IF EXISTS public.event_registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anon can insert guest registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Users can insert their own registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Admins can view all registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Authenticated users can manage registrations" ON public.event_registrations;

-- Allow guest signups (anon)
CREATE POLICY "Anon can insert guest registrations"
  ON public.event_registrations
  FOR INSERT
  WITH CHECK (registration_type = 'guest' AND user_id IS NULL);

-- Allow authenticated signups (user registers themselves)
CREATE POLICY "Users can insert their own registrations"
  ON public.event_registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND registration_type = 'authenticated');

-- Allow admins/portal users (authenticated) to view and manage all registrations
CREATE POLICY "Authenticated users can manage registrations"
  ON public.event_registrations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- 4. Newsletter Subscriptions
ALTER TABLE IF EXISTS public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Admins can read newsletter subscriptions" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Authenticated users can manage newsletter subscriptions" ON public.newsletter_subscriptions;

CREATE POLICY "Anyone can subscribe to newsletter"
  ON public.newsletter_subscriptions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage newsletter subscriptions"
  ON public.newsletter_subscriptions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

COMMIT;
