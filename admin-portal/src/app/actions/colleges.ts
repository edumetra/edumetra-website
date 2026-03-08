"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { logAdminAction } from "@/utils/logger";

export async function deleteColleges(ids: string[]) {
    try {
        if (!ids || ids.length === 0) return { error: "No IDs provided" };

        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        // Verify admin status implicitly via RLS or explicitly
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: "Unauthorized" };

        // Perform deletion
        const { error } = await supabase.from("colleges").delete().in("id", ids);

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
