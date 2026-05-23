-- ============================================================
-- STEP 14: Fix admin RLS recursion and unblock rankings/events writes
-- Run this in Supabase SQL Editor (production first, then staging)
-- ============================================================

begin;

-- 1) Safe admin checker that bypasses admins-table RLS recursion
create or replace function public.is_admin_user()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admins a
    where a.id = auth.uid()
  );
$$;

revoke all on function public.is_admin_user() from public;
grant execute on function public.is_admin_user() to authenticated;

-- 2) Prevent recursive admins policy patterns
-- Keep visibility simple: each admin can read their own row.
drop policy if exists "Admins can view all admins." on public.admins;
drop policy if exists "Admins can view their own record" on public.admins;
create policy "Admins can view their own record"
  on public.admins
  for select
  using (auth.uid() = id);

-- 3) Ensure rankings policies are deterministic and admin-only for writes
alter table public.rankings enable row level security;

drop policy if exists "Anyone can view rankings." on public.rankings;
create policy "Anyone can view rankings."
  on public.rankings
  for select
  using (true);

drop policy if exists "Admins can manage rankings." on public.rankings;
create policy "Admins can manage rankings."
  on public.rankings
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- 4) Ensure events policies are deterministic and admin-only for writes
alter table public.events enable row level security;

drop policy if exists "Anyone can view events" on public.events;
create policy "Anyone can view events"
  on public.events
  for select
  using (true);

drop policy if exists "Authenticated users can manage events" on public.events;
drop policy if exists "Admins can manage events" on public.events;
create policy "Admins can manage events"
  on public.events
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

commit;
