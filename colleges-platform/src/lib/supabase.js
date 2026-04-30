import { createClient } from '@supabase/supabase-js';
import { cookieStorage } from '../utils/cookieStorage';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: cookieStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});
