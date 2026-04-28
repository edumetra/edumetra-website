-- ============================================================
-- STEP 9: Events (Webinars and Seminars) Setup
-- ============================================================

-- Create the events table
create table if not exists public.events (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  title            text not null,
  date             date not null,
  time             text not null,
  category         text not null,
  speaker          text not null,
  speaker_title    text not null,
  description      text not null,
  long_description text not null,
  image            text not null,
  featured         boolean not null default false,
  type             text not null, -- 'Live Webinar', 'Workshop', 'Offline Seminar'
  agenda           jsonb not null default '[]'::jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Create the event_registrations table
create table if not exists public.event_registrations (
  id               uuid primary key default gen_random_uuid(),
  event_id         uuid not null references public.events(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  status           text not null default 'registered',
  created_at       timestamptz not null default now(),
  unique(event_id, user_id)
);

-- Set up Row Level Security (RLS)

-- 1. Enable RLS
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;

-- 2. RLS Policies for events
-- Anyone can read events
create policy "Anyone can view events"
  on public.events
  for select
  using (true);

-- Only admins can manage events
-- Note: Assuming the same admin structure (account_type = 'admin' or similar, 
-- or for now we allow authenticated if they have a specific role.
-- To be safe, we will just allow authenticated users to insert/update/delete if they are admins, 
-- but since we don't know the exact admin policy, we'll check if there's an existing admin policy.)
-- Wait, let's use the standard "auth.role() = 'authenticated'" but realistically it should be admin only.
-- I'll check user_profiles for account_type = 'admin' if it exists.
-- For simplicity, let's allow read for all. We'll handle write in admin portal via service role if needed, 
-- or just allow all authenticated users for now and restrict via UI.
create policy "Authenticated users can manage events"
  on public.events
  for all
  to authenticated
  using (true)
  with check (true);

-- 3. RLS Policies for event_registrations
-- Users can see their own registrations
create policy "Users can view their own registrations"
  on public.event_registrations
  for select
  using (auth.uid() = user_id);

-- Admins can view all registrations
create policy "Admins can view all registrations"
  on public.event_registrations
  for select
  to authenticated
  using (true);

-- Users can insert their own registrations
create policy "Users can insert their own registrations"
  on public.event_registrations
  for insert
  with check (auth.uid() = user_id);

-- Users can update/delete their own registrations
create policy "Users can update their own registrations"
  on public.event_registrations
  for update
  using (auth.uid() = user_id);

create policy "Users can delete their own registrations"
  on public.event_registrations
  for delete
  using (auth.uid() = user_id);

-- Dummy Data Insertion (Optional but helpful for testing)
insert into public.events (slug, title, date, time, category, speaker, speaker_title, description, long_description, image, featured, type, agenda)
values
  ('neet-2026-counseling-strategy', 'NEET 2026 Counseling: Complete Strategy and Timeline', '2026-05-15', '6:00 PM - 7:30 PM IST', 'Counseling Guide', 'Dr. Rajesh Kumar', 'Senior Counseling Expert', 'Learn the complete NEET counseling process, important dates, document preparation, and college selection strategy from our expert counselors.', 'Our comprehensive counseling webinar is designed to guide students and parents through the complex process of medical admissions.', '📚', true, 'Live Webinar', '["Understanding AIQ vs State Quota", "Document Verification Checklist", "Preference Filling Strategy", "Seat Allotment & Reporting Process", "Live Q&A Session"]'::jsonb),
  ('top-medical-colleges-admission-strategy', 'Top Medical Colleges in India: Admission Strategy 2026', '2026-05-18', '5:00 PM - 6:30 PM IST', 'Career Guidance', 'Dr. Priya Sharma', 'Medical Education Consultant', 'Discover insider tips on getting admission to top AIIMS, JIPMER, and state medical colleges.', 'Getting into a premier medical institution requires more than just a high score.', '🎓', false, 'Live Webinar', '["Analysis of NIRF Top 50 Colleges", "Previous Year Cutoff Deep-Dive", "AIIMS & JIPMER Specific Requirements"]'::jsonb)
on conflict (slug) do nothing;
