"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signOut() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error("Logout error:", error.message);
        // We still redirect to login even if there's an error signing out server-side
        // to ensure the user is at least visually logged out and can try again.
    }

    redirect("/login");
}
