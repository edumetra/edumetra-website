-- Create colleges table
create table if not exists colleges (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  location_city text,
  location_state text,
  type text, -- Private, Public, Deemed
  rank integer,
  rating numeric(3,1),
  fees text,
  avg_package text,
  exams text,
  courses text[], -- Array of strings
  image text,
  description text,
  established_year integer,
  website_url text,
  is_published boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create college_details table (link 1-to-1)
create table if not exists college_details (
  college_id uuid references colleges(id) on delete cascade primary key,
  placement_stats jsonb, -- Stores highest_package, placement_rate, etc.
  campus_life_images text[], -- Array of image URLs
  faq jsonb -- Array of {question, answer}
);

-- Enable RLS
alter table colleges enable row level security;
alter table college_details enable row level security;

-- Policies
create policy "Public can view published colleges."
  on colleges for select
  using ( is_published = true );

create policy "Public can view college details."
  on college_details for select
  using ( true );

-- For now, allow anyone to insert (since we have an open admin portal without auth enforcement on writing yet)
-- In production, this should be restricted to admins
create policy "Anyone can insert colleges"
  on colleges for insert
  with check ( true );

create policy "Anyone can update colleges"
  on colleges for update
  using ( true );

create policy "Anyone can insert details"
  on college_details for insert
  with check ( true );

create policy "Anyone can update details"
  on college_details for update
  using ( true );
