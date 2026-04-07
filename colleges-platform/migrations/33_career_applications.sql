-- Create application status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE application_status AS ENUM ('pending', 'under_review', 'accepted', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create career_applications table
CREATE TABLE IF NOT EXISTS public.career_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    role TEXT,
    position TEXT,
    message TEXT,
    resume_url TEXT,
    status application_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.career_applications ENABLE ROW LEVEL SECURITY;

-- Allow public to submit applications (INSERT only)
CREATE POLICY "Allow public insert to career_applications" 
ON public.career_applications 
FOR INSERT 
WITH CHECK (true);

-- Allow admins to manage applications (ALL)
-- Using the is_admin() helper function defined in migration 08
CREATE POLICY "Admins have full access to career_applications" 
ON public.career_applications 
FOR ALL 
TO authenticated 
USING (public.is_admin());

-- Optionally allow users to see their own applications if they are signed in
CREATE POLICY "Users can see their own career applications"
ON public.career_applications
FOR SELECT
TO authenticated
USING (email = auth.jwt() ->> 'email');

-- Create a storage bucket for resumes if needed (this usually requires Superuser or Done via Dashboard)
-- But we can at least define the table structure.
