-- ============================================================
-- STEP 12: Clean up events rows with slug-string IDs (not UUIDs)
-- ============================================================
-- The error: invalid input syntax for type uuid: "neet-2026-counseling"
-- means a row in public.events has id = 'neet-2026-counseling' (a slug)
-- instead of a proper UUID. This script removes those rows and any
-- orphaned event_registrations that reference them.
-- ============================================================

-- 1. Preview what would be deleted from event_registrations
SELECT * FROM public.event_registrations
WHERE event_id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- 2. Preview what would be deleted from events
SELECT * FROM public.events
WHERE id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- 3. Delete orphaned registrations first (FK constraint)
DELETE FROM public.event_registrations
WHERE event_id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- 4. Delete the malformed events row(s)
DELETE FROM public.events
WHERE id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- 5. Verify: should return 0 rows
SELECT COUNT(*) AS bad_event_rows FROM public.events
WHERE id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
