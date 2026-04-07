export type PermissionKey =
    | "colleges"
    | "users"
    | "analytics"
    | "moderation"
    | "reviews"
    | "careers"
    | "audit_logs"
    | "settings"
    | "premium_locks"
    | "articles"
    | "cutoffs"
    | "rankings"
    | "counselling"
    | "news"
    | "newsletter";

export type AdminPermissions = Partial<Record<PermissionKey, boolean>>;

export const ALL_PERMISSIONS: { key: PermissionKey; label: string; description: string }[] = [
    { key: "colleges", label: "Colleges", description: "View, add, edit and delete colleges" },
    { key: "premium_locks", label: "Premium Locks", description: "Manage global and college-specific feature locks" },
    { key: "cutoffs", label: "Cutoffs Engine", description: "Manage exam cutoffs" },
    { key: "rankings", label: "Rankings", description: "Manage college rankings" },
    { key: "articles", label: "Articles", description: "Publish and edit news articles" },
    { key: "reviews", label: "Reviews", description: "View and update review moderation status" },
    { key: "moderation", label: "Moderation Queue", description: "Moderate pending reviews" },
    { key: "users", label: "Users", description: "View and ban users" },
    { key: "analytics", label: "Analytics", description: "View platform analytics" },
    { key: "careers", label: "Career Applications", description: "Manage job applications" },
    { key: "counselling", label: "Counselling Requests", description: "Manage and download counselling requests" },
    { key: "news", label: "News & Updates", description: "Create, edit, and publish news and announcements" },
    { key: "newsletter", label: "Newsletter Subscribers", description: "View and export newsletter subscriptions" },
    { key: "audit_logs", label: "Audit Logs", description: "View admin audit trail (read-only)" },
];

/** Superadmins always have all permissions */
export function hasPermission(
    role: string,
    permissions: AdminPermissions,
    key: PermissionKey
): boolean {
    if (role === "superadmin") return true;
    return !!permissions[key];
}

/** Default permissions for a new mini_admin — all off */
export const DEFAULT_MINI_ADMIN_PERMISSIONS: AdminPermissions = {
    colleges: false,
    users: false,
    analytics: false,
    moderation: false,
    reviews: false,
    careers: false,
    audit_logs: false,
    premium_locks: false,
    articles: false,
    cutoffs: false,
    rankings: false,
    counselling: false,
    newsletter: false,
};
