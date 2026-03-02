"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

// This requires SUPABASE_SERVICE_ROLE_KEY to be set in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const getSupabaseAdmin = () => {
    if (!supabaseServiceKey) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set in environment variables");
    }
    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
};

export async function createAdminAccount(formData: FormData) {
    try {
        const email = formData.get("email")?.toString();
        const password = formData.get("password")?.toString();
        const role = formData.get("role")?.toString() as "superadmin" | "mini_admin";

        if (!email || !password || !role) {
            return { error: "Missing required fields" };
        }

        // Verify current user is a superadmin using standard client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const cookieStore = await cookies();
        const authClient = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                persistSession: true,
            },
            global: {
                headers: {
                    cookie: cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ')
                }
            }
        });

        const { data: { user } } = await authClient.auth.getUser();
        if (!user) return { error: "Unauthorized" };

        const { data: adminData } = await authClient
            .from("admins")
            .select("role")
            .eq("id", user.id)
            .single();

        if (adminData?.role !== "superadmin") {
            return { error: "Only superadmins can create new admins" };
        }

        // Now use service role to create/get Auth User
        const adminClient = getSupabaseAdmin();

        // Try creating the user first
        let userId: string;
        const { data: { user: newUser }, error: createError } = await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        });

        if (createError) {
            // If user exists, fetch them by email instead
            if (createError.message.includes("already exist")) {
                const { data: users, error: listError } = await adminClient.auth.admin.listUsers();
                if (listError) return { error: "Could not list users: " + listError.message };

                const existingUser = users.users.find(u => u.email === email);
                if (!existingUser) {
                    return { error: "User already exists but could not find by email" };
                }
                userId = existingUser.id;
            } else {
                return { error: createError.message };
            }
        } else if (newUser) {
            userId = newUser.id;
        } else {
            return { error: "Failed to create or find user." };
        }

        // We have the UUID, now insert into the 'admins' table
        const { error: insertError } = await adminClient
            .from("admins")
            .insert({
                id: userId,
                email,
                role,
            });

        // Supabase returns an error code if the key already exists (they are an admin)
        if (insertError && insertError.code === "23505") {
            return { error: "This user is already an admin" };
        } else if (insertError) {
            return { error: "Error adding admin to table: " + insertError.message };
        }

        revalidatePath("/settings/admins");
        return { success: true };
    } catch (err: any) {
        return { error: err.message || "An unexpected error occurred" };
    }
}
