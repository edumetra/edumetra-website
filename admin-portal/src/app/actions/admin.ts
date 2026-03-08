"use server";

import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { logAdminAction } from "@/utils/logger";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const getSupabaseAdmin = () => {
    if (!supabaseServiceKey) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set in environment variables");
    }
    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
};

export async function createAdminAccount(formData: FormData) {
    try {
        const email = formData.get("email")?.toString();
        const password = formData.get("password")?.toString();
        const role = formData.get("role")?.toString() as "superadmin" | "mini_admin";
        const permissionsRaw = formData.get("permissions")?.toString();

        let permissions: Record<string, boolean> = {};
        try {
            if (permissionsRaw) permissions = JSON.parse(permissionsRaw);
        } catch {
            // ignore malformed permissions
        }

        if (!email || !password || !role) {
            return { error: "Missing required fields" };
        }

        // Verify current user is a superadmin using the proper SSR server client
        const cookieStore = await cookies();
        const supabase = createServerClient(cookieStore);

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) return { error: "Unauthorized — please sign in again" };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: adminData } = await supabase.from("admins").select("role").eq("id", user.id).single() as any;
        if (adminData?.role !== "superadmin") {
            return { error: "Only superadmins can create new admins" };
        }

        // Use service role to create the Auth user
        const adminClient = getSupabaseAdmin();

        let userId: string;
        const { data: { user: newUser }, error: createError } = await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        });

        if (createError) {
            if (createError.message.includes("already exist")) {
                const { data: users, error: listError } = await adminClient.auth.admin.listUsers();
                if (listError) return { error: "Could not list users: " + listError.message };
                const existingUser = users.users.find((u) => u.email === email);
                if (!existingUser) return { error: "User already exists but could not find by email" };
                userId = existingUser.id;
            } else {
                return { error: createError.message };
            }
        } else if (newUser) {
            userId = newUser.id;
        } else {
            return { error: "Failed to create or find user." };
        }

        // Insert into admins table with permissions
        const { error: insertError } = await adminClient
            .from("admins")
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .insert({ id: userId, email, role, permissions } as any);

        if (insertError?.code === "23505") {
            return { error: "This user is already an admin" };
        } else if (insertError) {
            return { error: "Error adding admin to table: " + insertError.message };
        }

        logAdminAction({
            actionType: "CREATE",
            entityType: "admins",
            entityId: userId,
            details: { email, role, permissions }
        }).catch(e => console.error("Audit log failed for admin creation", e));

        revalidatePath("/settings/admins");
        return { success: true };
    } catch (err: unknown) {
        return { error: (err as Error).message || "An unexpected error occurred" };
    }
}

export async function resetAdminPassword(adminId: string, newPassword: string) {
    try {
        if (!adminId || !newPassword) {
            return { error: "Missing admin ID or new password" };
        }

        // Verify current user is a superadmin using the proper SSR server client
        const cookieStore = await cookies();
        const supabase = createServerClient(cookieStore);

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) return { error: "Unauthorized — please sign in again" };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: adminData } = await supabase.from("admins").select("role").eq("id", user.id).single() as any;
        if (adminData?.role !== "superadmin") {
            return { error: "Only superadmins can reset passwords" };
        }

        // Use service role to update the Auth user's password
        const adminClient = getSupabaseAdmin();

        const { error: updateError } = await adminClient.auth.admin.updateUserById(adminId, {
            password: newPassword,
        });

        if (updateError) {
            return { error: updateError.message };
        }

        logAdminAction({
            actionType: "UPDATE",
            entityType: "admins",
            entityId: adminId,
            details: { action: "password_reset_by_superadmin" }
        }).catch(e => console.error("Audit log failed for password reset", e));

        return { success: true };
    } catch (err: unknown) {
        return { error: (err as Error).message || "An unexpected error occurred" };
    }
}

export async function updateAdminRole(adminId: string, role: "superadmin" | "mini_admin") {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(cookieStore);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: "Unauthorized" };

        const { data: adminData } = await supabase.from("admins").select("role").eq("id", user.id).single() as any;
        if (adminData?.role !== "superadmin") return { error: "Only superadmins can change roles" };

        const adminClient = getSupabaseAdmin();
        const { error } = await adminClient.from("admins").update({ role } as any).eq("id", adminId);

        if (error) return { error: error.message };

        logAdminAction({
            actionType: "UPDATE",
            entityType: "admins",
            entityId: adminId,
            details: { action: "role_changed", newRole: role }
        }).catch(e => console.error("Audit log failed", e));

        return { success: true };
    } catch (err: any) {
        return { error: err.message || "An error occurred" };
    }
}

export async function updateAdminPermissions(adminId: string, permissions: Record<string, boolean>) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(cookieStore);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: "Unauthorized" };

        const { data: adminData } = await supabase.from("admins").select("role").eq("id", user.id).single() as any;
        if (adminData?.role !== "superadmin") return { error: "Only superadmins can change permissions" };

        const adminClient = getSupabaseAdmin();
        const { error } = await adminClient.from("admins").update({ permissions } as any).eq("id", adminId);

        if (error) return { error: error.message };

        logAdminAction({
            actionType: "UPDATE",
            entityType: "admins",
            entityId: adminId,
            details: { action: "permissions_changed", permissions }
        }).catch(e => console.error("Audit log failed", e));

        return { success: true };
    } catch (err: any) {
        return { error: err.message || "An error occurred" };
    }
}

export async function deleteAdmin(adminId: string) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(cookieStore);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: "Unauthorized" };

        const { data: adminData } = await supabase.from("admins").select("role").eq("id", user.id).single() as any;
        if (adminData?.role !== "superadmin") return { error: "Only superadmins can remove admins" };

        const adminClient = getSupabaseAdmin();

        // Delete from Auth first
        await adminClient.auth.admin.deleteUser(adminId);

        // Delete from admins table
        const { error } = await adminClient.from("admins").delete().eq("id", adminId);

        if (error) return { error: error.message };

        logAdminAction({
            actionType: "DELETE",
            entityType: "admins",
            entityId: adminId,
            details: { action: "admin_revoked" }
        }).catch(e => console.error("Audit log failed", e));

        return { success: true };
    } catch (err: any) {
        return { error: err.message || "An error occurred" };
    }
}
