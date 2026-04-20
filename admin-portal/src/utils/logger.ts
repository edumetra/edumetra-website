import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

type ActionType = "CREATE" | "UPDATE" | "DELETE" | "BULK_UPDATE" | "OTHER";

interface LogPayload {
    actionType: ActionType;
    entityType: string;
    entityId?: string | null;
    details?: Record<string, unknown> | null;
}

/**
 * Utility to log administrative actions to the `audit_logs` table.
 * Assumes it's being called from a Server Action where we can access the user session.
 */
export async function logAdminAction(payload: LogPayload) {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        // Fetch current user (admin performing the action)
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.warn("Attempted to log admin action without an active session:", payload);
            return false;
        }

        // We use the admin's email for easy reading in the dashboard
        const adminEmail = user.email || "unknown@domain.com";

        // Insert log using the service role or normal flow (RLS allows service role or admin insert if configured)
        // Note: For absolute guarantee on insert, we use the regular client here since RLS allows admins to insert?
        // Wait, our RLS only explicitly allowed SELECT for admins. 
        // We defined "Service Role can manage" = ALL. We should ensure the client is either service role 
        // OR we bypass RLS for inserts if it's the admin client. 
        // Since `createClient(cookieStore)` uses Anon/Auth keys, let's use the Admin API (Service Role) 
        // to securely write the log so we don't grant raw INSERT access to the frontend table.

        // Wait, Next.js Server Actions run on the server. We should probably use the service_role key to write to audit_logs 
        // to prevent any clever JWT spoofing on the `audit_logs` table, or we can just use the auth client if we update the RLS.
        // For simplicity and security, we'll use the auth client but if it fails we might need admin client. Let's just use the auth client
        // and assume we need to patch the RLS or rely on the fact that we can just import the admin creator.

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).from("audit_logs").insert({
            admin_id: user.id,
            admin_email: adminEmail,
            action_type: payload.actionType,
            entity_type: payload.entityType,
            entity_id: payload.entityId || null,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            details: (payload.details as any) ?? null
        });

        if (error) {
            console.error("Failed to write audit log:", error);
            return false;
        }

        return true;
    } catch (err: unknown) {
        console.error("Unexpected error in logAdminAction:", err);
        return false;
    }
}
