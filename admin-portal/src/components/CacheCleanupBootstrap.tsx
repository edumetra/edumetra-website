"use client";

import { useEffect } from "react";

const CACHE_CLEANUP_VERSION = process.env.NEXT_PUBLIC_CACHE_CLEANUP_VERSION || "2026-05-23-clear-all-v3";
const SUPABASE_CACHE_PREFIX = "sb-cache:";

function clearSupabaseLocalCache() {
    const keysToDelete: string[] = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith(SUPABASE_CACHE_PREFIX)) {
            keysToDelete.push(key);
        }
    }
    keysToDelete.forEach((key) => window.localStorage.removeItem(key));
}

export function CacheCleanupBootstrap() {
    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            const cleanupKey = `cache_cleanup_done_${CACHE_CLEANUP_VERSION}`;
            if (window.localStorage.getItem(cleanupKey) === "1") return;

            try {
                clearSupabaseLocalCache();

                if ("serviceWorker" in navigator) {
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    if (!cancelled) {
                        await Promise.all(registrations.map((registration) => registration.unregister()));
                    }
                }

                if ("caches" in window) {
                    const cacheNames = await caches.keys();
                    if (!cancelled) {
                        await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
                    }
                }
            } catch (error) {
                console.warn("[Cache Cleanup] Failed to clear stale caches", error);
            } finally {
                if (!cancelled) {
                    window.localStorage.setItem(cleanupKey, "1");
                }
            }
        };

        void run();

        return () => {
            cancelled = true;
        };
    }, []);

    return null;
}
