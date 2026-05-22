import { createClient } from '@supabase/supabase-js';
import { cookieStorage } from '../utils/cookieStorage';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isBrowser = typeof window !== 'undefined';
const supabaseUrl = isBrowser ? `${window.location.origin}/supabase` : rawUrl;
const REQUEST_TIMEOUT_MS = 12000;
const MAX_ATTEMPTS_PER_ENDPOINT = 2;
const SUPABASE_CACHE_PREFIX = 'sb-cache:';
const SUPABASE_API_PATHS = ['/rest/v1/', '/auth/v1/', '/storage/v1/', '/realtime/v1/'];

const isGetRequest = (init) => !init?.method || init.method.toUpperCase() === 'GET';

const getCacheKey = (url) => `${SUPABASE_CACHE_PREFIX}${url}`;
const looksLikeSupabaseApi = (url) => SUPABASE_API_PATHS.some((path) => url.includes(path));

const saveCachedResponse = async (url, response) => {
    if (!isBrowser || !response.ok) return;
    try {
        const cloned = response.clone();
        const body = await cloned.text();
        const headers = {};
        cloned.headers.forEach((value, key) => {
            headers[key] = value;
        });
        window.localStorage.setItem(
            getCacheKey(url),
            JSON.stringify({ status: cloned.status, headers, body, cachedAt: Date.now() })
        );
    } catch {
        // Non-fatal: continue without cache persistence
    }
};

const getCachedResponse = (url) => {
    if (!isBrowser) return null;
    try {
        const raw = window.localStorage.getItem(getCacheKey(url));
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed.body !== 'string') return null;
        return new Response(parsed.body, {
            status: parsed.status || 200,
            headers: parsed.headers || { 'content-type': 'application/json' }
        });
    } catch {
        return null;
    }
};

export const isConfigured = !!rawUrl && 
    !!supabaseAnonKey && 
    rawUrl !== 'YOUR_SUPABASE_URL' && 
    supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY' &&
    rawUrl.trim() !== '' &&
    supabaseAnonKey.trim() !== '';

// Recursive Proxy-based dummy client query builder to prevent crashes when chaining methods (e.g. .select().eq().in().order().range())
const createDummyQueryBuilder = () => {
    const builder = {
        then: (onfulfilled) => Promise.resolve({ data: [], count: 0, error: null }).then(onfulfilled),
        catch: (onrejected) => Promise.resolve({ data: [], count: 0, error: null }).catch(onrejected)
    };
    return new Proxy(builder, {
        get: (target, prop) => {
            if (prop === 'then' || prop === 'catch') {
                return target[prop];
            }
            // Return a function that returns a new query builder (supporting method chaining indefinitely)
            return () => createDummyQueryBuilder();
        }
    });
};

let supabaseInstance;
try {
    if (!isConfigured) {
        throw new Error("Supabase credentials are not configured or are placeholder values.");
    }
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            fetch: async (input, init) => {
                const url = typeof input === 'string' ? input : input.url;
                const endpoints = [url];

                if (isBrowser && rawUrl) {
                    const proxyPrefix = `${window.location.origin}/supabase`;
                    const legacyProxyPrefix = `${window.location.origin}/api/supabase-proxy`;
                    if (url.startsWith(proxyPrefix)) {
                        endpoints.push(url.replace(proxyPrefix, rawUrl));
                        endpoints.push(url.replace(proxyPrefix, legacyProxyPrefix));
                    } else if (url.startsWith(rawUrl)) {
                        endpoints.push(url.replace(rawUrl, proxyPrefix));
                        endpoints.push(url.replace(rawUrl, legacyProxyPrefix));
                    } else if (url.startsWith(legacyProxyPrefix)) {
                        endpoints.push(url.replace(legacyProxyPrefix, proxyPrefix));
                        endpoints.push(url.replace(legacyProxyPrefix, rawUrl));
                    }
                }

                const errors = [];
                for (const endpoint of endpoints) {
                    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_ENDPOINT; attempt += 1) {
                        const controller = new AbortController();
                        const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
                        try {
                            const response = await fetch(endpoint, { ...init, signal: controller.signal });
                            clearTimeout(timeout);
                            const contentType = response.headers.get('content-type') || '';
                            const isSupabaseApi = looksLikeSupabaseApi(endpoint);
                            const isHtmlResponse = contentType.includes('text/html');
                            if (isSupabaseApi && response.ok && isHtmlResponse) {
                                errors.push(new Error(`Invalid HTML response for Supabase API at `));
                                continue;
                            }

                            if (response.ok) {
                                if (isGetRequest(init)) {
                                    void saveCachedResponse(endpoint, response);
                                }
                                return response;
                            }

                            if (isSupabaseApi && (response.status === 404 || response.status === 405)) {
                                errors.push(new Error(`Supabase endpoint unavailable () at `));
                                continue;
                            }

                            if (response.status < 500) {
                                return response;
                            }
                            errors.push(new Error(`Supabase HTTP ${response.status} at ${endpoint}`));
                        } catch (error) {
                            clearTimeout(timeout);
                            errors.push(error);
                        }
                    }
                }

                if (isGetRequest(init)) {
                    for (const endpoint of endpoints) {
                        const cached = getCachedResponse(endpoint);
                        if (cached) return cached;
                    }
                }

                throw errors[errors.length - 1] || new Error('Supabase request failed');
            }
        },
        auth: {
            storage: cookieStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    });
} catch (e) {
    console.error("⚠️ SUPABASE INITIALIZATION ERROR:", e.message || e);
    console.warn(
        "Edumetra is running in MOCK DEMO MODE. Database queries will return empty arrays safely.\n" +
        "To connect to your live database:\n" +
        "1. In Local Development: Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.\n" +
        "2. In Vercel Deployment: Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your Project Environment Variables and trigger a fresh redeployment."
    );

    // Provide a crash-proof, recursive proxy-based dummy client
    supabaseInstance = {
        from: () => createDummyQueryBuilder(),
        rpc: () => Promise.resolve({ data: null, error: null }),
        auth: {
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            getUser: () => Promise.resolve({ data: { user: null }, error: null }),
            signInWithPassword: () => Promise.resolve({ data: { session: null, user: null }, error: { message: "Mock client active" } }),
            signUp: () => Promise.resolve({ data: { session: null, user: null }, error: { message: "Mock client active" } }),
            signOut: () => Promise.resolve({ error: null }),
            resetPasswordForEmail: () => Promise.resolve({ data: null, error: { message: "Mock client active" } }),
            updateUser: () => Promise.resolve({ data: null, error: { message: "Mock client active" } })
        }
    };
}

export const supabase = supabaseInstance;
