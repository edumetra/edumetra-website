"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { logAdminAction } from "@/utils/logger";
import { Database } from "@/shared/types/database.types";

type Visibility = Database['public']['Tables']['colleges']['Row']['visibility'];

export async function deleteColleges(ids: string[]) {
    try {
        if (!ids || ids.length === 0) return { error: "No IDs provided" };

        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        // 1. Verify session first (security)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: "Unauthorized" };

        // 2. Use ADMIN client for the actual operation to bypass RLS
        const supabaseAdmin = createAdminClient();
        const { error } = await supabaseAdmin.from("colleges").delete().in("id", ids);

        if (error) {
            return { error: error.message };
        }

        // Log the action
        await logAdminAction({
            actionType: ids.length > 1 ? "BULK_UPDATE" : "DELETE",
            entityType: "colleges",
            entityId: ids.length === 1 ? ids[0] : `Multiple (${ids.length})`,
            details: { deletedIds: ids }
        }).catch(e => console.error("Audit log failed for deleteColleges", e));

        revalidatePath("/colleges");
        return { success: true };
    } catch (err: unknown) {
        return { error: (err as Error).message || "An unexpected error occurred" };
    }
}

export async function updateCollegeVisibility(id: string, visibility: Visibility) {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: "Unauthorized" };

        const supabaseAdmin = createAdminClient();
        const { error } = await supabaseAdmin
            .from("colleges")
            .update({ 
                visibility,
                is_published: visibility === "public"
            })
            .eq("id", id);

        if (error) return { error: error.message };

        revalidatePath("/colleges");
        return { success: true };
    } catch (err: unknown) {
        return { error: (err as Error).message || "An unexpected error occurred" };
    }
}

