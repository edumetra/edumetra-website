/** Read required env vars with clear errors (server-side). */
export function getSupabasePublicEnv() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
        throw new Error(
            'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them to admin-portal .env.local and redeploy.'
        );
    }

    return { url, anonKey };
}

export function getSupabaseServiceEnv() {
    const { url } = getSupabasePublicEnv();
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceKey) {
        throw new Error(
            'Missing SUPABASE_SERVICE_ROLE_KEY. Add it to admin-portal environment variables.'
        );
    }

    return { url, serviceKey };
}

export function getPublicWebsiteUrl() {
    return (
        process.env.NEXT_PUBLIC_PUBLIC_WEBSITE_URL ||
        process.env.NEXT_PUBLIC_WEBSITE_URL ||
        'https://www.edumetraglobal.com'
    );
}

export function isProductionDeployment() {
    return process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production';
}
