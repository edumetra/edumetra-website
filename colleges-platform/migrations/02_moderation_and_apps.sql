-- 1. Create Admins Table
create table if not exists admins (
  id uuid references auth.users(id) primary key,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for admins
alter table admins enable row level security;

-- Policy: Admins can see other admins (optional, but good for management)
create policy "Admins can view all admins."
  on admins for select
  using ( auth.uid() in (select id from admins) );

-- 2. Modify Reviews Table
alter table reviews 
add column if not exists is_approved boolean default false;

-- Update RLS for Reviews
-- Allow everyone to read APPROVED reviews
drop policy if exists "Public reviews are viewable by everyone." on reviews;
create policy "Public can view approved reviews."
  on reviews for select
  using ( is_approved = true );

-- Allow Admins to read ALL reviews (pending and approved)
create policy "Admins can view all reviews."
  on reviews for select
  using ( auth.uid() in (select id from admins) );

-- Allow Admins to update (approve) reviews
create policy "Admins can update reviews."
  on reviews for update
  using ( auth.uid() in (select id from admins) );

-- Allow Admins to delete reviews
create policy "Admins can delete reviews."
  on reviews for delete
  using ( auth.uid() in (select id from admins) );

-- 3. Create Applications Table
create table if not exists applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  college_id uuid references colleges(id) not null,
  status text default 'pending', -- pending, viewed, contacted
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Applications
alter table applications enable row level security;

-- Policy: Users can view their own applications
create policy "Users can view own applications."
  on applications for select
  using ( auth.uid() = user_id );

-- Policy: Users can create applications
create policy "Users can create applications."
  on applications for insert
  with check ( auth.uid() = user_id );

-- Policy: Admins can view all applications
create policy "Admins can view all applications."
  on applications for select
  using ( auth.uid() in (select id from admins) );

-- Policy: Admins can update applications (change status)
create policy "Admins can update applications."
  on applications for update
  using ( auth.uid() in (select id from admins) );
