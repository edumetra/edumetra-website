/**
 * Cross-subdomain SSO between public website and colleges platform.
 * - Production: shared cookies on .edumetraglobal.com
 * - Local dev: tokens passed in URL hash via getAuthedPortalUrl()
 */

export function hasAuthTokensInUrl() {
    return typeof window !== 'undefined' && window.location.hash.includes('access_token');
}

/**
 * Restore session from URL hash (cross-app navigation) or shared cookies.
 * @returns {Promise<import('@supabase/supabase-js').Session | null>}
 */
export async function bootstrapCrossDomainSession(supabase, options = {}) {
    const { maxRetries = 5, retryDelayMs = 400 } = options;

    const applyHashSession = async () => {
        if (typeof window === 'undefined') return null;
        const hash = window.location.hash;
        if (!hash?.includes('access_token')) return null;

        const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        if (!access_token || !refresh_token) return null;

        const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
        });

        if (error) {
            console.warn('Cross-domain session handoff failed:', error.message);
            return null;
        }

        const cleanUrl = window.location.pathname + window.location.search;
        window.history.replaceState(window.history.state, '', cleanUrl);

        return data.session ?? null;
    };

    const hashSession = await applyHashSession();
    if (hashSession) return hashSession;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
            console.warn('Session check failed:', error.message);
            break;
        }
        if (session) return session;

        if (!hasAuthTokensInUrl() || attempt === maxRetries) break;
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }

    return null;
}

/** Clear Supabase auth cookies across edumetraglobal subdomains. */
export function clearSharedAuthCookies() {
    if (typeof document === 'undefined') return;

    document.cookie.split(';').forEach((c) => {
        const name = c.split('=')[0].trim();
        if (!name) return;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.edumetraglobal.com;`;
    });
    try {
        localStorage.clear();
        sessionStorage.clear();
    } catch {
        // ignore storage restrictions
    }
}
