"use server";

import { cookies } from "next/headers";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

async function requireSuperadmin() {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized", userId: null };

    const adminClient = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (adminClient.from("admins") as any).select("role").eq("id", user.id).maybeSingle();
    if (data?.role !== "superadmin") return { error: "Only superadmins can perform this action", userId: user.id };
    return { error: null, userId: user.id };
}

export async function createCoupon(payload: {
    code: string;
    discount_percentage: number;
    razorpay_offer_id: string | null;
    max_uses: number | null;
    expires_at: string | null;
    is_active: boolean;
}) {
    const auth = await requireSuperadmin();
    if (auth.error) return { error: auth.error };
    const adminClient = createAdminClient();
    const { error } = await adminClient.from("coupons").insert([payload]);
    return error ? { error: error.message } : { success: true };
}

export async function createRanking(payload: {
    college_id: string;
    provider: string;
    year: number;
    rank: number;
    category: string | null;
}) {
    const auth = await requireSuperadmin();
    if (auth.error) return { error: auth.error };
    const adminClient = createAdminClient();
    // DB type definitions are behind schema (provider/category fields), so use runtime-safe cast.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (adminClient.from("rankings") as any).insert([payload]);
    return error ? { error: error.message } : { success: true };
}

export async function updateArticleById(
    articleId: string,
    payload: {
        title: string;
        slug: string;
        excerpt: string;
        content: string;
        author: string;
        image_url: string;
        published: boolean;
    }
) {
    const auth = await requireSuperadmin();
    if (auth.error) return { error: auth.error };
    const adminClient = createAdminClient();
    const { error } = await adminClient
        .from("articles")
        .update({
            title: payload.title,
            slug: payload.slug,
            excerpt: payload.excerpt || null,
            content: payload.content,
            author: payload.author || null,
            image_url: payload.image_url || null,
            published: payload.published,
        })
        .eq("id", articleId);
    return error ? { error: error.message } : { success: true };
}
