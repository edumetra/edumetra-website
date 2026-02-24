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
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [collegeClickCount, setCollegeClickCount] = useState(0);

    useEffect(() => {
        // Check active sessions and subscribe to auth changes
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Track time spent on site (show modal if not logged in)
    useEffect(() => {
        if (user || loading) return;

        const timer = setTimeout(() => {
            setShowModal(true);
        }, 8000); // Increased to 8 seconds to be less annoying

        return () => clearTimeout(timer);
    }, [user, loading]);

    // Track college clicks
    const trackCollegeClick = () => {
        if (user) return;

        const newCount = collegeClickCount + 1;
        setCollegeClickCount(newCount);

        // Show modal on 2nd college click
        if (newCount >= 2) {
            setShowModal(true);
        }
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    const value = {
        user,
        loading,
        showModal,
        setShowModal,
        closeModal,
        trackCollegeClick,
        isSignedUp: !!user, // Backward compatibility
        logout
    };

    return (
        <SignupContext.Provider value={value}>
            {!loading && children}
        </SignupContext.Provider>
    );
}
