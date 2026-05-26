"use server";

import { createClient as createServerClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const PREMIUM_ALL_FEATURES = ["cutoffs", "rankings", "reviews", "gallery", "courses", "contact", "admissions", "placements", "qna", "faq"] as const;

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

        const normalizedConfig = {
            ...visibilityConfig,
            visible_in_premium: [...PREMIUM_ALL_FEATURES],
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await (supabase.from("college_details") as any)
            .update({
                visible_in_free: normalizedConfig.visible_in_free,
                visible_in_signed_up: normalizedConfig.visible_in_signed_up,
                visible_in_pro: normalizedConfig.visible_in_pro,
                visible_in_premium: normalizedConfig.visible_in_premium
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

export async function getGlobalPremiumLocks() {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(cookieStore);

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) return { error: "Unauthorized — please sign in again" };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from("college_details") as any)
            .select("visible_in_free, visible_in_signed_up, visible_in_pro, visible_in_premium")
            .limit(1)
            .maybeSingle() as any;

        if (error) return { error: error.message };

        const defaults = {
            visible_in_free: [] as string[],
            visible_in_signed_up: [] as string[],
            visible_in_pro: [] as string[],
            visible_in_premium: [...PREMIUM_ALL_FEATURES],
        };

        if (!data) return { config: defaults };

        return {
            config: {
                visible_in_free: data.visible_in_free ?? defaults.visible_in_free,
                visible_in_signed_up: data.visible_in_signed_up ?? defaults.visible_in_signed_up,
                visible_in_pro: data.visible_in_pro ?? defaults.visible_in_pro,
                visible_in_premium: defaults.visible_in_premium,
            },
        };
    } catch (err: unknown) {
        return { error: (err as Error).message || "Failed to load global locks" };
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

        const normalizedConfig = {
            ...visibilityConfig,
            visible_in_premium: [...PREMIUM_ALL_FEATURES],
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await (supabase.from("college_details") as any)
            .update({
                visible_in_free: normalizedConfig.visible_in_free,
                visible_in_signed_up: normalizedConfig.visible_in_signed_up,
                visible_in_pro: normalizedConfig.visible_in_pro,
                visible_in_premium: normalizedConfig.visible_in_premium
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
