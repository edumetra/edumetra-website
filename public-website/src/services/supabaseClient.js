import { createClient } from '@supabase/supabase-js';
import { cookieStorage } from '../shared/utils/cookieStorage';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are configured
export const isConfigured = !!supabaseUrl && 
    !!supabaseAnonKey &&
    supabaseUrl !== 'YOUR_SUPABASE_URL' &&
    supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY' &&
    supabaseUrl.trim() !== '' &&
    supabaseAnonKey.trim() !== '';

// Recursive Proxy-based dummy client query builder to prevent crashes when chaining methods (e.g. .select().eq().in())
const createDummyQueryBuilder = () => {
    const builder = {
        then: (onfulfilled) => Promise.resolve({ data: [], count: 0, error: null }).then(onfulfilled),
        catch: (onrejected) => Promise.resolve({ data: [], count: 0, error: null }).catch(onrejected)
    };
    return new Proxy(builder, {
        get: (target, prop) => {
            if (prop === 'then' || prop === 'catch') {
                return target[prop];
            }
            return () => createDummyQueryBuilder();
        }
    });
};

export const supabase = isConfigured
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            storage: cookieStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    })
    : {
        from: () => createDummyQueryBuilder(),
        rpc: () => Promise.resolve({ data: null, error: null }),
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

