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
        const url = new URL(baseUrl);
        
        // Add query parameters
        Object.entries(queryParams).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== '') {
                url.searchParams.set(key, val);
            }
        });

        // Append access and refresh tokens to the hash fragment if signed in
        if (session && session.access_token && session.refresh_token) {
            url.hash = `access_token=${encodeURIComponent(session.access_token)}&refresh_token=${encodeURIComponent(session.refresh_token)}&type=signup`;
        }
        
        return url.toString();
    } catch (e) {
        console.warn('Error generating authed portal URL:', e);
        return baseUrl;
    }
};
