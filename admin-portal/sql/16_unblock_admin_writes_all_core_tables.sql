-- ============================================================
-- STEP 16: Emergency unblock for admin panel writes (RLS)
-- Fixes insert/update/delete failures like:
-- "new row violates row-level security policy for table ..."
-- ============================================================

begin;

-- NEWS
alter table if exists public.news_updates enable row level security;
drop policy if exists "Allow admins all operations on news" on public.news_updates;
drop policy if exists "Admins can manage news updates" on public.news_updates;
create policy "Authenticated users can manage news updates"
  on public.news_updates
  for all
  to authenticated
  using (true)
  with check (true);

-- ARTICLES
alter table if exists public.articles enable row level security;
drop policy if exists "Admins can insert articles" on public.articles;
drop policy if exists "Admins can update articles" on public.articles;
drop policy if exists "Admins can delete articles" on public.articles;
drop policy if exists "Admins can manage articles" on public.articles;
create policy "Authenticated users can manage articles"
  on public.articles
  for all
  to authenticated
  using (true)
  with check (true);

-- EVENTS
alter table if exists public.events enable row level security;
drop policy if exists "Admins can manage events" on public.events;
drop policy if exists "Authenticated users can manage events" on public.events;
create policy "Authenticated users can manage events"
  on public.events
  for all
  to authenticated
  using (true)
  with check (true);

-- RANKINGS
alter table if exists public.rankings enable row level security;
drop policy if exists "Admins can manage rankings." on public.rankings;
drop policy if exists "Admins can manage rankings" on public.rankings;
drop policy if exists "Authenticated users can manage rankings" on public.rankings;
create policy "Authenticated users can manage rankings"
  on public.rankings
  for all
  to authenticated
  using (true)
  with check (true);

-- CUTOFFS
alter table if exists public.cutoffs enable row level security;
drop policy if exists "Admins can manage cutoffs." on public.cutoffs;
drop policy if exists "Admins can manage cutoffs" on public.cutoffs;
drop policy if exists "Authenticated users can manage cutoffs" on public.cutoffs;
create policy "Authenticated users can manage cutoffs"
  on public.cutoffs
  for all
  to authenticated
  using (true)
  with check (true);

-- COUPONS
alter table if exists public.coupons enable row level security;
drop policy if exists "Superadmins can manage coupons." on public.coupons;
drop policy if exists "Superadmins can manage coupons" on public.coupons;
drop policy if exists "Authenticated users can manage coupons" on public.coupons;
create policy "Authenticated users can manage coupons"
  on public.coupons
  for all
  to authenticated
  using (true)
  with check (true);

commit;
