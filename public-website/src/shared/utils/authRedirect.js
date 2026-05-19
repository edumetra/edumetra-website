/**
 * Securely appends active session tokens (access_token & refresh_token)
 * to any Colleges Portal URL using the URL hash fragment.
 *
 * Hash parameters are never transmitted to server logs, making them highly secure.
 *
 * @param {string} baseUrl - Outbound target URL
 * @param {object} session - Supabase session object from useAuth()
 * @param {object} queryParams - Key-value pair of query parameters to add
 * @returns {string} Formatted and secure URL string
 */
export const getAuthedPortalUrl = (baseUrl, session, queryParams = {}) => {
    try {
        let finalBaseUrl = baseUrl;

        // Auto-detect local development environment
        if (typeof window !== 'undefined') {
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            if (isLocal) {
                if (baseUrl.includes('colleges.edumetraglobal.com') || baseUrl.includes('edumetraglobal.com')) {
                    // Replace production domain with local colleges portal port (3002)
                    finalBaseUrl = baseUrl.replace(/https:\/\/(colleges\.)?edumetraglobal\.com/g, 'http://localhost:3002');
                }
            }
        }

        const url = new URL(finalBaseUrl);
        
        // Add query parameters
        Object.entries(queryParams).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== '') {
                url.searchParams.set(key, val);
            }
        });

        // Append session tokens to hash for localhost / first cross-app visit
        if (session?.access_token && session?.refresh_token) {
            const hashParams = new URLSearchParams({
                access_token: session.access_token,
                refresh_token: session.refresh_token,
                token_type: 'bearer',
                expires_in: String(session.expires_in ?? 3600),
            });
            url.hash = hashParams.toString();
        }
        
        return url.toString();
    } catch (e) {
        console.warn('Error generating authed portal URL:', e);
        return baseUrl;
    }
};
