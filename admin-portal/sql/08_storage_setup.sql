-- ============================================================
-- STEP 8: Storage Setup for News Articles
-- This file creates the necessary storage bucket for article
-- images and establishes Row Level Security (RLS) policies.
-- ============================================================

-- 1. Create the bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('article-images', 'article-images', true)
on conflict (id) do nothing;

-- 2. Enable RLS on the storage.objects table if not already enabled
-- (Skipping alter table as it throws an ownership error; RLS is already enabled by default in Supabase)
-- alter table storage.objects enable row level security;

-- 3. Policy: Allow public access to view images (so they render on the public website)
drop policy if exists "Public Access to Article Images" on storage.objects;
create policy "Public Access to Article Images"
on storage.objects for select
using ( bucket_id = 'article-images' );

-- 4. Policy: Allow authenticated users (e.g. admins) to upload images
drop policy if exists "Authenticated Users can upload Article Images" on storage.objects;
create policy "Authenticated Users can upload Article Images"
on storage.objects for insert
with check ( bucket_id = 'article-images' and auth.role() = 'authenticated' );

-- 5. Policy: Allow authenticated users to update their uploaded images
drop policy if exists "Authenticated Users can update Article Images" on storage.objects;
create policy "Authenticated Users can update Article Images"
on storage.objects for update
using ( bucket_id = 'article-images' and auth.role() = 'authenticated' );

-- 6. Policy: Allow authenticated users to delete images
drop policy if exists "Authenticated Users can delete Article Images" on storage.objects;
create policy "Authenticated Users can delete Article Images"
on storage.objects for delete
using ( bucket_id = 'article-images' and auth.role() = 'authenticated' );
