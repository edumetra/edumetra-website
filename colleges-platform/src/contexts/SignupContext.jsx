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
            if (!isMounted) return;

            const currentUser = session?.user ?? null;
            setUser(currentUser);
            setSession(session);
            
            // If we just got a user (e.g. from a shared cookie), fetch their profile
            if (currentUser) {
                await fetchProfile(currentUser.id);
            } else {
                setProfile(null);
            }
            setLoading(false);
            
            if (currentUser && event === 'SIGNED_IN') {
                // Sync with TeleCRM only on actual sign-in events
                const metadata = currentUser.user_metadata || {};
                pushLeadToTeleCRM({
                    name: metadata.full_name || metadata.name || '',
                    email: currentUser.email,
                    phone: metadata.phone || currentUser.phone || '',
                    status: 'Fresh',
                }, ['Colleges Platform: Signed In']);
            }
        });

        // Bootstrap shared cookies + URL hash handoff from public website
        const checkInitialSession = async () => {
            try {
                const session = await bootstrapCrossDomainSession(supabase, {
                    maxRetries: hasAuthTokensInUrl() ? 5 : 2,
                });

                if (!isMounted) return;

                if (session?.user) {
                    setUser(session.user);
                    setSession(session);
                    await fetchProfile(session.user.id);
                }
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.warn('Initial session check failed:', err.message);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        checkInitialSession();

        const safetyDelayMs = hasAuthTokensInUrl() ? 6000 : 3000;
        const safetyTimer = setTimeout(() => {
            if (isMounted) setLoading(false);
        }, safetyDelayMs);

        return () => {
            isMounted = false;
            subscription.unsubscribe();
            clearTimeout(safetyTimer);
        };
    }, []); // Empty dependency array for mount only

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
        try {
            await supabase.auth.signOut();
        } catch (e) {
            console.warn('Signout issue', e);
        }
        
        setUser(null);
        setSession(null);
        setProfile(null);
        
        clearSharedAuthCookies();
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
