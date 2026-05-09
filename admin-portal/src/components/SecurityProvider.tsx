"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Shield, X } from "lucide-react";

export function SecurityProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();
    const [showNotice, setShowNotice] = useState(false);

    const redirectToLogin = (reason?: string) => {
        const url = `/login${reason ? `?reason=${reason}` : ""}`;
        router.replace(url);
    };

    // ──────────────────────────────────────────────
    // 1. Auth state listener — react instantly to sign-out/sign-in
    // ──────────────────────────────────────────────
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            // SIGNED_OUT event handles token expiry and manual logout across tabs
            if (event === "SIGNED_OUT" && pathname !== "/login" && pathname !== "/denied") {
                // If it's a manual logout, Supabase usually handles it, 
                // but this listener ensures the UI reacts instantly.
                redirectToLogin("session_expired");
            }

            if (event === "SIGNED_IN") {
                // Only show notice once per browser session tab
                const hasShown = sessionStorage.getItem("security_notice_shown");
                if (!hasShown) {
                    setShowNotice(true);
                    sessionStorage.setItem("security_notice_shown", "true");
                    
                    // Auto-close after 2 seconds
                    const timer = setTimeout(() => {
                        setShowNotice(false);
                    }, 2000);
                    return () => clearTimeout(timer);
                }
            }
        });
        return () => subscription.unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    // ──────────────────────────────────────────────
    // 2. Session polling — REMOVED (Caused frequent session expiries)
    // ──────────────────────────────────────────────

    // ──────────────────────────────────────────────
    // 3. Inactivity auto-logout — REMOVED per user request
    // ──────────────────────────────────────────────

    return (
        <>
            {/* Security Notice Toast */}
            {showNotice && (
                <div className="fixed top-6 right-6 z-[9999] animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-slate-900 border border-red-500/30 rounded-xl p-4 shadow-2xl flex items-center gap-4 max-w-sm">
                        <div className="w-10 h-10 rounded-full bg-red-600/10 flex items-center justify-center shrink-0">
                            <Shield className="w-5 h-5 text-red-500" />
                        </div>
                        <div className="flex-1">
                            <p className="text-slate-200 text-sm font-semibold">Security Tip</p>
                            <p className="text-slate-400 text-xs">Please log out to secure your data and info.</p>
                        </div>
                        <button 
                            onClick={() => setShowNotice(false)}
                            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
            {children}
        </>
    );
}
