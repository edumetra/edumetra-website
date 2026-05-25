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

export async function createCollege(collegePayload: any, detailsPayload: any) {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: "Unauthorized" };

        const supabaseAdmin = createAdminClient();
        const { data: collegeData, error: insertError } = await (supabaseAdmin.from("colleges") as any)
            .insert(collegePayload)
            .select()
            .single();

        if (insertError) throw insertError;
        if (!collegeData?.id) {
            throw new Error("College was created but server did not return an ID.");
        }

        const { error: detailsError } = await (supabaseAdmin.from("college_details") as any)
            .insert({
                ...detailsPayload,
                college_id: collegeData.id
            });

        if (detailsError) {
            console.error("Details insert error:", detailsError);
        }

        revalidatePath("/colleges");
        return { success: true, data: collegeData };
    } catch (err: unknown) {
        return { error: (err as Error).message || "An unexpected error occurred" };
    }
}

export async function updateCollege(id: string, collegePayload: any, detailsPayload: any) {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: "Unauthorized" };

        const supabaseAdmin = createAdminClient();
        const { error: updateErr } = await (supabaseAdmin.from("colleges") as any)
            .update(collegePayload)
            .eq("id", id);

        if (updateErr) throw updateErr;

        const { error: detailsError } = await (supabaseAdmin.from("college_details") as any)
            .upsert({
                ...detailsPayload,
                college_id: id
            }, { onConflict: "college_id" });

        if (detailsError) throw detailsError;

        revalidatePath(`/colleges/${id}`);
        revalidatePath("/colleges");
        return { success: true };
    } catch (err: unknown) {
        return { error: (err as Error).message || "An unexpected error occurred" };
    }
}

export async function saveCollegeCoursesAndFees(collegeId: string, courses: any[]) {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: "Unauthorized" };

        const supabaseAdmin = createAdminClient();

        for (const course of courses) {
            let savedCourseId = course.id;

            if (!savedCourseId) {
                const { data, error } = await (supabaseAdmin.from("college_courses") as any)
                    .insert({
                        college_id: collegeId,
                        name: course.name,
                        duration: course.duration,
                        eligibility_criteria: course.eligibility_criteria || null
                    })
                    .select("id")
                    .single();
                if (error) throw error;
                savedCourseId = data?.id;
            } else {
                const { error } = await (supabaseAdmin.from("college_courses") as any)
                    .update({
                        name: course.name,
                        duration: course.duration,
                        eligibility_criteria: course.eligibility_criteria || null
                    })
                    .eq("id", savedCourseId);
                if (error) throw error;
            }

            if (course.fees_breakdown && course.fees_breakdown.length > 0) {
                for (const fee of course.fees_breakdown) {
                    if (!fee.id) {
                        const { error } = await (supabaseAdmin.from("course_fees_breakdown") as any)
                            .insert({
                                course_id: savedCourseId,
                                fee_type: fee.fee_type,
                                amount: fee.amount,
                                is_annual: fee.is_annual
                            });
                        if (error) throw error;
                    } else {
                        const { error } = await (supabaseAdmin.from("course_fees_breakdown") as any)
                            .update({
                                fee_type: fee.fee_type,
                                amount: fee.amount,
                                is_annual: fee.is_annual
                            })
                            .eq("id", fee.id);
                        if (error) throw error;
                    }
                }
            }
        }

        revalidatePath(`/colleges/${collegeId}/courses`);
        return { success: true };
    } catch (err: unknown) {
        return { error: (err as Error).message || "An unexpected error occurred" };
    }
}

export async function deleteCollegeCourse(id: string, collegeId: string) {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: "Unauthorized" };

        const supabaseAdmin = createAdminClient();
        const { error } = await (supabaseAdmin.from("college_courses") as any)
            .delete()
            .eq("id", id);

        if (error) throw error;

        revalidatePath(`/colleges/${collegeId}/courses`);
        return { success: true };
    } catch (err: unknown) {
        return { error: (err as Error).message || "An unexpected error occurred" };
    }
}

export async function deleteCourseFeeBreakdown(id: string, collegeId: string) {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: "Unauthorized" };

        const supabaseAdmin = createAdminClient();
        const { error } = await (supabaseAdmin.from("course_fees_breakdown") as any)
            .delete()
            .eq("id", id);

        if (error) throw error;

        revalidatePath(`/colleges/${collegeId}/courses`);
        return { success: true };
    } catch (err: unknown) {
        return { error: (err as Error).message || "An unexpected error occurred" };
    }
}


