"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const SESSION_POLL_INTERVAL = 3 * 60 * 1000; // 3 minutes
const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 60 minutes idle logout

export function SecurityProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();
    const lastActivityRef = useRef(Date.now());
    const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const redirectToLogin = (reason?: string) => {
        const url = `/login${reason ? `?reason=${reason}` : ""}`;
        router.replace(url);
    };

    // ──────────────────────────────────────────────
    // 1. Auth state listener — react instantly to sign-out
    // ──────────────────────────────────────────────
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === "SIGNED_OUT" && pathname !== "/login" && pathname !== "/denied") {
                redirectToLogin("session_expired");
            }
        });
        return () => subscription.unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    // ──────────────────────────────────────────────
    // 2. Session polling — verify server-side every 3 min
    // ──────────────────────────────────────────────
    useEffect(() => {
        const poll = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user && pathname !== "/login" && pathname !== "/denied") {
                redirectToLogin("session_expired");
            }
        };

        const interval = setInterval(poll, SESSION_POLL_INTERVAL);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    // ──────────────────────────────────────────────
    // 3. Tab/window close → sign out
    // ──────────────────────────────────────────────
    useEffect(() => {
        const handleUnload = () => {
            // Retrieve session synchronously from local storage if possible,
            // or we use a fire-and-forget beacon for supabase auth.
            // Note: await doesn't work reliably in beforeunload/unload.

            const supabaseAuthStorageKey = Object.keys(localStorage).find(key => key.startsWith('sb-') && key.endsWith('-auth-token'));
            if (supabaseAuthStorageKey) {
                try {
                    const sessionData = JSON.parse(localStorage.getItem(supabaseAuthStorageKey) || '{}');
                    if (sessionData && sessionData.access_token) {
                        navigator.sendBeacon(
                            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/logout`,
                            JSON.stringify({ access_token: sessionData.access_token })
                        );
                    }
                } catch (e) {
                    // ignore parse errors during unload
                }
            }
        };

        window.addEventListener("beforeunload", handleUnload);
        return () => window.removeEventListener("beforeunload", handleUnload);
    }, []);

    // ──────────────────────────────────────────────
    // 4. Inactivity auto-logout (60 min)
    // ──────────────────────────────────────────────
    useEffect(() => {
        const resetTimer = () => {
            lastActivityRef.current = Date.now();
        };

        const checkInactivity = async () => {
            const idle = Date.now() - lastActivityRef.current;
            if (idle >= INACTIVITY_TIMEOUT) {
                await supabase.auth.signOut();
                redirectToLogin("inactive");
            }
        };

        const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
        events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));

        inactivityTimerRef.current = setInterval(checkInactivity, 60 * 1000); // check every minute

        return () => {
            events.forEach((e) => window.removeEventListener(e, resetTimer));
            if (inactivityTimerRef.current) clearInterval(inactivityTimerRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <>{children}</>;
}
