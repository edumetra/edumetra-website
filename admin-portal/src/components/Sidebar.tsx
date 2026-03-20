"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { signOut } from "@/app/actions/auth";
import type { AdminPermissions, PermissionKey } from "@/shared/permissions";
import {
    LayoutDashboard,
    Users,
    BarChart2,
    BookOpen,
    Shield,
    ListOrdered,
    FileText,
    Briefcase,
    UserCog,
    ScrollText,
    LogOut,
    ExternalLink,
    GraduationCap,
    Plus,
    Lock,
} from "lucide-react";

type NavItem = {
    href: string;
    label: string;
    icon: React.ElementType;
    permKey?: PermissionKey;
};

const CONTENT_NAV: NavItem[] = [
    { href: "/reviews", label: "Reviews", icon: BookOpen, permKey: "reviews" },
    { href: "/cutoffs", label: "Cutoffs Engine", icon: ListOrdered, permKey: "cutoffs" },
    { href: "/rankings", label: "Rankings", icon: BarChart2, permKey: "rankings" },
    { href: "/articles", label: "Articles", icon: FileText, permKey: "articles" },
    { href: "/moderation", label: "Moderation", icon: Shield, permKey: "moderation" },
    { href: "/careers", label: "Career Applications", icon: Briefcase, permKey: "careers" },
];

const COLLEGES_NAV: NavItem = { href: "/colleges", label: "Colleges", icon: GraduationCap, permKey: "colleges" };

const SUPERADMIN_NAV: NavItem[] = [
    { href: "/users", label: "Users", icon: Users, permKey: "users" },
    { href: "/settings/admins", label: "Manage Admins", icon: UserCog, permKey: "settings" },
    { href: "/analytics", label: "Analytics", icon: BarChart2, permKey: "analytics" },
    { href: "/audit-logs", label: "Audit Logs", icon: ScrollText, permKey: "audit_logs" },
];

function NavLink({ href, label, icon: Icon }: NavItem) {
    const pathname = usePathname();
    const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-all ${isActive
                ? "bg-red-600/15 text-red-400 border border-red-500/20"
                : "text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent"
                }`}
        >
            <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-red-400" : "text-slate-500"}`} />
            {label}
        </Link>
    );
}

function canSee(role: string, permissions: AdminPermissions, key?: PermissionKey): boolean {
    if (role === "superadmin") return true;
    if (!key) return true; // no permission key = always visible
    return !!permissions[key];
}

export function Sidebar({
    userRole,
    userEmail,
    permissions = {},
}: {
    userRole: string;
    userEmail?: string;
    permissions?: AdminPermissions;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const isDashboard = pathname === "/";

    const handleLogout = async () => {
        await signOut();
    };

    const isSuperadmin = userRole === "superadmin";

    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0 hidden md:flex flex-col">
            {/* Brand */}
            <div className="p-5 border-b border-slate-800">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                        <img src="/logo.jpeg" alt="Edumetra Logo" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-300">
                        Edumetra
                    </h1>
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Admin</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold tracking-widest border ${isSuperadmin
                        ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}>
                        {userRole}
                    </span>
                </div>
                {userEmail && (
                    <p className="text-xs text-slate-600 mt-1 truncate">{userEmail}</p>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-3">

                {/* ===== PRIMARY: COLLEGES ===== */}
                {canSee(userRole, permissions, "colleges") && (
                    <div className="px-3 pb-2">
                        <div className="px-2 pb-1 text-[10px] uppercase tracking-widest text-slate-600 font-bold">Core</div>
                        <NavLink {...COLLEGES_NAV} />
                        <Link
                            href="/colleges/new"
                            className="flex items-center gap-3 px-4 py-2 mx-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-600/10 hover:text-red-300 border border-transparent hover:border-red-500/20 transition-all"
                        >
                            <Plus className="w-3.5 h-3.5 shrink-0" />
                            Add College
                        </Link>
                        {canSee(userRole, permissions, "premium_locks") && (
                            <NavLink
                                href="/premium-locks"
                                label="Premium Locks"
                                icon={Lock}
                                permKey="premium_locks"
                            />
                        )}
                    </div>
                )}

                <div className="mx-3 my-1 border-t border-slate-800" />

                {/* Dashboard */}
                <div className="px-2 pt-2">
                    <Link
                        href="/"
                        className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-all ${isDashboard
                            ? "bg-red-600/15 text-red-400 border border-red-500/20"
                            : "text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent"
                            }`}
                    >
                        <LayoutDashboard className={`w-4 h-4 shrink-0 ${isDashboard ? "text-red-400" : "text-slate-500"}`} />
                        Dashboard
                    </Link>
                </div>

                {/* System Management (superadmin or those with specific permissions) */}
                {SUPERADMIN_NAV.some((item) => canSee(userRole, permissions, item.permKey)) && (
                    <>
                        <div className="px-4 pt-4 pb-1.5 text-[10px] uppercase tracking-widest text-slate-600 font-bold">
                            System Management
                        </div>
                        {SUPERADMIN_NAV.filter((item) => canSee(userRole, permissions, item.permKey)).map((item) => (
                            <NavLink key={item.href} {...item} />
                        ))}
                    </>
                )}

                {/* Content section */}
                {CONTENT_NAV.some((item) => canSee(userRole, permissions, item.permKey)) && (
                    <>
                        <div className="px-4 pt-4 pb-1.5 text-[10px] uppercase tracking-widest text-slate-600 font-bold">
                            Content Management
                        </div>
                        {CONTENT_NAV.filter((item) => canSee(userRole, permissions, item.permKey)).map((item) => (
                            <NavLink key={item.href} {...item} />
                        ))}
                    </>
                )}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-slate-800 space-y-2">
                <a
                    href="http://localhost:5173"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors border border-slate-700"
                >
                    <ExternalLink className="w-4 h-4" />
                    Public Website
                </a>
                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center w-full gap-2 px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded-lg text-sm transition-colors border border-red-900/30"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
