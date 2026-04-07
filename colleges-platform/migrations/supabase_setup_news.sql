-- 1. Create the news_updates table
CREATE TABLE IF NOT EXISTS public.news_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    tags TEXT[],
    published_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.news_updates ENABLE ROW LEVEL SECURITY;

-- 3. Create POLICIES

-- Allow anyone to read news
CREATE POLICY "Allow public read news" 
ON public.news_updates 
FOR SELECT 
TO public 
USING (true);

-- Allow admins full access
-- Assuming an 'admins' table is used for authorization
CREATE POLICY "Allow admins all operations on news" 
ON public.news_updates 
FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.admins 
        WHERE id = auth.uid()
    )
);

-- 4. Set up an updated_at trigger
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_news_updates_modtime
    BEFORE UPDATE ON public.news_updates
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- 5. Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.news_updates;
