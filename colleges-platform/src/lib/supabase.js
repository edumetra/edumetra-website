import { createClient } from '@supabase/supabase-js';

// 1. Expose Debug State
if (typeof window !== 'undefined') {
    window.__APP_DEBUG__ = window.__APP_DEBUG__ || {
        requests: [],
        auth: {},
        createClientCount: 0,
        logs: []
    };
}
const debugLog = (msg, data) => {
    if (typeof window !== 'undefined') {
        window.__APP_DEBUG__.logs.push({ time: new Date().toISOString(), msg, data });
    }
};
const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isBrowser = typeof window !== 'undefined';
const PRIMARY_PROXY_PREFIX = isBrowser ? `${window.location.origin}/db` : '';
const supabaseUrl = rawUrl;
const REQUEST_TIMEOUT_MS = 12000;
const MAX_ATTEMPTS_PER_ENDPOINT = 2;
const SUPABASE_API_PATHS = ['/rest/v1/', '/auth/v1/', '/storage/v1/', '/realtime/v1/'];
const looksLikeSupabaseApi = (url) => SUPABASE_API_PATHS.some((path) => url.includes(path));

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
    if (typeof window !== 'undefined') {
        window.__APP_DEBUG__.createClientCount += 1;
        debugLog('createClient initializing', { url: supabaseUrl, count: window.__APP_DEBUG__.createClientCount, stack: new Error().stack });
    }
    
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            fetch: async (input, init) => {
                const startTime = Date.now();
                const url = typeof input === 'string' ? input : input.url;
                const method = init?.method || (input instanceof Request ? input.method : 'GET');
                const isGet = method.toUpperCase() === 'GET';
                
                const isAuth = url.includes('/auth/v1/');
                const isTokenRefresh = url.includes('grant_type=refresh_token');

                debugLog('Fetch Start', { url, method, isAuth, isTokenRefresh });

                const finalizeLog = (res, err) => {
                    const duration = Date.now() - startTime;
                    if (err) {
                        debugLog('Fetch Failed', { url, method, duration, error: err.message });
                    } else {
                        debugLog('Fetch Complete', { url, method, duration, status: res?.status });
                    }
                    if (typeof window !== 'undefined') {
                        window.__APP_DEBUG__.requests.push({ url, method, duration, error: err?.message, status: res?.status, time: new Date().toISOString() });
                    }
                };

                // Strictly bypass proxy/retry logic for anything that isn't a GET request to the database (/rest/v1/).
                // Auth, Storage, Realtime, and all POST requests natively hit rawUrl without any modification.
                if (!isGet || !url.includes('/rest/v1/')) {
                    try {
                        const res = await fetch(input, init);
                        finalizeLog(res, null);
                        return res;
                    } catch (e) {
                        finalizeLog(null, e);
                        throw e;
                    }
                }

                // For GET /rest/v1/ requests, we intercept and route through the local /db proxy
                // with a fallback to the direct rawUrl.
                const sourceRequest = input instanceof Request ? input : null;
                const endpoints = [];

                if (isBrowser && rawUrl) {
                    if (url.startsWith(rawUrl)) {
                        endpoints.push(url.replace(rawUrl, PRIMARY_PROXY_PREFIX));
                        endpoints.push(url); // fallback
                    } else {
                        endpoints.push(url);
                    }
                } else {
                    endpoints.push(url);
                }

                const uniqueEndpoints = Array.from(new Set(endpoints));
                const errors = [];
                for (const endpoint of uniqueEndpoints) {
                    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_ENDPOINT; attempt += 1) {
                        const controller = new AbortController();
                        const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
                        try {
                            const requestHeaders = new Headers(sourceRequest?.headers || {});
                            if (init?.headers) {
                                const overrideHeaders = new Headers(init.headers);
                                overrideHeaders.forEach((value, key) => {
                                    requestHeaders.set(key, value);
                                });
                            }
                            requestHeaders.set('cache-control', 'no-cache');
                            requestHeaders.set('pragma', 'no-cache');

                            const response = await fetch(
                                sourceRequest ? new Request(endpoint, sourceRequest) : endpoint,
                                {
                                    ...init,
                                    signal: controller.signal,
                                    cache: 'no-store',
                                    headers: requestHeaders
                                }
                            );
                            clearTimeout(timeout);
                            const contentType = response.headers.get('content-type') || '';
                            const isSupabaseApi = looksLikeSupabaseApi(endpoint);
                            const isHtmlResponse = contentType.includes('text/html');
                            if (isSupabaseApi && response.ok && isHtmlResponse) {
                                errors.push(new Error(`Invalid HTML response for Supabase API at ${endpoint}`));
                                continue;
                            }

                            if (response.ok) {
                                finalizeLog(response, null);
                                return response;
                            }

                            if (isSupabaseApi && (response.status === 404 || response.status === 405)) {
                                errors.push(new Error(`Supabase endpoint unavailable (${response.status}) at ${endpoint}`));
                                continue;
                            }

                            if (response.status < 500) {
                                finalizeLog(response, null);
                                return response;
                            }
                            errors.push(new Error(`Supabase HTTP ${response.status} at ${endpoint}`));
                        } catch (error) {
                            clearTimeout(timeout);
                            errors.push(error);
                        }
                    }
                }

                const finalError = errors[errors.length - 1] || new Error('Supabase request failed');
                finalizeLog(null, finalError);
                throw finalError;
            }
        },
        auth: {
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
