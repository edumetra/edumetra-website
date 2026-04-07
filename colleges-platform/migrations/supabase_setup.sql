-- 1. Create the counselling_requests table
CREATE TABLE IF NOT EXISTS public.counselling_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    neet_marks INTEGER,
    city TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.counselling_requests ENABLE ROW LEVEL SECURITY;

-- 3. Create POLICIES

-- Allow anyone to insert (Public submission)
CREATE POLICY "Allow public insert" 
ON public.counselling_requests 
FOR INSERT 
TO public 
WITH CHECK (true);

-- Allow admins to see all requests
-- Note: This assumes you have an 'admins' table and users are authenticated
CREATE POLICY "Allow admins to select" 
ON public.counselling_requests 
FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.admins 
        WHERE id = auth.uid()
    )
);

-- 4. Enable realtime for this table (Optional, but useful for admin dashboard)
ALTER PUBLICATION supabase_realtime ADD TABLE public.counselling_requests;
