import { createClient } from '@supabase/supabase-js';
import { cookieStorage } from '../shared/utils/cookieStorage';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isBrowser = typeof window !== 'undefined';
const supabaseUrl = isBrowser ? `${window.location.origin}/supabase` : rawUrl;
const REQUEST_TIMEOUT_MS = 12000;
const MAX_ATTEMPTS_PER_ENDPOINT = 2;
const SUPABASE_CACHE_PREFIX = 'sb-cache:';

const isGetRequest = (init) => !init?.method || init.method.toUpperCase() === 'GET';

const getCacheKey = (url) => `${SUPABASE_CACHE_PREFIX}${url}`;

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

// Check if credentials are configured
export const isConfigured = !!rawUrl && 
    !!supabaseAnonKey &&
    rawUrl !== 'YOUR_SUPABASE_URL' &&
    supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY' &&
    rawUrl.trim() !== '' &&
    supabaseAnonKey.trim() !== '';

// Recursive Proxy-based dummy client query builder to prevent crashes when chaining methods (e.g. .select().eq().in())
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
            return () => createDummyQueryBuilder();
        }
    });
};

export const supabase = isConfigured
    ? createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            fetch: async (input, init) => {
                const url = typeof input === 'string' ? input : input.url;
                const endpoints = [url];

                if (isBrowser && rawUrl) {
                    const proxyPrefix = `${window.location.origin}/supabase`;
                    if (url.startsWith(proxyPrefix)) {
                        endpoints.push(url.replace(proxyPrefix, rawUrl));
                    } else if (url.startsWith(rawUrl)) {
                        endpoints.push(url.replace(rawUrl, proxyPrefix));
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
                            if (response.ok || response.status < 500) {
                                if (isGetRequest(init)) {
                                    void saveCachedResponse(endpoint, response);
                                }
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
    })
    : {
        from: () => createDummyQueryBuilder(),
        rpc: () => Promise.resolve({ data: null, error: null }),
        auth: {
            getSession: async () => ({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
            signUp: async () => ({ data: null, error: { message: 'Supabase not configured. Please add credentials to .env file.' } }),
            signInWithPassword: async () => ({ data: null, error: { message: 'Supabase not configured. Please add credentials to .env file.' } }),
            signOut: async () => ({ error: null }),
            resetPasswordForEmail: async () => ({ data: null, error: { message: 'Supabase not configured. Please add credentials to .env file.' } }),
            updateUser: async () => ({ data: null, error: { message: 'Supabase not configured. Please add credentials to .env file.' } }),
        }
    };

// Log warning if not configured (only in development)
if (!isConfigured && import.meta.env.DEV) {
    console.warn(
        '⚠️ Supabase is not configured. Authentication features will not work.\n' +
        'Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.\n' +
        'See SUPABASE_SETUP.md for instructions.'
    );
}
