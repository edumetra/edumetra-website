import { createClient } from '@supabase/supabase-js';
import { cookieStorage } from '../utils/cookieStorage';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Determine which storage to use:
// - Localhost: localStorage is more reliable for local development across different ports.
// - Production: cookieStorage is required to sync sessions across edumetraglobal.com subdomains.
const isLocal = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: isLocal ? undefined : cookieStorage, // undefined defaults to localStorage
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});
