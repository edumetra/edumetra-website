-- Create table
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Provide public access for subscribing
CREATE POLICY "Allow public insert to newsletter" ON public.newsletter_subscriptions
    FOR INSERT WITH CHECK (true);

-- Provide full access for administrators
CREATE POLICY "Newsletter Admin All" ON public.newsletter_subscriptions
    FOR ALL USING (public.is_admin());
