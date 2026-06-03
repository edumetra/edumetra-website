import { createBrowserClient } from "@supabase/ssr";
import { Database } from "../../shared/types/database.types";

const REQUEST_TIMEOUT_MS = 12000;
const MAX_ATTEMPTS_PER_ENDPOINT = 2;
const SUPABASE_CACHE_PREFIX = "sb-cache:";
const SUPABASE_API_PATHS = ["/rest/v1/", "/auth/v1/", "/storage/v1/", "/realtime/v1/"];
const SUPABASE_CACHE_TTL_MS = 10 * 60 * 1000;

const isGetRequest = (init?: RequestInit) => !init?.method || init.method.toUpperCase() === "GET";

const getCacheKey = (url: string) => `${SUPABASE_CACHE_PREFIX}${url}`;
const looksLikeSupabaseApi = (url: string) => SUPABASE_API_PATHS.some((path) => url.includes(path));
const isSensitiveAuthOrAdminRequest = (url: string) =>
    url.includes("/auth/v1/user") ||
    url.includes("/rest/v1/admins");

const saveCachedResponse = async (url: string, response: Response) => {
    // Disabled for Admin Portal to ensure real-time updates
};

const getCachedResponse = (url: string): Response | null => {
    // Disabled for Admin Portal to ensure real-time updates
    return null;
};

export const clearSupabaseCache = () => {
    if (typeof window === "undefined") return;
    try {
        const keysToDelete: string[] = [];
        for (let i = 0; i < window.localStorage.length; i += 1) {
            const key = window.localStorage.key(i);
            if (key && key.startsWith(SUPABASE_CACHE_PREFIX)) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach((key) => window.localStorage.removeItem(key));
    } catch {
        // Ignore cache cleanup errors
    }
};

export const clearAllSiteData = async () => {
    if (typeof window === "undefined") return;
    clearSupabaseCache();
    try {
        if ("serviceWorker" in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map((registration) => registration.unregister()));
        }
        if ("caches" in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
        }
        window.localStorage.clear();
        window.sessionStorage.clear();
    } catch {
        // Ignore storage cleanup errors
    }
};

export const createClient = () => {
    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const isBrowser = typeof window !== "undefined";
    const proxyUrl = isBrowser ? `${window.location.origin}/supabase` : rawUrl;

    return createBrowserClient<Database>(proxyUrl, anonKey, {
        global: {
            fetch: async (input, init) => {
                const url =
                    typeof input === "string"
                        ? input
                        : input instanceof URL
                            ? input.toString()
                            : input.url;
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

                const uniqueEndpoints = Array.from(new Set(endpoints));
                const errors: unknown[] = [];
                for (const endpoint of uniqueEndpoints) {
                    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_ENDPOINT; attempt += 1) {
                        const controller = new AbortController();
                        const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
                        try {
                            const response = await fetch(endpoint, { ...init, signal: controller.signal });
                            clearTimeout(timeout);
                            const contentType = response.headers.get("content-type") ?? "";
                            const isSupabaseApi = looksLikeSupabaseApi(endpoint);
                            const isHtmlResponse = contentType.includes("text/html");
                            if (isSupabaseApi && response.ok && isHtmlResponse) {
                                errors.push(new Error(`Invalid HTML response for Supabase API at ${endpoint}`));
                                continue;
                            }

                            if (response.ok) {
                                if (isGetRequest(init) && !isSensitiveAuthOrAdminRequest(endpoint)) {
                                    void saveCachedResponse(endpoint, response);
                                }
                                return response;
                            }

                            if (isSupabaseApi && (response.status === 404 || response.status === 405)) {
                                errors.push(new Error(`Supabase endpoint unavailable (${response.status}) at ${endpoint}`));
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

                if (isGetRequest(init) && !uniqueEndpoints.some((endpoint) => isSensitiveAuthOrAdminRequest(endpoint))) {
                    for (const endpoint of uniqueEndpoints) {
                        const cached = getCachedResponse(endpoint);
                        if (cached) return cached;
                    }
                }

                throw (errors[errors.length - 1] as Error) || new Error("Supabase request failed");
            },
        },
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        },
    });
};
