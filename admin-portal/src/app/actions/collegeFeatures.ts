"use server";

import { createClient as createServerClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function updatePremiumLocks(
    collegeId: string,
    visibilityConfig: {
        visible_in_free: string[];
        visible_in_signed_up: string[];
        visible_in_pro: string[];
        visible_in_premium: string[];
    }
) {
    try {
        if (!collegeId) return { error: "Missing college ID" };

        const cookieStore = await cookies();
        const supabase = createServerClient(cookieStore);

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) return { error: "Unauthorized — please sign in again" };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await (supabase.from("college_details") as any)
            .update({
                visible_in_free: visibilityConfig.visible_in_free,
                visible_in_signed_up: visibilityConfig.visible_in_signed_up,
                visible_in_pro: visibilityConfig.visible_in_pro,
                visible_in_premium: visibilityConfig.visible_in_premium
            })
            .eq("college_id", collegeId);

        if (updateError) {
            return { error: updateError.message };
        }

        revalidatePath(`/colleges/${collegeId}`);
        return { success: true };
    } catch (err: unknown) {
        return { error: (err as Error).message || "An unexpected error occurred" };
    }
}

export async function updateGlobalPremiumLocks(
    visibilityConfig: {
        visible_in_free: string[];
        visible_in_signed_up: string[];
        visible_in_pro: string[];
        visible_in_premium: string[];
    }
) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(cookieStore);

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) return { error: "Unauthorized — please sign in again" };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await (supabase.from("college_details") as any)
            .update({
                visible_in_free: visibilityConfig.visible_in_free,
                visible_in_signed_up: visibilityConfig.visible_in_signed_up,
                visible_in_pro: visibilityConfig.visible_in_pro,
                visible_in_premium: visibilityConfig.visible_in_premium
            })
            .not("college_id", "is", null);

        if (updateError) {
            return { error: updateError.message };
        }

        revalidatePath(`/colleges`);
        return { success: true };
    } catch (err: unknown) {
        return { error: (err as Error).message || "An unexpected error occurred" };
    }
}
