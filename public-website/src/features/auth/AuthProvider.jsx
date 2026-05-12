/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../../services/supabaseClient';
import { pushLeadToTeleCRM } from '../../services/telecrm';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};


export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const checkSession = async (retries = 3) => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                
                if (!isMounted) return;

                if (session) {
                    setSession(session);
                    setUser(session.user);
                    setLoading(false);
                } else if (window.location.hash.includes('access_token') && retries > 0) {
                    // Token is in URL but not parsed yet, retry in 500ms
                    setTimeout(() => checkSession(retries - 1), 500);
                } else {
                    setLoading(false);
                }
            } catch (err) {
                console.warn('Auth session check failed:', err);
                if (isMounted) setLoading(false);
            }
        };

        checkSession();

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user ?? null;
            if (isMounted) {
                setSession(session);
                setUser(currentUser);
                setLoading(false);
            }

            if (currentUser) {
                const metadata = currentUser.user_metadata || {};
                pushLeadToTeleCRM({
                    name: metadata.full_name || '',
                    email: currentUser.email,
                    phone: metadata.phone || '',
                    status: 'Fresh'
                }, ['Sync: Public Website']);
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signUp = async (email, password, metadata = {}) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata,
                },
            });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error: error.message };
        }
    };

    const signIn = async (identifier, password) => {
        try {
            console.log('Attempting login for:', identifier);
            
            // First, try to resolve phone to email if needed
            const { data: resolvedEmail, error: rpcError } = await supabase.rpc('get_email_for_auth', { 
                p_identifier: identifier 
            });

            if (rpcError) console.error('Email resolution error:', rpcError);
            console.log('Resolved email:', resolvedEmail);

            // Always sign in with email (resolved or original)
            const finalEmail = resolvedEmail || (identifier.includes('@') ? identifier : null);
            
            if (!finalEmail) {
                throw new Error('Could not find an account with that phone number. Please sign up or use email.');
            }

            console.log('Final login payload:', { email: finalEmail });

            const { data, error } = await supabase.auth.signInWithPassword({
                email: finalEmail,
                password,
            });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('SignIn error details:', error);
            return { data: null, error: error.message };
        }
    };


    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            return { error: null };
        } catch (error) {
            return { error: error.message };
        }
    };

    const resetPassword = async (email) => {
        try {
            const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error: error.message };
        }
    };

    const updatePassword = async (newPassword) => {
        try {
            const { data, error } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error: error.message };
        }
    };

    const value = {
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
