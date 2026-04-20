"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/shared/types/database.types";
import {
    Plus, Search, Ticket, Trash2,
    Calendar, Percent, ExternalLink,
    X, CheckCircle, Loader2,
    Settings, Tag,
} from "lucide-react";
import { toast } from "react-hot-toast";

type Coupon = Database["public"]["Tables"]["coupons"]["Row"];

function fmt(d: string | null) {
    if (!d) return "Never";
    const date = new Date(d);
    if (isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const INITIAL_FORM = {
    code: "",
    discount_percentage: "10",
    razorpay_offer_id: "",
    max_uses: "",
    expires_at: "",
    is_active: true,
};

export default function CouponsPage() {
    // Stabilise the supabase client — createClient() must NOT be called on every render
    // or it will create a new object reference each time, triggering infinite re-renders
    // through the useCallback dependency below.
    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM);

    // supabase is now stable (same ref), so this callback is only created once
    const fetchCoupons = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("coupons")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            toast.error("Failed to load coupons");
        } else {
            setCoupons(data || []);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchCoupons();
    }, [fetchCoupons]);

    const handleOpenModal = (coupon?: Coupon) => {
        if (coupon) {
            setEditingCoupon(coupon);
            setFormData({
                code: coupon.code,
                discount_percentage: coupon.discount_percentage.toString(),
                razorpay_offer_id: coupon.razorpay_offer_id || "",
                max_uses: coupon.max_uses?.toString() || "",
                expires_at: coupon.expires_at
                    ? new Date(coupon.expires_at).toISOString().split("T")[0]
                    : "",
                is_active: coupon.is_active,
            });
        } else {
            setEditingCoupon(null);
            setFormData(INITIAL_FORM);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCoupon(null);
        setFormData(INITIAL_FORM);
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from("coupons")
            .update({ is_active: !currentStatus })
            .eq("id", id);

        if (error) {
            toast.error("Failed to update status");
        } else {
            setCoupons((prev) =>
                prev.map((c) => (c.id === id ? { ...c, is_active: !currentStatus } : c))
            );
            toast.success(`Coupon ${!currentStatus ? "activated" : "deactivated"}`);
        }
    };

    const handleDelete = async (id: string, code: string) => {
        if (!confirm(`Are you sure you want to delete coupon "${code}"?`)) return;

        const { error } = await supabase.from("coupons").delete().eq("id", id);

        if (error) {
            toast.error("Failed to delete coupon");
        } else {
            setCoupons((prev) => prev.filter((c) => c.id !== id));
            toast.success("Coupon deleted");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        const discountValue = parseFloat(formData.discount_percentage);

        // Validate discount: must be a real number between 1 and 100
        if (isNaN(discountValue) || discountValue <= 0 || discountValue > 100) {
            toast.error("Discount must be between 1 and 100");
            setFormLoading(false);
            return;
        }

        const maxUsesValue = formData.max_uses ? parseInt(formData.max_uses, 10) : null;
        if (maxUsesValue !== null && (isNaN(maxUsesValue) || maxUsesValue < 1)) {
            toast.error("Max uses must be a positive number");
            setFormLoading(false);
            return;
        }

        const payload = {
            code: formData.code.toUpperCase().trim(),
            discount_percentage: discountValue,
            razorpay_offer_id: formData.razorpay_offer_id?.trim() || null,
            max_uses: maxUsesValue,
            expires_at: formData.expires_at
                ? new Date(formData.expires_at).toISOString()
                : null,
            is_active: formData.is_active,
        };

        let error;
        if (editingCoupon) {
            const { error: err } = await supabase
                .from("coupons")
                .update(payload)
                .eq("id", editingCoupon.id);
            error = err;
        } else {
            const { error: err } = await supabase.from("coupons").insert([payload]);
            error = err;
        }

        if (error) {
            toast.error(error.message || "Failed to save coupon");
        } else {
            toast.success(`Coupon ${editingCoupon ? "updated" : "created"} successfully`);
            handleCloseModal();
            fetchCoupons();
        }
        setFormLoading(false);
    };

    const displayedCoupons = useMemo(
        () =>
            coupons.filter(
                (c) =>
                    c.code.toLowerCase().includes(search.toLowerCase()) ||
                    c.razorpay_offer_id?.toLowerCase().includes(search.toLowerCase())
            ),
        [coupons, search]
    );

    const stats = useMemo(
        () => ({
            total: coupons.length,
            active: coupons.filter((c) => c.is_active).length,
            used: coupons.reduce((acc, c) => acc + (c.used_count || 0), 0),
        }),
        [coupons]
    );

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                        <Ticket className="w-8 h-8 text-red-500" />
                        Coupons
                    </h1>
                    <p className="text-slate-400 text-sm">
                        Create and manage discount codes for subscription plans.
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl hover:bg-red-500 transition-all font-semibold shadow-lg shadow-red-900/20 active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Create Coupon
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[
                    { label: "Total Coupons", value: stats.total, icon: Tag, color: "text-blue-400", bg: "bg-blue-500/10" },
                    { label: "Active Now", value: stats.active, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                    { label: "Total Uses", value: stats.used, icon: ExternalLink, color: "text-purple-400", bg: "bg-purple-500/10" },
                ].map((s, i) => (
                    <div key={i} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                        <div className="flex items-center justify-between mb-2">
                            <div className={`p-2 rounded-lg ${s.bg}`}>
                                <s.icon className={`w-5 h-5 ${s.color}`} />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-white">{s.value}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by code or Razorpay Offer ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-all"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-800">
                        <thead className="bg-slate-950/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Code</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Discount</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Razorpay ID</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Usage</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Expires</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {loading ? (
                                [...Array(3)].map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={7} className="px-6 py-8">
                                            <div className="h-4 bg-slate-800 rounded animate-pulse w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : displayedCoupons.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <Ticket className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                                        <p className="text-slate-400 font-bold">No coupons found</p>
                                        <p className="text-slate-600 text-sm">Try creating one or adjusting your search.</p>
                                    </td>
                                </tr>
                            ) : (
                                displayedCoupons.map((coupon) => (
                                    <tr key={coupon.id} className="hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono font-black text-red-500 bg-red-500/10 px-2 py-1 rounded text-sm">
                                                {coupon.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="flex items-center gap-1 font-bold text-white text-sm">
                                                <Percent className="w-3.5 h-3.5 text-blue-400" />
                                                {coupon.discount_percentage}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {coupon.razorpay_offer_id ? (
                                                <span className="text-xs font-medium text-slate-400 font-mono tracking-tight">
                                                    {coupon.razorpay_offer_id}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-600 italic">No link</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleToggleStatus(coupon.id, coupon.is_active)}
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${
                                                    coupon.is_active
                                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                        : "bg-slate-800 text-slate-500 border-slate-700"
                                                }`}
                                            >
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full ${
                                                        coupon.is_active ? "bg-emerald-400" : "bg-slate-600"
                                                    }`}
                                                />
                                                {coupon.is_active ? "Active" : "Inactive"}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs text-slate-300 font-bold">
                                                {coupon.used_count}
                                                <span className="text-slate-600 font-normal"> / {coupon.max_uses ?? "∞"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                <Calendar className="w-3 h-3" />
                                                {fmt(coupon.expires_at)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(coupon)}
                                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    <Settings className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(coupon.id, coupon.code)}
                                                    className="p-2 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">
                                {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 text-slate-500 hover:text-white transition-colors"
                                aria-label="Close modal"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Coupon Code */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                    Coupon Code
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.code}
                                    onChange={(e) =>
                                        setFormData({ ...formData, code: e.target.value.toUpperCase() })
                                    }
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/40 uppercase font-mono"
                                    placeholder="SAVE10"
                                />
                            </div>

                            {/* Discount % and Max Uses */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                        Discount %
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            required
                                            step="0.01"
                                            min="1"
                                            max="100"
                                            value={formData.discount_percentage}
                                            onChange={(e) =>
                                                setFormData({ ...formData, discount_percentage: e.target.value })
                                            }
                                            className="w-full pl-4 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/40"
                                        />
                                        <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                        Max Uses
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.max_uses}
                                        onChange={(e) =>
                                            setFormData({ ...formData, max_uses: e.target.value })
                                        }
                                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                                        placeholder="Unlimited"
                                    />
                                </div>
                            </div>

                            {/* Razorpay Offer ID */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                    Razorpay Offer ID{" "}
                                    <span className="normal-case font-normal text-slate-600">(Optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.razorpay_offer_id}
                                    onChange={(e) =>
                                        setFormData({ ...formData, razorpay_offer_id: e.target.value })
                                    }
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-700 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40"
                                    placeholder="offer_J8f9f8f9f8f9f8"
                                />
                                <p className="mt-1.5 text-[10px] text-slate-500 leading-relaxed italic">
                                    Linking a Razorpay Offer allows native subscription discounts.
                                </p>
                            </div>

                            {/* Expiry Date */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                    Expiry Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.expires_at}
                                    onChange={(e) =>
                                        setFormData({ ...formData, expires_at: e.target.value })
                                    }
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/40"
                                />
                            </div>

                            {/* Active Status Toggle */}
                            <div className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
                                <div>
                                    <p className="text-sm font-bold text-white">Active Status</p>
                                    <p className="text-xs text-slate-500">Should this coupon be redeemable immediately?</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setFormData({ ...formData, is_active: !formData.is_active })
                                    }
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                        formData.is_active ? "bg-emerald-600" : "bg-slate-700"
                                    }`}
                                    role="switch"
                                    aria-checked={formData.is_active}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            formData.is_active ? "translate-x-6" : "translate-x-1"
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 py-3 text-sm font-bold text-slate-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="flex-[2] py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-900/40 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                                >
                                    {formLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : editingCoupon ? (
                                        "Update Coupon"
                                    ) : (
                                        "Launch Coupon"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
