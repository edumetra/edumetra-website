-- Create reviews table
create table if not exists reviews (
  id uuid default gen_random_uuid() primary key,
  college_id uuid not null references colleges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_name text, -- caching name for simpler display
  rating integer check (rating >= 1 and rating <= 5),
  title text,
  review_text text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table reviews enable row level security;

-- Policy: Everyone can read reviews
create policy "Public reviews are viewable by everyone."
  on reviews for select
  using ( true );

-- Policy: Authenticated users can insert reviews
create policy "Users can insert their own reviews."
  on reviews for insert
  with check ( auth.uid() = user_id );

-- Policy: Users can update their own reviews
create policy "Users can update own reviews."
  on reviews for update
  using ( auth.uid() = user_id );

-- Policy: Users can delete their own reviews
create policy "Users can delete own reviews."
  on reviews for delete
  using ( auth.uid() = user_id );
