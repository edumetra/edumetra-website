import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('signup'); // 'signup' | 'login'
    const [collegeClickCount, setCollegeClickCount] = useState(0);

    useEffect(() => {
        let isMounted = true;

        const fetchProfile = async (userId) => {
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
                        console.error('Profile fetch error:', error.message);
                        setProfile(null);
                    } else {
                        setProfile(data);
                    }
                }
            } catch (err) {
                console.warn('Profile fetch aborted or failed:', err);
            }
        };

        // Listen for auth changes - THIS captures the initial session too
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            const currentUser = session?.user ?? null;
            if (isMounted) setUser(currentUser);
            
            if (currentUser) {
                await fetchProfile(currentUser.id);
            } else if (isMounted) {
                setProfile(null);
            }

            // Always clear loading after the first auth event (or if session already exists)
            if (isMounted) setLoading(false);
        });

        // Fallback & Recovery: Catch sessions that standard listeners might miss (especially OAuth redirects)
        const checkInitialSession = async (retries = 3) => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                
                if (!isMounted) return;

                if (session?.user) {
                    setUser(session.user);
                    await fetchProfile(session.user.id);
                    setLoading(false);
                } else if (window.location.hash.includes('access_token') && retries > 0) {
                    // If we see a token in the URL but Supabase hasn't parsed it yet, retry in 500ms
                    setTimeout(() => checkInitialSession(retries - 1), 500);
                } else {
                    // If no session after retries or no hash, stop loading
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    console.warn('Auth check aborted:', err);
                    setLoading(false);
                }
            }
        };

        // SAFETY FAIL-SAFE:
        // In strict privacy browsers (like Ulaa), Supabase might be blocked entirely.
        // We force loading to false after 3 seconds to ensure the app shell mounts regardless.
        const safetyTimer = setTimeout(() => {
            if (isMounted && loading) {
                console.warn('SignupProvider: Safety timeout reached. Forcing loading to false.');
                setLoading(false);
            }
        }, 3000);

        checkInitialSession();

        return () => {
            isMounted = false;
            subscription.unsubscribe();
            clearTimeout(safetyTimer);
        };
    }, [loading]); // Added loading to deps to check state in timeout

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
        await supabase.auth.signOut();
    };

    const openAuth = (mode = 'signup') => {
        setModalMode(mode);
        setShowModal(true);
    };

    const value = {
        user,
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
