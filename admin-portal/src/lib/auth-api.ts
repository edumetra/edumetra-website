import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabasePublicEnv } from '@/lib/env';
import type { Database } from '@/shared/types/database.types';

/**
 * Verify the caller is a signed-in admin. Use on sensitive API routes.
 * Returns null when authorized, or a Response to return immediately.
 */
export async function requireAdminApiAuth(): Promise<Response | null> {
    try {
        const { url, anonKey } = getSupabasePublicEnv();
        const cookieStore = await cookies();

        const supabase = createServerClient<Database>(url, anonKey, {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll() {
                    // API routes are read-only for cookies
                },
            },
        });

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: admin, error: adminError } = await supabase
            .from('admins')
            .select('id, role')
            .eq('id', user.id)
            .maybeSingle();

        if (adminError || !admin) {
            return Response.json({ error: 'Forbidden — not an admin' }, { status: 403 });
        }

        return null;
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Auth check failed';
        return Response.json({ error: message }, { status: 500 });
    }
}
