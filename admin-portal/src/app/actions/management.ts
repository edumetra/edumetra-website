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
    let inserted = 0;
    let updated = 0;
    let failed = 0;
    const errors: string[] = [];

    const normalizeText = (value: unknown) =>
        String(value ?? "").trim().replace(/\s+/g, " ");

    const normalizeExam = (value: unknown) => normalizeText(value).toUpperCase();
    const normalizeCategory = (value: unknown) => normalizeText(value).toUpperCase();
    const buildKey = (payload: {
        college_id: string;
        course_id: string | null;
        exam_name: string;
        year: number;
        category: string;
    }) =>
        `${payload.college_id}_${payload.course_id ?? "null"}_${normalizeExam(payload.exam_name)}_${payload.year}_${normalizeCategory(payload.category)}`;

    // 1. Filter out completely invalid rows and parse payloads
    const parsedPayloads: any[] = [];
    for (let i = 0; i < chunk.length; i++) {
        const row = chunk[i];
        const payload = {
            college_id: String(row.college_id ?? "").trim(),
            course_id: row.course_id ? String(row.course_id).trim() : null,
            exam_name: normalizeExam(row.exam_name),
            year: Number(row.year),
            category: normalizeCategory(row.category),
            closing_score: row.closing_score ?? null,
            closing_rank: row.closing_rank ?? null,
        };

        if (!payload.college_id || !payload.exam_name || !payload.category || Number.isNaN(payload.year)) {
            failed += 1;
            errors.push(`Row ${i + 1}: Missing required fields (college_id/exam_name/year/category).`);
            parsedPayloads.push(null);
        } else {
            parsedPayloads.push(payload);
        }
    }

    // If same logical key appears multiple times in the same CSV chunk,
    // keep the last occurrence only.
    const dedupedByKey = new Map<string, any>();
    for (const payload of parsedPayloads) {
        if (!payload) continue;
        dedupedByKey.set(buildKey(payload), payload);
    }
    const dedupedPayloads = Array.from(dedupedByKey.values());

    // 2. Fetch existing records for all colleges in this chunk in parallel
    const collegeIds = Array.from(new Set(dedupedPayloads.map(p => p.college_id)));
    const existingMap = new Map<string, string[]>(); // Key -> ids
    
    if (collegeIds.length > 0) {
        const { data: existingRows, error: selectErr } = await (adminClient as any)
            .from("cutoffs")
            .select("id, college_id, course_id, exam_name, year, category, created_at")
            .in("college_id", collegeIds);

        if (selectErr) {
            return { error: selectErr.message };
        }

        if (existingRows) {
            const sortedRows = [...existingRows].sort((a: any, b: any) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
            for (const rec of sortedRows) {
                const key = `${rec.college_id}_${rec.course_id ?? "null"}_${normalizeExam(rec.exam_name)}_${rec.year}_${normalizeCategory(rec.category)}`;
                const ids = existingMap.get(key) ?? [];
                ids.push(rec.id);
                existingMap.set(key, ids);
            }
        }
    }

    // 3. Separate into batch inserts and individual/parallel updates
    const toInsert: any[] = [];
    const toUpdate: { id: string; closing_score: number | null; closing_rank: number | null; rowIndex: number }[] = [];
    const duplicateIdsToDelete = new Set<string>();

    for (let i = 0; i < dedupedPayloads.length; i++) {
        const payload = dedupedPayloads[i];

        const key = buildKey(payload);
        const existingIds = existingMap.get(key) ?? [];
        const existingId = existingIds[0];

        if (existingId) {
            toUpdate.push({
                id: existingId,
                closing_score: payload.closing_score,
                closing_rank: payload.closing_rank,
                rowIndex: i + 1
            });
            // If duplicates already exist for same key, remove extras.
            if (existingIds.length > 1) {
                for (const dupId of existingIds.slice(1)) duplicateIdsToDelete.add(dupId);
            }
        } else {
            toInsert.push(payload);
        }
    }

    // 4. Perform bulk insert
    if (toInsert.length > 0) {
        const { error: insertErr } = await (adminClient as any)
            .from("cutoffs")
            .insert(toInsert);

        if (insertErr) {
            failed += toInsert.length;
            errors.push(`Bulk Insert Failed: ${insertErr.message}`);
        } else {
            inserted += toInsert.length;
        }
    }

    // 5. Perform updates
    if (toUpdate.length > 0) {
        for (const item of toUpdate) {
            const { error: updateErr } = await (adminClient as any)
                .from("cutoffs")
                .update({
                    closing_score: item.closing_score,
                    closing_rank: item.closing_rank,
                })
                .eq("id", item.id);

            if (updateErr) {
                failed += 1;
                errors.push(`Row ${item.rowIndex}: Update Failed - ${updateErr.message}`);
            } else {
                updated += 1;
            }
        }
    }

    // 6. Cleanup old duplicates for keys touched in this upload
    if (duplicateIdsToDelete.size > 0) {
        const { error: deleteDupErr } = await (adminClient as any)
            .from("cutoffs")
            .delete()
            .in("id", Array.from(duplicateIdsToDelete));
        if (deleteDupErr) {
            errors.push(`Duplicate cleanup warning: ${deleteDupErr.message}`);
        }
    }

    return {
        success: true,
        inserted,
        updated,
        failed,
        errors,
    };
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
