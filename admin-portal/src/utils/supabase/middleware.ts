import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/auth", "/api/webhooks"];

export async function updateSession(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Always allow public paths through
    if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
        return NextResponse.next({ request: { headers: request.headers } });
    }

    let response = NextResponse.next({ request: { headers: request.headers } });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({ request: { headers: request.headers } });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Validate session — always use getUser() not getSession() (server-side safe)
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        // Safe redirect to login
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirected", "1");
        
        // Ensure we clear any stale session cookies by returning the redirect response
        // which might have cookie-clearing headers if setAll was called
        return NextResponse.redirect(loginUrl);
    }

    // Verify user exists in the admins table — if not, they're not authorized
    const { data: adminProfile, error: adminError } = await supabase
        .from("admins")
        .select("role, permissions")
        .eq("id", user.id)
        .single();

    // Only redirect if we are SURE they are not an admin (no record found)
    // If it's a generic database error (network/timeout), let them pass through 
    // for now rather than forcing a logout, as the page components will handle 
    // their own specific data fetching errors.
    if (adminError && adminError.code === 'PGRST116') { // PGRST116 = No rows found
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("error", "not_admin");
        return NextResponse.redirect(loginUrl);
    }

    // Superadmins pass through everything
    if (adminProfile.role === "superadmin") {
        return response;
    }

    // Per-path permission check for mini_admins
    const permissions = (adminProfile.permissions ?? {}) as Record<string, boolean>;
    const PERMISSION_MAP: Record<string, string> = {
        "/colleges": "colleges",
        "/reviews": "reviews",
        "/moderation": "moderation",
        "/users": "users",
        "/analytics": "analytics",
        "/careers": "careers",
        "/audit-logs": "audit_logs",
        "/settings": "settings",
        "/articles": "articles",
        "/cutoffs": "cutoffs",
        "/rankings": "rankings",
        "/premium-locks": "premium_locks",
    };

    for (const [path, key] of Object.entries(PERMISSION_MAP)) {
        if (pathname.startsWith(path)) {
            if (!permissions[key]) {
                const deniedUrl = new URL("/denied", request.url);
                return NextResponse.redirect(deniedUrl);
            }
            break;
        }
    }

    return response;
}
