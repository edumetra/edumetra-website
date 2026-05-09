"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { logAdminAction } from "@/utils/logger";

type CollegeTemplateRow = {
    "College Name": string;
    "City"?: string;
    "State"?: string;
    "Type"?: string;
    "Established Year"?: number | string;
    "Total Intake Capacity"?: number | string;
    "Minority Status"?: string;
    "Seat Reservations"?: string;
    "Website URL"?: string;
    "Description"?: string;
};

export async function processBulkColleges(rows: CollegeTemplateRow[]) {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { error: "Unauthorized. Please sign in." };
        }

        // Validate basic Admin role
        const { data: adminData } = await supabase
            .from("admins")
            .select("role")
            .eq("id", user.id)
            .single();

        if (!adminData) {
            return { error: "Unauthorized. Admin privileges required." };
        }

        if (!rows || !Array.isArray(rows) || rows.length === 0) {
            return { error: "No data rows provided in the spreadsheet." };
        }

        const newColleges: any[] = [];
        let skipped = 0;

        for (const row of rows) {
            const name = row["College Name"]?.toString().trim();
            if (!name) {
                skipped++;
                continue;
            }

            // Generate a simple slug
            let baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

            // Generate a random 4-char suffix to prevent all collisions immediately
            const suffix = Math.random().toString(36).substring(2, 6);
            const slug = `${baseSlug}-${suffix}`;

            newColleges.push({
                name,
                slug,
                location_city: row["City"]?.toString().trim() || null,
                location_state: row["State"]?.toString().trim() || null,
                type: row["Type"]?.toString().trim() || null,
                established_year: row["Established Year"] ? parseInt(row["Established Year"].toString(), 10) : null,
                intake_capacity: row["Total Intake Capacity"] ? parseInt(row["Total Intake Capacity"].toString(), 10) : null,
                minority_status: row["Minority Status"]?.toString().trim() || null,
                seat_reservations: row["Seat Reservations"]?.toString().trim() || null,
                website_url: row["Website URL"]?.toString().trim() || null,
                description: row["Description"]?.toString().trim() || null,
                visibility: "draft", // Default to draft for bulk uploads
                is_published: false
            });
        }

        if (newColleges.length === 0) {
            return { error: "No valid college names found in the uploaded file." };
        }

        // Use ADMIN client for insertion
        const supabaseAdmin = createAdminClient();
        const { error: insertError } = await supabaseAdmin.from("colleges").insert(newColleges);

        if (insertError) {
            return { error: "Database error during insertion: " + insertError.message };
        }

        // Fire Audit Log asynchronously
        logAdminAction({
            actionType: "BULK_UPDATE",
            entityType: "colleges",
            details: { insertedCount: newColleges.length, skippedCount: skipped }
        }).catch(e => console.error("Audit log failed for bulk upload", e));

        revalidatePath("/colleges");

        return {
            success: true,
            inserted: newColleges.length,
            skipped
        };
    } catch (err: unknown) {
        return { error: (err as Error).message || "An unexpected error occurred during processing." };
    }
}
