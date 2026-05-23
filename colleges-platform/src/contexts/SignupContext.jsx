import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { pushLeadToTeleCRM } from '../services/telecrm';
import { bootstrapCrossDomainSession, clearSharedAuthCookies, hasAuthTokensInUrl } from '../utils/crossDomainAuth';

const SignupContext = createContext();

export function useSignup() {
    const context = useContext(SignupContext);
    if (!context) {
        throw new Error('useSignup must be used within SignupProvider');
    }
    return context;
}

export function SignupProvider({ children }) {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('signup'); // 'signup' | 'login'
    const [collegeClickCount, setCollegeClickCount] = useState(0);

    useEffect(() => {
        let isMounted = true;

        // Two-gate system: both must complete before we unblock the UI.
        // Gate 1: onAuthStateChange fires its first event (INITIAL_SESSION / SIGNED_IN / SIGNED_OUT)
        // Gate 2: bootstrapCrossDomainSession resolves (cross-domain cookie / URL hash handoff)
        let authListenerReady = false;
        let bootstrapReady = false;

        const maybeFinishLoading = () => {
            if (isMounted && authListenerReady && bootstrapReady) {
                setLoading(false);
            }
        };

        const fetchProfile = async (userId) => {
            console.log('[Deadlock Trace] fetchProfile START', { userId });
            if (typeof window !== 'undefined') window.__APP_DEBUG__?.logs.push({ time: new Date().toISOString(), msg: 'fetchProfile START', data: { userId } });
            if (!userId || !isMounted) {
                setProfile(null);
                return;
            }
            try {
                const { data, error } = await supabase
                    .from('user_profiles')
                    .select('account_type, phone_verified')
                    .eq('id', userId)
                    .single();
                
                if (isMounted) {
                    if (error) {
                        console.error('[Deadlock Trace] fetchProfile ERROR:', error.message);
                        if (typeof window !== 'undefined') window.__APP_DEBUG__?.logs.push({ time: new Date().toISOString(), msg: 'fetchProfile ERROR', data: error.message });
                        setProfile(null);
                    } else {
                        setProfile(data);
                        console.log('[Deadlock Trace] fetchProfile END SUCCESS');
                        if (typeof window !== 'undefined') window.__APP_DEBUG__?.logs.push({ time: new Date().toISOString(), msg: 'fetchProfile END SUCCESS' });
                    }
                }
            } catch (err) {
                console.warn('[Deadlock Trace] fetchProfile ERROR (thrown):', err);
                if (typeof window !== 'undefined') window.__APP_DEBUG__?.logs.push({ time: new Date().toISOString(), msg: 'fetchProfile ERROR (thrown)', data: err.message });
            }
        };

        // Gate 1: Auth state listener
        // onAuthStateChange fires synchronously for INITIAL_SESSION if a local session
        // exists in localStorage, or fires SIGNED_OUT if none. Either way it gives us
        // the definitive auth state from Supabase's own storage.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
            if (!isMounted) return;

            console.log('[Auth Diagnostics] onAuthStateChange:', event, { 
                userId: newSession?.user?.id ?? null,
                sessionActive: !!newSession 
            });

            const currentUser = newSession?.user ?? null;
            setUser(currentUser);
            setSession(newSession);

            if (currentUser) {
                // CRITICAL BUGFIX: DO NOT AWAIT HERE!
                // gotrue-js holds `navigator.locks.request` when firing this callback during initialization.
                // If we await supabase.from() here, it ALSO requests the exact same lock!
                // Because Web Locks are NOT reentrant, they deadlock each other forever.
                // Pushing to the next tick of the event loop escapes the lock context.
                setTimeout(() => {
                    fetchProfile(currentUser.id).finally(() => {
                        if (!authListenerReady) {
                            authListenerReady = true;
                            maybeFinishLoading();
                        }
                    });
                }, 0);
            } else {
                setProfile(null);
                if (!authListenerReady) {
                    authListenerReady = true;
                    maybeFinishLoading();
                }
            }

            // Sync TeleCRM only on actual fresh sign-ins (not session restores)
            if (currentUser && event === 'SIGNED_IN') {
                const metadata = currentUser.user_metadata || {};
                pushLeadToTeleCRM({
                    name: metadata.full_name || metadata.name || '',
                    email: currentUser.email,
                    phone: metadata.phone || currentUser.phone || '',
                    status: 'Fresh',
                }, ['Colleges Platform: Signed In']);
            }
        });

        // Gate 2: Bootstrap cross-domain session (shared cookies / URL hash handoff)
        // This can restore a session that localStorage/cookies on THIS domain don't yet have,
        // e.g. when arriving from the main website. If it finds a session it calls
        // supabase.auth.setSession() which triggers onAuthStateChange again with the real user.
        const checkInitialSession = async () => {
            console.log('[Deadlock Trace] checkInitialSession START');
            if (typeof window !== 'undefined') window.__APP_DEBUG__?.logs.push({ time: new Date().toISOString(), msg: 'checkInitialSession START' });
            try {
                const crossDomainSession = await bootstrapCrossDomainSession(supabase, {
                    maxRetries: hasAuthTokensInUrl() ? 5 : 2,
                });

                if (!isMounted) return;

                // If cross-domain session found AND the auth listener hasn't seen a user yet,
                // apply it directly so we don't miss the session on slow domains.
                if (crossDomainSession?.user) {
                    console.log('[Auth Diagnostics] Session restore successful:', crossDomainSession.user.id);
                    setUser(crossDomainSession.user);
                    setSession(crossDomainSession);
                    await fetchProfile(crossDomainSession.user.id);
                }
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.warn('[Deadlock Trace] checkInitialSession ERROR:', err.message);
                    if (typeof window !== 'undefined') window.__APP_DEBUG__?.logs.push({ time: new Date().toISOString(), msg: 'checkInitialSession ERROR', data: err.message });
                }
            } finally {
                if (isMounted) {
                    // Mark Gate 2 as done regardless of success/failure
                    bootstrapReady = true;
                    maybeFinishLoading();
                    console.log('[Deadlock Trace] checkInitialSession END');
                    if (typeof window !== 'undefined') window.__APP_DEBUG__?.logs.push({ time: new Date().toISOString(), msg: 'checkInitialSession END' });
                }
            }
        };

        checkInitialSession();

        // Safety valve: force-unblock UI after max wait to avoid infinite loading screen
        const safetyDelayMs = hasAuthTokensInUrl() ? 7000 : 4000;
        const safetyTimer = setTimeout(() => {
            if (isMounted) {
                // Only log if we are actually still waiting
                if (!authListenerReady || !bootstrapReady) {
                    console.warn('[Auth Diagnostics] Safety timer fired — forcing loading=false');
                }
                authListenerReady = true;
                bootstrapReady = true;
                maybeFinishLoading();
            }
        }, safetyDelayMs);

        return () => {
            isMounted = false;
            subscription.unsubscribe();
            clearTimeout(safetyTimer);
        };
    }, []); // Empty dependency array — runs once on mount

    // Show signup nudge after 8 seconds if not logged in
    useEffect(() => {
        if (user || loading) return;

        const timer = setTimeout(() => {
            setModalMode('signup');
            setShowModal(true);
        }, 8000);

        return () => clearTimeout(timer);
    }, [user, loading]);

    // Track college clicks
    const trackCollegeClick = () => {
        if (user) return;

        const newCount = collegeClickCount + 1;
        setCollegeClickCount(newCount);

        if (newCount >= 2) {
            setModalMode('signup');
            setShowModal(true);
        }
    };

    const openSignIn = () => {
        setModalMode('login');
        setShowModal(true);
    };

    const openSignUp = () => {
        setModalMode('signup');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const logout = async () => {
        console.log('[Deadlock Trace] logout START');
        if (typeof window !== 'undefined') window.__APP_DEBUG__?.logs.push({ time: new Date().toISOString(), msg: 'logout START' });
        try {
            await supabase.auth.signOut();
            console.log('[Deadlock Trace] logout END SUCCESS');
            if (typeof window !== 'undefined') window.__APP_DEBUG__?.logs.push({ time: new Date().toISOString(), msg: 'logout END SUCCESS' });
        } catch (e) {
            console.warn('[Deadlock Trace] logout ERROR:', e);
            if (typeof window !== 'undefined') window.__APP_DEBUG__?.logs.push({ time: new Date().toISOString(), msg: 'logout ERROR', data: e.message });
        }
        
        setUser(null);
        setSession(null);
        setProfile(null);
        
        clearSharedAuthCookies();
        console.log('[Auth Diagnostics] Logout end, state cleared');
    };

    const openAuth = (mode = 'signup') => {
        setModalMode(mode);
        setShowModal(true);
    };

    const value = {
        user,
        session,
        profile,
        loading,
        showModal,
        setShowModal,
        closeModal,
        modalMode,
        openSignIn,
        openSignUp,
        openAuth,
        trackCollegeClick,
        isSignedUp: !!user,
        logout,
    };

    return (
        <SignupContext.Provider value={value}>
            {!loading && children}
        </SignupContext.Provider>
    );
}
