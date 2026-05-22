import { createBrowserClient } from "@supabase/ssr";
import { Database } from "../../shared/types/database.types";

const REQUEST_TIMEOUT_MS = 12000;
const MAX_ATTEMPTS_PER_ENDPOINT = 2;
const SUPABASE_CACHE_PREFIX = "sb-cache:";

const isGetRequest = (init?: RequestInit) => !init?.method || init.method.toUpperCase() === "GET";

const getCacheKey = (url: string) => `${SUPABASE_CACHE_PREFIX}${url}`;

const saveCachedResponse = async (url: string, response: Response) => {
    if (typeof window === "undefined" || !response.ok) return;
    try {
        const cloned = response.clone();
        const body = await cloned.text();
        const headers: Record<string, string> = {};
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

const getCachedResponse = (url: string): Response | null => {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(getCacheKey(url));
        if (!raw) return null;
        const parsed = JSON.parse(raw) as { status?: number; headers?: Record<string, string>; body?: string };
        if (!parsed || typeof parsed.body !== "string") return null;
        return new Response(parsed.body, {
            status: parsed.status ?? 200,
            headers: parsed.headers ?? { "content-type": "application/json" },
        });
    } catch {
        return null;
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
                    if (url.startsWith(proxyPrefix)) {
                        endpoints.push(url.replace(proxyPrefix, rawUrl));
                    } else if (url.startsWith(rawUrl)) {
                        endpoints.push(url.replace(rawUrl, proxyPrefix));
                    }
                }

                const errors: unknown[] = [];
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
