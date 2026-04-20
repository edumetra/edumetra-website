import { createClient } from "@supabase/supabase-js";
import { Database } from "@/shared/types/database.types";

export const createAdminClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error("Missing Supabase admin credentials for engagement automation");
    }

    return createClient<Database>(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false },
    });
};
