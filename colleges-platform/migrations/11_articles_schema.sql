-- 11_articles_schema.sql
-- Creates the `articles` table for the blog/articles feature

CREATE TABLE IF NOT EXISTS public.articles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    slug text NOT NULL UNIQUE,
    content text NOT NULL,
    excerpt text,
    image_url text,
    published boolean DEFAULT false,
    author text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policy: Anyone can read published articles
DROP POLICY IF EXISTS "Public can view published articles" ON public.articles;
CREATE POLICY "Public can view published articles"
    ON public.articles FOR SELECT
    USING (published = true);

-- 2. Admin Policies: Full access to all articles
DROP POLICY IF EXISTS "Admins can view all articles" ON public.articles;
CREATE POLICY "Admins can view all articles"
    ON public.articles FOR SELECT
    USING (
        auth.jwt() ->> 'role' = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE admins.id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins can insert articles" ON public.articles;
CREATE POLICY "Admins can insert articles"
    ON public.articles FOR INSERT
    WITH CHECK (
        auth.jwt() ->> 'role' = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE admins.id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins can update articles" ON public.articles;
CREATE POLICY "Admins can update articles"
    ON public.articles FOR UPDATE
    USING (
        auth.jwt() ->> 'role' = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE admins.id = auth.uid()
        )
    )
    WITH CHECK (
        auth.jwt() ->> 'role' = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE admins.id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins can delete articles" ON public.articles;
CREATE POLICY "Admins can delete articles"
    ON public.articles FOR DELETE
    USING (
        auth.jwt() ->> 'role' = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE admins.id = auth.uid()
        )
    );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_articles_updated_at ON public.articles;
CREATE TRIGGER trg_articles_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Add index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
