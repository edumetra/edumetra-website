// Extracts the root domain enabling shared cookies across subdomains
export const getRootDomain = () => {
    try {
        const hostname = window.location.hostname;
        
        // Handle localhost and IP addresses
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
            return null;
        }

        const parts = hostname.split('.');
        if (parts.length <= 2) return hostname;

        // Extract root domain (e.g. from colleges.edumetraglobal.com -> edumetraglobal.com)
        // This handles standard TLDs. For complex ones like .co.uk, you might need a library, 
        // but for .com and .in this is sufficient.
        return parts.slice(-2).join('.');
    } catch (e) {
        return null;
    }
};

export const cookieStorage = {
    getItem: (key) => {
        try {
            if (typeof document === 'undefined') return null;
            const name = encodeURIComponent(key) + "=";
            const ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i].trim();
                if (c.indexOf(name) === 0) {
                    return decodeURIComponent(c.substring(name.length, c.length));
                }
            }
        } catch (e) {
            console.warn('Cookie storage getItem blocked:', e);
        }
        return null;
    },
    setItem: (key, value) => {
        if (typeof document === 'undefined') return;
        
        const d = new Date();
        d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
        const expires = "expires=" + d.toUTCString();
        
        const rootDomain = getRootDomain();
        const attributes = [
            `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
            expires,
            "path=/",
            "SameSite=Lax"
        ];

        // Add Secure attribute for HTTPS connections
        if (window.location.protocol === 'https:') {
            attributes.push("Secure");
        }

        // Only set domain for production edumetra domains to enable cross-subdomain auth
        if (rootDomain && (rootDomain.includes('edumetra') || rootDomain.includes('edumetraglobal'))) {
            attributes.push(`domain=.${rootDomain}`);
        }

        try {
            const cookieString = attributes.join('; ');
            document.cookie = cookieString;
        } catch (e) {
            console.warn('Cookie storage setItem blocked:', e);
        }
    },
    removeItem: (key) => {
        if (typeof document === 'undefined') return;
        
        const rootDomain = getRootDomain();
        const attributes = [
            `${encodeURIComponent(key)}=`,
            "expires=Thu, 01 Jan 1970 00:00:00 UTC",
            "path=/",
            "SameSite=Lax"
        ];

        if (window.location.protocol === 'https:') {
            attributes.push("Secure");
        }

        if (rootDomain && (rootDomain.includes('edumetra') || rootDomain.includes('edumetraglobal'))) {
            attributes.push(`domain=.${rootDomain}`);
        }
        
        try {
            const cookieString = attributes.join('; ');
            document.cookie = cookieString;
        } catch (e) {
            console.warn('Cookie storage removeItem blocked:', e);
        }
    }
};
