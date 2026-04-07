-- Create a secure view for news updates to automatically redact content for non-subscribers
CREATE OR REPLACE VIEW public.secure_news_updates AS
SELECT 
    nu.id,
    nu.title,
    CASE 
        -- If it is subscriber only, check if the current user is premium or an admin
        WHEN nu.is_subscriber_only = true AND (
            auth.uid() IS NULL OR 
            (
                NOT EXISTS (
                    SELECT 1 FROM public.user_profiles p 
                    WHERE p.id = auth.uid() AND p.subscription_tier IN ('premium', 'pro')
                )
                AND NOT public.is_admin()
            )
        ) THEN left(nu.content, 200) || '...'
        ELSE nu.content
    END as content,
    nu.image_url,
    nu.tags,
    nu.published_at,
    nu.created_at,
    nu.updated_at,
    nu.is_subscriber_only
FROM public.news_updates nu;

-- Grant permissions on the view so it can be queried by the API
GRANT SELECT ON public.secure_news_updates TO anon, authenticated;
