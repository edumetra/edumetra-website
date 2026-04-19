// Extracts the root domain enabling shared cookies across *.edumetra.com subdomains
export const getRootDomain = () => {
    const hostname = window.location.hostname;
    // Handle localhost and IP addresses
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
        return hostname;
    }
    // Extract root domain (e.g. from www.edumetra.in or colleges.edumetra.in -> edumetra.in)
    // Note: this simple logic works for standard domains like edumetra.in
    const parts = hostname.split('.');
    if (parts.length >= 2) {
        return parts.slice(-2).join('.');
    }
    return hostname;
};

export const cookieStorage = {
    getItem: (key) => {
        if (typeof document === 'undefined') return null;
        const name = encodeURIComponent(key) + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i].trim();
            if (c.indexOf(name) === 0) {
                return decodeURIComponent(c.substring(name.length, c.length));
            }
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

        // Only set domain for production edumetra domains
        if (rootDomain.includes('edumetra')) {
            attributes.push(`domain=.${rootDomain}`);
        }

        document.cookie = attributes.join('; ');
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

        if (rootDomain.includes('edumetra')) {
            attributes.push(`domain=.${rootDomain}`);
        }
        
        document.cookie = attributes.join('; ');
    }
};
