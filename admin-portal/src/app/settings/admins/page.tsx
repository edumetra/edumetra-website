"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { UserPlus, Shield, ShieldOff, Save, Key, AlertCircle } from "lucide-react";
import { createAdminAccount } from "@/app/actions/admin";

type AdminProfile = {
    id: string;
    email: string;
    role: "superadmin" | "mini_admin";
    created_at: string;
};

export default function AdminsSettingsPage() {
    const supabase = createClient();
    const [admins, setAdmins] = useState<AdminProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // New admin form
    const [isAdding, setIsAdding] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [newRole, setNewRole] = useState<"superadmin" | "mini_admin">("mini_admin");
    const [newPassword, setNewPassword] = useState("");
    const [addError, setAddError] = useState<string | null>(null);
    const [actionPending, setActionPending] = useState(false);

    const fetchAdmins = async () => {
        setLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get current user's role
        const { data: adminData } = await supabase.from('admins').select('role').eq('id', user.id).single() as any;
        setCurrentUserRole(adminData?.role || null);

        // Fetch all admins
        const { data: adminsList, error: adminsErr } = await supabase
            .from("admins")
            .select("*")
            .order("created_at", { ascending: false });

        if (adminsErr) {
            setError(adminsErr.message);
        } else {
            setAdmins(adminsList || []);
        }

        setLoading(false);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchAdmins(); }, []);

    const handleRoleChange = async (id: string, role: "superadmin" | "mini_admin") => {
        const { error } = await supabase
            .from("admins")
            .update({ role } as never)
            .eq("id", id);

        if (error) {
            setError(error.message);
        } else {
            setAdmins(prev => prev.map(a => a.id === id ? { ...a, role } : a));
        }
    };

    const handleRemoveAdmin = async (id: string) => {
        if (!confirm("Are you sure you want to remove this admin? They will lose access to the portal.")) return;

        const { error } = await supabase
            .from("admins")
            .delete()
            .eq("id", id);

        if (error) {
            setError(error.message);
        } else {
            setAdmins(prev => prev.filter(a => a.id !== id));
        }
    };

    const handleFormSubmit = async (formData: FormData) => {
        setAddError(null);
        setActionPending(true);
        const res = await createAdminAccount(formData);
        setActionPending(false);
        if (res?.error) {
            setAddError(res.error);
        } else {
            // success
            setIsAdding(false);
            setNewEmail("");
            setNewPassword("");
            fetchAdmins();
        }
    };

    if (loading) {
        return <div className="p-6 md:p-8 text-slate-400">Loading admins...</div>;
    }

    if (currentUserRole !== "superadmin") {
        return (
            <div className="p-6 md:p-8 max-w-7xl mx-auto">
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-xl text-center">
                    <ShieldOff className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <h2 className="text-xl font-bold mb-2">Access Denied</h2>
                    <p>Only Superadmins can view and manage other administrators.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Admin Management</h1>
                    <p className="text-slate-400 text-sm">Manage dashboard access and enforce role-based permissions.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition-colors"
                >
                    <UserPlus className="w-4 h-4" />
                    {isAdding ? "Cancel" : "Add Admin"}
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <div>{error}</div>
                </div>
            )}

            {isAdding && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
                    <h2 className="text-lg font-bold text-white mb-4">Add a New Admin</h2>
                    {addError && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <div>{addError}</div>
                        </div>
                    )}
                    <form action={handleFormSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="admin@example.com"
                                    required
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Secure password"
                                    required
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                                <select
                                    name="role"
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value as "superadmin" | "mini_admin")}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                >
                                    <option value="mini_admin">Mini Admin</option>
                                    <option value="superadmin">Superadmin</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={actionPending}
                                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {actionPending ? "Adding..." : "Save Admin"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <table className="min-w-full divide-y divide-slate-800">
                    <thead className="bg-slate-950/50">
                        <tr>
                            <th className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                            <th className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</th>
                            <th className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Added</th>
                            <th className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                        {admins.map(admin => (
                            <tr key={admin.id} className="hover:bg-slate-800/40 transition-colors">
                                <td className="px-5 py-4 text-sm font-medium text-slate-200">
                                    {admin.email}
                                </td>
                                <td className="px-5 py-4">
                                    <select
                                        value={admin.role}
                                        onChange={e => handleRoleChange(admin.id, e.target.value as "superadmin" | "mini_admin")}
                                        disabled={admin.email === 'globaledumetra@gmail.com'}
                                        className={`text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500/50 border ${admin.email === 'globaledumetra@gmail.com' ? 'opacity-50 cursor-not-allowed ' : 'cursor-pointer '}${admin.role === 'superadmin'
                                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            }`}
                                    >
                                        <option value="superadmin">Superadmin</option>
                                        <option value="mini_admin">Mini Admin</option>
                                    </select>
                                </td>
                                <td className="px-5 py-4 text-xs text-slate-500">
                                    {new Date(admin.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-5 py-4">
                                    {admin.email !== 'globaledumetra@gmail.com' && (
                                        <button
                                            onClick={() => handleRemoveAdmin(admin.id)}
                                            className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
                                        >
                                            Revoke Access
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
