"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
    UserPlus, Shield, ShieldOff, Save, AlertCircle,
    Trash2, ChevronDown, ChevronUp, Check, X, Key, CheckCircle2
} from "lucide-react";
import { createAdminAccount, resetAdminPassword, updateAdminRole, updateAdminPermissions, deleteAdmin } from "@/app/actions/admin";
import { ALL_PERMISSIONS, DEFAULT_MINI_ADMIN_PERMISSIONS, type AdminPermissions, type PermissionKey } from "@/shared/permissions";

type AdminProfile = {
    id: string;
    email: string;
    role: "superadmin" | "mini_admin";
    permissions: AdminPermissions;
    created_at: string;
};

export default function AdminsSettingsPage() {
    const supabase = createClient();
    const [admins, setAdmins] = useState<AdminProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // New admin form
    const [isAdding, setIsAdding] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [newRole, setNewRole] = useState<"superadmin" | "mini_admin">("mini_admin");
    const [newPassword, setNewPassword] = useState("");
    const [newPermissions, setNewPermissions] = useState<AdminPermissions>(DEFAULT_MINI_ADMIN_PERMISSIONS);
    const [addError, setAddError] = useState<string | null>(null);
    const [actionPending, setActionPending] = useState(false);

    // Expanded permission editor per admin
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [editingPermissions, setEditingPermissions] = useState<Record<string, AdminPermissions>>({});
    const [savingId, setSavingId] = useState<string | null>(null);

    // Password reset modal
    const [resetTargetAdmin, setResetTargetAdmin] = useState<AdminProfile | null>(null);
    const [resetPasswordText, setResetPasswordText] = useState("");
    const [resetLoading, setResetLoading] = useState(false);
    const [resetError, setResetError] = useState<string | null>(null);
    const [resetSuccess, setResetSuccess] = useState(false);

    const fetchAdmins = async () => {
        setLoading(true);
        setError(null);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setCurrentUserId(user.id);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: adminData } = await supabase.from("admins").select("role").eq("id", user.id).single() as any;
        setCurrentUserRole(adminData?.role ?? null);

        const { data: adminsList, error: adminsErr } = await supabase
            .from("admins")
            .select("*")
            .order("created_at", { ascending: false });

        if (adminsErr) setError(adminsErr.message);
        else setAdmins((adminsList ?? []) as unknown as AdminProfile[]);
        setLoading(false);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchAdmins(); }, []);

    const handleRoleChange = async (id: string, role: "superadmin" | "mini_admin") => {
        const res = await updateAdminRole(id, role);
        if (res?.error) setError(res.error);
        else setAdmins((prev) => prev.map((a) => a.id === id ? { ...a, role } : a));
    };

    const handleSavePermissions = async (id: string) => {
        setSavingId(id);
        const perms = editingPermissions[id] ?? {};
        const res = await updateAdminPermissions(id, perms as any);
        if (res?.error) setError(res.error);
        else {
            setAdmins((prev) => prev.map((a) => a.id === id ? { ...a, permissions: perms } : a));
            setExpandedId(null);
        }
        setSavingId(null);
    };

    const startEditing = (admin: AdminProfile) => {
        setExpandedId(expandedId === admin.id ? null : admin.id);
        setEditingPermissions((prev) => ({
            ...prev,
            [admin.id]: { ...DEFAULT_MINI_ADMIN_PERMISSIONS, ...(admin.permissions ?? {}) },
        }));
    };

    const togglePerm = (adminId: string, key: PermissionKey) => {
        setEditingPermissions((prev) => ({
            ...prev,
            [adminId]: { ...prev[adminId], [key]: !prev[adminId]?.[key] },
        }));
    };

    const handleRemoveAdmin = async (id: string) => {
        if (!confirm("Remove this admin? They will lose all access to the portal.")) return;
        const res = await deleteAdmin(id);
        if (res?.error) setError(res.error);
        else setAdmins((prev) => prev.filter((a) => a.id !== id));
    };

    const handleFormSubmit = async (formData: FormData) => {
        setAddError(null);
        setActionPending(true);
        // Inject permissions into formData for the server action
        formData.set("permissions", JSON.stringify(newRole === "superadmin" ? {} : newPermissions));
        const res = await createAdminAccount(formData);
        setActionPending(false);
        if (res?.error) {
            setAddError(res.error);
        } else {
            setIsAdding(false);
            setNewEmail("");
            setNewPassword("");
            setNewPermissions(DEFAULT_MINI_ADMIN_PERMISSIONS);
            fetchAdmins();
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resetTargetAdmin || resetPasswordText.length < 8) return;
        setResetLoading(true);
        setResetError(null);
        setResetSuccess(false);

        const res = await resetAdminPassword(resetTargetAdmin.id, resetPasswordText);
        setResetLoading(false);

        if (res.error) setResetError(res.error);
        else {
            setResetSuccess(true);
            setTimeout(() => {
                setResetTargetAdmin(null);
                setResetSuccess(false);
                setResetPasswordText("");
            }, 2000);
        }
    };

    if (loading) return <div className="p-8 text-slate-400">Loading admins...</div>;

    if (currentUserRole !== "superadmin") {
        return (
            <div className="p-8 max-w-3xl mx-auto">
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-8 rounded-xl text-center">
                    <ShieldOff className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <h2 className="text-xl font-bold mb-2">Access Denied</h2>
                    <p>Only Superadmins can manage other administrators.</p>
                </div>
            </div>
        );
    }

    const PROTECTED_EMAIL = "globaledumetra@gmail.com";

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Admin Management</h1>
                    <p className="text-slate-400 text-sm">Create admins and configure their section-level permissions.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors shadow-lg shadow-red-900/20"
                >
                    <UserPlus className="w-4 h-4" />
                    {isAdding ? "Cancel" : "Add Admin"}
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" /> {error}
                </div>
            )}

            {/* Add admin form */}
            {isAdding && (
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mb-8">
                    <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-red-400" /> New Admin
                    </h2>
                    {addError && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" /> {addError}
                        </div>
                    )}
                    <form action={handleFormSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="admin@example.com"
                                    required
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Minimum 8 characters"
                                    required
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Role</label>
                                <select
                                    name="role"
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value as "superadmin" | "mini_admin")}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40"
                                >
                                    <option value="mini_admin">Mini Admin</option>
                                    <option value="superadmin">Superadmin</option>
                                </select>
                            </div>
                        </div>

                        {/* Permission grid — only for mini_admin */}
                        {newRole === "mini_admin" && (
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Shield className="w-3.5 h-3.5" /> Section Permissions
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {ALL_PERMISSIONS.map((perm) => {
                                        const on = !!newPermissions[perm.key];
                                        return (
                                            <button
                                                key={perm.key}
                                                type="button"
                                                onClick={() => setNewPermissions((p) => ({ ...p, [perm.key]: !on }))}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${on
                                                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                                                    : "bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300"
                                                    }`}
                                            >
                                                {on ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                                {perm.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-slate-600 mt-2">
                                    Superadmins always have full access regardless of this setting.
                                </p>
                            </div>
                        )}

                        {newRole === "superadmin" && (
                            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-xs text-purple-400">
                                ⚠️ Superadmins have unrestricted access to all sections and can manage other admins.
                            </div>
                        )}

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={actionPending}
                                className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-lg font-bold transition-colors disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {actionPending ? "Creating..." : "Create Admin"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Admins table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <table className="min-w-full divide-y divide-slate-800">
                    <thead className="bg-slate-950/50">
                        <tr>
                            <th className="px-5 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                            <th className="px-5 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                            <th className="px-5 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Permissions</th>
                            <th className="px-5 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Added</th>
                            <th className="px-5 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                        {admins.map((admin) => {
                            const isProtected = admin.email === PROTECTED_EMAIL || admin.id === currentUserId;
                            const isMini = admin.role === "mini_admin";
                            const isExpanded = expandedId === admin.id;
                            const perms = admin.permissions ?? {};

                            return (
                                <React.Fragment key={admin.id}>
                                    <tr key={admin.id} className="hover:bg-slate-800/40 transition-colors">
                                        <td className="px-5 py-4 text-sm font-medium text-slate-200">
                                            {admin.email}
                                            {admin.id === currentUserId && (
                                                <span className="ml-2 text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded font-semibold">You</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <select
                                                value={admin.role}
                                                disabled={isProtected}
                                                onChange={(e) => handleRoleChange(admin.id, e.target.value as "superadmin" | "mini_admin")}
                                                className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border focus:outline-none cursor-pointer ${isProtected ? "opacity-50 cursor-not-allowed" : ""} ${admin.role === "superadmin"
                                                    ? "bg-purple-500/10 text-purple-400 border-purple-500/25"
                                                    : "bg-slate-800 text-slate-300 border-slate-700"
                                                    }`}
                                            >
                                                <option value="superadmin">Superadmin</option>
                                                <option value="mini_admin">Mini Admin</option>
                                            </select>
                                        </td>
                                        <td className="px-5 py-4">
                                            {!isMini ? (
                                                <span className="text-xs text-purple-400 font-semibold">Full Access</span>
                                            ) : (
                                                <div className="flex flex-wrap gap-1">
                                                    {ALL_PERMISSIONS.filter((p) => perms[p.key]).map((p) => (
                                                        <span key={p.key} className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded">
                                                            {p.label}
                                                        </span>
                                                    ))}
                                                    {ALL_PERMISSIONS.filter((p) => perms[p.key]).length === 0 && (
                                                        <span className="text-xs text-slate-600">No access granted</span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-xs text-slate-500">
                                            {new Date(admin.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                {isMini && (
                                                    <button
                                                        onClick={() => startEditing(admin)}
                                                        className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                                                    >
                                                        <Shield className="w-3 h-3" />
                                                        Permissions
                                                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                    </button>
                                                )}
                                                {!isProtected && (
                                                    <>
                                                        <button
                                                            onClick={() => { setResetTargetAdmin(admin); setResetPasswordText(""); setResetError(null); setResetSuccess(false); }}
                                                            className="flex items-center gap-1 text-xs font-semibold text-amber-500 hover:text-amber-400 transition-colors"
                                                        >
                                                            <Key className="w-3 h-3" /> Reset Password
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemoveAdmin(admin.id)}
                                                            className="flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
                                                        >
                                                            <Trash2 className="w-3 h-3" /> Revoke
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                    {/* Inline permission editor */}
                                    {isExpanded && isMini && (
                                        <tr key={`${admin.id}-perms`} className="bg-slate-900/80">
                                            <td colSpan={5} className="px-5 py-4">
                                                <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                                        Edit Permissions for {admin.email}
                                                    </p>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                                                        {ALL_PERMISSIONS.map((perm) => {
                                                            const current = editingPermissions[admin.id] ?? {};
                                                            const on = !!current[perm.key];
                                                            return (
                                                                <button
                                                                    key={perm.key}
                                                                    type="button"
                                                                    onClick={() => togglePerm(admin.id, perm.key)}
                                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${on
                                                                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                                                                        : "bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300"
                                                                        }`}
                                                                >
                                                                    {on ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                                                    {perm.label}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => handleSavePermissions(admin.id)}
                                                            disabled={savingId === admin.id}
                                                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                                                        >
                                                            <Save className="w-3 h-3" />
                                                            {savingId === admin.id ? "Saving..." : "Save Permissions"}
                                                        </button>
                                                        <button
                                                            onClick={() => setExpandedId(null)}
                                                            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Security info */}
            <div className="mt-6 p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-500 space-y-1">
                <p className="font-bold text-slate-400 mb-2 flex items-center gap-2"><Shield className="w-3.5 h-3.5" /> Security Notes</p>
                <p>• Sessions are automatically invalidated when a tab is closed or after 60 minutes of inactivity.</p>
                <p>• All admin access is verified server-side on every request via Next.js middleware.</p>
                <p>• Mini Admins can only see and access sections explicitly enabled above.</p>
                <p>• The root superadmin account ({PROTECTED_EMAIL}) cannot be modified or revoked.</p>
            </div>

            {/* Password Reset Modal */}
            {resetTargetAdmin && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                            <div className="flex items-center gap-2 text-white font-bold text-lg">
                                <Key className="w-5 h-5 text-amber-500" />
                                Reset Password
                            </div>
                            <button onClick={() => setResetTargetAdmin(null)} className="text-slate-500 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleResetPassword} className="p-6 space-y-4">
                            <p className="text-sm text-slate-400">
                                Enter a new password for <span className="font-bold text-white">{resetTargetAdmin.email}</span>.
                            </p>
                            {resetError && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" /> {resetError}
                                </div>
                            )}
                            {resetSuccess ? (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-center flex flex-col items-center gap-2">
                                    <CheckCircle2 className="w-6 h-6" />
                                    <span className="font-bold disabled:opacity-50">Password updated successfully</span>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <input
                                            type="password"
                                            value={resetPasswordText}
                                            onChange={e => setResetPasswordText(e.target.value)}
                                            placeholder="New password (min 8 chars)"
                                            required
                                            minLength={8}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 pt-2">
                                        <button type="button" onClick={() => setResetTargetAdmin(null)} className="flex-1 py-2 rounded-xl text-slate-400 hover:bg-slate-800 text-sm font-semibold transition-colors">
                                            Cancel
                                        </button>
                                        <button type="submit" disabled={resetLoading || resetPasswordText.length < 8} className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                            {resetLoading ? "Saving..." : "Update"}
                                        </button>
                                    </div>
                                </>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
