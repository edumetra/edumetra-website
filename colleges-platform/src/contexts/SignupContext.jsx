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
    const [modalMode, setModalMode] = useState('signup'); // 'signup' | 'login'
    const [collegeClickCount, setCollegeClickCount] = useState(0);

    useEffect(() => {
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

    const value = {
        user,
        loading,
        showModal,
        setShowModal,
        closeModal,
        modalMode,
        openSignIn,
        openSignUp,
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
