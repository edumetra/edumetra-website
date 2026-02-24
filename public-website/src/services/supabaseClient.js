import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are configured
const isConfigured = supabaseUrl && supabaseAnonKey &&
    supabaseUrl !== 'YOUR_SUPABASE_URL' &&
    supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';

// Create client only if credentials are valid, otherwise use a placeholder
export const supabase = isConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : {
        auth: {
            getSession: async () => ({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
            signUp: async () => ({ data: null, error: { message: 'Supabase not configured. Please add credentials to .env file.' } }),
            signInWithPassword: async () => ({ data: null, error: { message: 'Supabase not configured. Please add credentials to .env file.' } }),
            signOut: async () => ({ error: null }),
            resetPasswordForEmail: async () => ({ data: null, error: { message: 'Supabase not configured. Please add credentials to .env file.' } }),
            updateUser: async () => ({ data: null, error: { message: 'Supabase not configured. Please add credentials to .env file.' } }),
        }
    };

// Log warning if not configured (only in development)
if (!isConfigured && import.meta.env.DEV) {
    console.warn(
        '⚠️ Supabase is not configured. Authentication features will not work.\n' +
        'Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.\n' +
        'See SUPABASE_SETUP.md for instructions.'
    );
}
