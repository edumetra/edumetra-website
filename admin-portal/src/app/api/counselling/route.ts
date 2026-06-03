import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { logAdminAction } from "@/utils/logger";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: adminProfile, error: adminError } = await supabase
            .from("admins")
            .select("role, permissions")
            .eq("id", user.id)
            .maybeSingle();

        if (adminError || !adminProfile) {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        const permissions = (adminProfile.permissions ?? {}) as Record<string, boolean>;
        if (adminProfile.role !== "superadmin" && !permissions.counselling) {
            return NextResponse.json({ error: "Counselling permission required" }, { status: 403 });
        }

        const adminClient = createAdminClient();
        const { data, error } = await adminClient
            .from("counselling_requests")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ requests: data ?? [] });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load counselling requests";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: adminProfile, error: adminError } = await supabase
            .from("admins")
            .select("role, permissions")
            .eq("id", user.id)
            .maybeSingle();

        if (adminError || !adminProfile) {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        const permissions = (adminProfile.permissions ?? {}) as Record<string, boolean>;
        if (adminProfile.role !== "superadmin" && !permissions.counselling) {
            return NextResponse.json({ error: "Counselling permission required" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        if (!id) {
            return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
        }

        const adminClient = createAdminClient();
        
        // Fetch details before deleting for logging
        const { data: requestToDelete } = await adminClient
            .from("counselling_requests")
            .select("name, email, phone")
            .eq("id", id)
            .maybeSingle();

        const { error } = await adminClient
            .from("counselling_requests")
            .delete()
            .eq("id", id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Log admin deletion action
        logAdminAction({
            actionType: "DELETE",
            entityType: "counselling_requests",
            entityId: id,
            details: requestToDelete ? { name: requestToDelete.name, email: requestToDelete.email, phone: requestToDelete.phone } : { action: "delete_counselling_request" }
        }).catch(e => console.error("Audit log failed for counselling request deletion", e));

        return NextResponse.json({ success: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to delete counselling request";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
