import { createClient } from '@supabase/supabase-js';
import { cookieStorage } from '../utils/cookieStorage';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabaseInstance;
try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            storage: cookieStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    });
} catch (e) {
    console.error("SUPABASE INIT ERROR:", e);
    // Provide a dummy client that doesn't crash the app but returns empty data
    supabaseInstance = {
        from: () => ({
            select: () => ({
                eq: () => ({
                    order: () => ({
                        limit: () => Promise.resolve({ data: [], error: null }),
                        range: () => ({ abortSignal: () => Promise.resolve({ data: [], count: 0, error: null }) })
                    })
                }),
                order: () => ({
                    limit: () => Promise.resolve({ data: [], error: null })
                })
            })
        }),
        auth: {
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            getSession: () => Promise.resolve({ data: { session: null }, error: null })
        }
    };
}

export const supabase = supabaseInstance;
