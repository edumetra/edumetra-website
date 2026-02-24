-- Allow Admins to see ALL colleges (including drafts)
create policy "Admins can view all colleges."
  on colleges for select
  using ( auth.uid() in (select id from admins) );

-- Alternatively, for development simplicity, allow Authenticated users to see all (if you haven't set up admins table yet)
-- create policy "Authenticated users can view all colleges."
--   on colleges for select
--   using ( auth.role() = 'authenticated' );

-- Fix for college_details RLS (just in case)
-- Allow public to view details for published colleges only
drop policy "Public can view college details." on college_details;

create policy "Public can view details of published colleges."
  on college_details for select
  using ( exists ( select 1 from colleges where id = college_details.college_id and is_published = true ) );

create policy "Admins can view all college details."
  on college_details for select
  using ( auth.uid() in (select id from admins) );
