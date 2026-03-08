import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/auth"];

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
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirected", "1");
        return NextResponse.redirect(loginUrl);
    }

    // Verify user exists in the admins table — if not, they're not authorized
    const { data: adminProfile, error: adminError } = await supabase
        .from("admins")
        .select("role, permissions")
        .eq("id", user.id)
        .single();

    if (adminError || !adminProfile) {
        // Valid Supabase user but not an admin — sign them out and redirect
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
