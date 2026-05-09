-- ============================================================
-- STEP 11: Event Registrations V2 — Guest Support + General Interest
-- ============================================================
-- Run this after 09_events_setup.sql
-- Adds guest registration support (non-logged-in users) and a
-- separate general_webinar_interests table for the "Never Miss an Event"
-- sign-up form on the public website.

-- 1. Extend event_registrations to support guest users
--    (user_id becomes nullable; guest fields added)

ALTER TABLE public.event_registrations
    ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.event_registrations
    ADD COLUMN IF NOT EXISTS guest_name  text,
    ADD COLUMN IF NOT EXISTS guest_email text,
    ADD COLUMN IF NOT EXISTS guest_phone text,
    ADD COLUMN IF NOT EXISTS registration_type text NOT NULL DEFAULT 'authenticated'
        CHECK (registration_type IN ('authenticated', 'guest'));

-- Drop the old unique constraint (it was on event_id + user_id, now user_id can be null)
ALTER TABLE public.event_registrations
    DROP CONSTRAINT IF EXISTS event_registrations_event_id_user_id_key;

-- Re-add a partial unique constraint: one auth user per event
CREATE UNIQUE INDEX IF NOT EXISTS event_reg_auth_unique
    ON public.event_registrations (event_id, user_id)
    WHERE user_id IS NOT NULL;

-- Add a comment for clarity
COMMENT ON TABLE public.event_registrations IS
    'Stores registrations/interest for events. Supports both authenticated users (user_id set) and guests (guest_* fields set).';

-- 2. New table: general webinar interest (the "Never Miss an Event" form)
--    This is NOT tied to a specific event — it is a general interest capture.

CREATE TABLE IF NOT EXISTS public.webinar_interests (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name           text NOT NULL,
    email          text NOT NULL,
    phone          text NOT NULL,
    category       text,                     -- Topic of interest e.g. "NEET Preparation"
    source         text DEFAULT 'webinar-page',
    created_at     timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.webinar_interests ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public form)
CREATE POLICY "Anyone can submit webinar interest"
    ON public.webinar_interests
    FOR INSERT
    WITH CHECK (true);

-- Admins (authenticated) can read all
CREATE POLICY "Admins can read webinar interests"
    ON public.webinar_interests
    FOR SELECT
    TO authenticated
    USING (true);

-- 3. Update RLS policies for event_registrations to allow anon inserts (for guest registrations)
--    We'll keep existing policies and add an anon insert policy.

-- Allow anyone (including anon) to register as a guest
CREATE POLICY "Anon can insert guest registrations"
    ON public.event_registrations
    FOR INSERT
    WITH CHECK (registration_type = 'guest' AND user_id IS NULL);

-- 4. Create a helpful view for admins to see all registrations unified
CREATE OR REPLACE VIEW public.event_registrations_full AS
SELECT
    er.id,
    er.event_id,
    er.status,
    er.registration_type,
    er.created_at,
    -- Auth user fields (from auth.users — user_profiles has no name/email/phone)
    er.user_id,
    (au.raw_user_meta_data->>'full_name') AS auth_full_name,
    au.email                              AS auth_email,
    (au.raw_user_meta_data->>'phone')     AS auth_phone,
    -- Guest fields
    er.guest_name,
    er.guest_email,
    er.guest_phone,
    -- Resolved display fields (works for both types)
    COALESCE(er.guest_name,  au.raw_user_meta_data->>'full_name') AS display_name,
    COALESCE(er.guest_email, au.email)                            AS display_email,
    COALESCE(er.guest_phone, au.raw_user_meta_data->>'phone')     AS display_phone
FROM public.event_registrations er
LEFT JOIN auth.users au ON au.id = er.user_id;

-- Grant read access to authenticated users (admins)
GRANT SELECT ON public.event_registrations_full TO authenticated;

