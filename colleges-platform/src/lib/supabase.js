import { createClient } from '@supabase/supabase-js';
import { cookieStorage } from '../utils/cookieStorage';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isBrowser = typeof window !== 'undefined';
const supabaseUrl = isBrowser ? `${window.location.origin}/supabase` : rawUrl;

export const isConfigured = !!rawUrl && 
    !!supabaseAnonKey && 
    rawUrl !== 'YOUR_SUPABASE_URL' && 
    supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY' &&
    rawUrl.trim() !== '' &&
    supabaseAnonKey.trim() !== '';

// Recursive Proxy-based dummy client query builder to prevent crashes when chaining methods (e.g. .select().eq().in().order().range())
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
            // Return a function that returns a new query builder (supporting method chaining indefinitely)
            return () => createDummyQueryBuilder();
        }
    });
};

let supabaseInstance;
try {
    if (!isConfigured) {
        throw new Error("Supabase credentials are not configured or are placeholder values.");
    }
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            storage: cookieStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    });
} catch (e) {
    console.error("⚠️ SUPABASE INITIALIZATION ERROR:", e.message || e);
    console.warn(
        "Edumetra is running in MOCK DEMO MODE. Database queries will return empty arrays safely.\n" +
        "To connect to your live database:\n" +
        "1. In Local Development: Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.\n" +
        "2. In Vercel Deployment: Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your Project Environment Variables and trigger a fresh redeployment."
    );

    // Provide a crash-proof, recursive proxy-based dummy client
    supabaseInstance = {
        from: () => createDummyQueryBuilder(),
        rpc: () => Promise.resolve({ data: null, error: null }),
        auth: {
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            getUser: () => Promise.resolve({ data: { user: null }, error: null }),
            signInWithPassword: () => Promise.resolve({ data: { session: null, user: null }, error: { message: "Mock client active" } }),
            signUp: () => Promise.resolve({ data: { session: null, user: null }, error: { message: "Mock client active" } }),
            signOut: () => Promise.resolve({ error: null }),
            resetPasswordForEmail: () => Promise.resolve({ data: null, error: { message: "Mock client active" } }),
            updateUser: () => Promise.resolve({ data: null, error: { message: "Mock client active" } })
        }
    };
}

export const supabase = supabaseInstance;

