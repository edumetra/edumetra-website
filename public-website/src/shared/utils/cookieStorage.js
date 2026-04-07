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
        const name = encodeURIComponent(key) + "=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return null; // Return null if not found
    },
    setItem: (key, value) => {
        // Set to expire in 1 year
        const d = new Date();
        d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
        let expires = "expires=" + d.toUTCString();
        
        let domainStr = "";
        const rootDomain = getRootDomain();
        if (rootDomain !== 'localhost' && rootDomain !== '127.0.0.1') {
            // Apply leading dot to match subdomains automatically
            domainStr = `; domain=.${rootDomain}`;
        }

        document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; ${expires}; path=/${domainStr}; SameSite=Lax`;
    },
    removeItem: (key) => {
        let domainStr = "";
        const rootDomain = getRootDomain();
        if (rootDomain !== 'localhost' && rootDomain !== '127.0.0.1') {
            domainStr = `; domain=.${rootDomain}`;
        }
        document.cookie = `${encodeURIComponent(key)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/${domainStr}; SameSite=Lax`;
    }
};
