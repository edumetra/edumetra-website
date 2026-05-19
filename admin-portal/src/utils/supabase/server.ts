import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/shared/types/database.types";
import { getSupabasePublicEnv } from "@/lib/env";

export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
    const { url, anonKey } = getSupabasePublicEnv();
    return createServerClient<Database>(
        url,
        anonKey,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );
};
