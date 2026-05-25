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

async function requireAdmin() {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized", userId: null };

    const adminClient = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (adminClient.from("admins") as any).select("role").eq("id", user.id).maybeSingle();
    if (!data || (data.role !== "superadmin" && data.role !== "mini_admin")) {
        return { error: "Only admins can perform this action", userId: user.id };
    }
    return { error: null, userId: user.id };
}

export async function createEvent(payload: {
    slug: string;
    title: string;
    date: string;
    time: string;
    category: string;
    speaker: string;
    speaker_title: string;
    about_speaker: string;
    description: string;
    long_description: string;
    image: string;
    featured: boolean;
    type: string;
    agenda: string[];
}) {
    const auth = await requireAdmin();
    if (auth.error) return { error: auth.error };
    const adminClient = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (adminClient as any).from("events").insert([payload]).select().single();
    return error ? { error: error.message } : { success: true, data };
}

export async function updateEvent(
    eventId: string,
    payload: {
        slug: string;
        title: string;
        date: string;
        time: string;
        category: string;
        speaker: string;
        speaker_title: string;
        about_speaker: string;
        description: string;
        long_description: string;
        image: string;
        featured: boolean;
        type: string;
        agenda: string[];
    }
) {
    const auth = await requireAdmin();
    if (auth.error) return { error: auth.error };
    const adminClient = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (adminClient as any)
        .from("events")
        .update(payload)
        .eq("id", eventId)
        .select()
        .single();
    return error ? { error: error.message } : { success: true, data };
}

export async function deleteEvent(eventId: string) {
    const auth = await requireAdmin();
    if (auth.error) return { error: auth.error };
    const adminClient = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (adminClient as any).from("events").delete().eq("id", eventId);
    return error ? { error: error.message } : { success: true };
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

export async function createNewsUpdate(payload: {
    title: string;
    content: string;
    image_url: string | null;
    tags: string[] | null;
    published_at: string;
    is_subscriber_only: boolean;
}) {
    const auth = await requireAdmin();
    if (auth.error) return { error: auth.error };
    const adminClient = createAdminClient();
    const { data, error } = await (adminClient as any)
        .from("news_updates")
        .insert([payload])
        .select()
        .single();
    return error ? { error: error.message } : { success: true, data };
}

export async function updateNewsUpdate(
    id: string,
    payload: {
        title: string;
        content: string;
        image_url: string | null;
        tags: string[] | null;
        published_at: string;
        is_subscriber_only: boolean;
    }
) {
    const auth = await requireAdmin();
    if (auth.error) return { error: auth.error };
    const adminClient = createAdminClient();
    const { error } = await (adminClient as any)
        .from("news_updates")
        .update(payload)
        .eq("id", id);
    return error ? { error: error.message } : { success: true };
}

export async function deleteNewsUpdate(id: string) {
    const auth = await requireAdmin();
    if (auth.error) return { error: auth.error };
    const adminClient = createAdminClient();
    const { error } = await (adminClient as any)
        .from("news_updates")
        .delete()
        .eq("id", id);
    return error ? { error: error.message } : { success: true };
}

export async function createArticle(payload: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    author: string;
    image_url: string;
    published: boolean;
}) {
    const auth = await requireAdmin();
    if (auth.error) return { error: auth.error };
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
        .from("articles")
        .insert([payload])
        .select()
        .single();
    return error ? { error: error.message } : { success: true, data };
}

export async function deleteArticle(id: string) {
    const auth = await requireAdmin();
    if (auth.error) return { error: auth.error };
    const adminClient = createAdminClient();
    const { error } = await adminClient
        .from("articles")
        .delete()
        .eq("id", id);
    return error ? { error: error.message } : { success: true };
}

export async function toggleArticlePublish(id: string, published: boolean) {
    const auth = await requireAdmin();
    if (auth.error) return { error: auth.error };
    const adminClient = createAdminClient();
    const { error } = await adminClient
        .from("articles")
        .update({ published })
        .eq("id", id);
    return error ? { error: error.message } : { success: true };
}

export async function updateCoupon(
    id: string,
    payload: {
        code: string;
        discount_percentage: number;
        razorpay_offer_id: string | null;
        max_uses: number | null;
        expires_at: string | null;
        is_active: boolean;
    }
) {
    const auth = await requireSuperadmin();
    if (auth.error) return { error: auth.error };
    const adminClient = createAdminClient();
    const { error } = await adminClient
        .from("coupons")
        .update(payload)
        .eq("id", id);
    return error ? { error: error.message } : { success: true };
}

export async function deleteCoupon(id: string) {
    const auth = await requireSuperadmin();
    if (auth.error) return { error: auth.error };
    const adminClient = createAdminClient();
    const { error } = await adminClient
        .from("coupons")
        .delete()
        .eq("id", id);
    return error ? { error: error.message } : { success: true };
}

export async function updateRanking(id: string, editValues: any) {
    const auth = await requireAdmin();
    if (auth.error) return { error: auth.error };
    const adminClient = createAdminClient();
    const { error } = await (adminClient as any)
        .from("rankings")
        .update(editValues)
        .eq("id", id);
    return error ? { error: error.message } : { success: true };
}

export async function deleteRanking(id: string) {
    const auth = await requireAdmin();
    if (auth.error) return { error: auth.error };
    const adminClient = createAdminClient();
    const { error } = await (adminClient as any)
        .from("rankings")
        .delete()
        .eq("id", id);
    return error ? { error: error.message } : { success: true };
}

export async function createRankingsBulk(inserts: any[]) {
    const auth = await requireAdmin();
    if (auth.error) return { error: auth.error };
    const adminClient = createAdminClient();
    const { error } = await (adminClient as any)
        .from("rankings")
        .insert(inserts);
    return error ? { error: error.message } : { success: true };
}

export async function createCutoff(payload: {
    college_id: string;
    course_id: string | null;
    exam_name: string;
    year: number;
    category: string;
    closing_score: number | null;
    closing_rank: number | null;
}) {
    const auth = await requireAdmin();
    if (auth.error) return { error: auth.error };
    const adminClient = createAdminClient();
    const { error } = await (adminClient as any)
        .from("cutoffs")
        .insert([payload]);
    return error ? { error: error.message } : { success: true };
}

export async function createCutoffsBulk(chunk: any[]) {
    const auth = await requireAdmin();
    if (auth.error) return { error: auth.error };
    const adminClient = createAdminClient();
    const { error } = await (adminClient as any)
        .from("cutoffs")
        .insert(chunk);
    return error ? { error: error.message } : { success: true };
}

export async function updateCutoff(id: string, editValues: any) {
    const auth = await requireAdmin();
    if (auth.error) return { error: auth.error };
    const adminClient = createAdminClient();
    const { error } = await (adminClient as any)
        .from("cutoffs")
        .update(editValues)
        .eq("id", id);
    return error ? { error: error.message } : { success: true };
}

export async function deleteCutoff(id: string) {
    const auth = await requireAdmin();
    if (auth.error) return { error: auth.error };
    const adminClient = createAdminClient();
    const { error } = await (adminClient as any)
        .from("cutoffs")
        .delete()
        .eq("id", id);
    return error ? { error: error.message } : { success: true };
}

export async function updateUserProfile(
    id: string,
    payload: {
        is_banned?: boolean;
        banned_at?: string | null;
        account_type?: "free" | "premium" | "pro";
    }
) {
    const auth = await requireAdmin();
    if (auth.error) return { error: auth.error };
    const adminClient = createAdminClient();
    const { error } = await adminClient
        .from("user_profiles")
        .update(payload)
        .eq("id", id);
    return error ? { error: error.message } : { success: true };
}

export async function updateCareerApplicationStatus(
    id: string,
    status: "pending" | "under_review" | "accepted" | "rejected"
) {
    const auth = await requireAdmin();
    if (auth.error) return { error: auth.error };
    const adminClient = createAdminClient();
    const { error } = await adminClient
        .from("career_applications")
        .update({ status })
        .eq("id", id);
    return error ? { error: error.message } : { success: true };
}

export async function updateReviewModerationStatus(
    id: string,
    status: "visible" | "hidden" | "pending"
) {
    const auth = await requireAdmin();
    if (auth.error) return { error: auth.error };
    const adminClient = createAdminClient();
    const { error } = await adminClient
        .from("reviews")
        .update({ moderation_status: status })
        .eq("id", id);
    return error ? { error: error.message } : { success: true };
}

export async function updateReviewsModerationStatusBulk(
    ids: string[],
    status: "visible" | "hidden" | "pending"
) {
    const auth = await requireAdmin();
    if (auth.error) return { error: auth.error };
    const adminClient = createAdminClient();
    const { error } = await adminClient
        .from("reviews")
        .update({ moderation_status: status })
        .in("id", ids);
    return error ? { error: error.message } : { success: true };
}

export async function deleteReview(id: string) {
    const auth = await requireAdmin();
    if (auth.error) return { error: auth.error };
    const adminClient = createAdminClient();
    const { error } = await adminClient
        .from("reviews")
        .delete()
        .eq("id", id);
    return error ? { error: error.message } : { success: true };
}

export async function saveReviewAdminReply(
    id: string,
    reply: string
) {
    const auth = await requireAdmin();
    if (auth.error) return { error: auth.error };
    const adminClient = createAdminClient();
    const { error } = await (adminClient as any)
        .from("reviews")
        .update({
            admin_reply: reply,
            admin_reply_at: new Date().toISOString(),
        })
        .eq("id", id);
    return error ? { error: error.message } : { success: true };
}

export async function clearReviewAdminReply(id: string) {
    const auth = await requireAdmin();
    if (auth.error) return { error: auth.error };
    const adminClient = createAdminClient();
    const { error } = await (adminClient as any)
        .from("reviews")
        .update({
            admin_reply: null,
            admin_reply_at: null,
        })
        .eq("id", id);
    return error ? { error: error.message } : { success: true };
}

