"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import {
    Plus, Search, GraduationCap, Building2,
    Star, Award, IndianRupee, Eye, Edit2, Trash2,
    ChevronDown, CheckCheck, EyeOff, ArrowUpDown,
    LayoutGrid, List, Upload,
} from "lucide-react";
import BulkUploadModal from "@/features/colleges/components/BulkUploadModal";
import { deleteColleges } from "@/app/actions/colleges";

type Visibility = "public" | "draft" | "hidden";
type SortKey = "name" | "rank" | "rating" | "created_at";
type CollegeType = "all" | "Private" | "Public/Government" | "Deemed";

type College = {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    location_city: string | null;
    location_state: string | null;
    type: string | null;
    visibility: Visibility | null;
    rank: number | null;
    rating: number | null;
    fees: string | null;
    review_count: number | null;
    created_at: string;
};

const VIS_CONFIG: Record<Visibility, { label: string; dot: string; badge: string; bg: string }> = {
    public: { label: "Public", dot: "bg-emerald-400", badge: "text-emerald-400 border-emerald-500/25 bg-emerald-500/10", bg: "bg-emerald-500/10" },
    draft: { label: "Draft", dot: "bg-amber-400", badge: "text-amber-400 border-amber-500/25 bg-amber-500/10", bg: "bg-amber-500/10" },
    hidden: { label: "Hidden", dot: "bg-slate-500", badge: "text-slate-400 border-slate-600/50 bg-slate-700/50", bg: "bg-slate-800" },
};

function VisibilityBadge({ collegeId, visibility, onChange }: { collegeId: string; visibility: Visibility; onChange: (id: string, v: Visibility) => void }) {
    const [open, setOpen] = useState(false);
    const cfg = VIS_CONFIG[visibility] ?? VIS_CONFIG.draft;
    return (
        <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
                onClick={() => setOpen((o) => !o)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${cfg.badge}`}
            >
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
                <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute left-0 mt-1 w-32 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-20 overflow-hidden">
                        {(["public", "draft", "hidden"] as Visibility[]).map((v) => {
                            const c = VIS_CONFIG[v];
                            return (
                                <button
                                    key={v}
                                    onClick={() => { onChange(collegeId, v); setOpen(false); }}
                                    className={`flex items-center gap-2 w-full px-3 py-2.5 text-xs font-semibold hover:bg-slate-700/70 transition-colors text-left ${c.badge} border-0 rounded-none bg-transparent ${v === visibility ? "bg-slate-700/40" : ""}`}
                                >
                                    <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                                    {c.label}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

export default function CollegesPage() {
    const supabase = createClient();
    const [colleges, setColleges] = useState<College[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [visFilter, setVisFilter] = useState<Visibility | "all">("all");
    const [typeFilter, setTypeFilter] = useState<CollegeType>("all");
    const [sortKey, setSortKey] = useState<SortKey>("created_at");
    const [sortAsc, setSortAsc] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [bulkLoading, setBulkLoading] = useState(false);
    const [view, setView] = useState<"table" | "grid">("table");
    const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

    const fetch = useCallback(async () => {
        setLoading(true);
        const { data } = await supabase
            .from("colleges")
            .select("id, name, slug, image, location_city, location_state, type, visibility, rank, rating, fees, review_count, created_at")
            .order("created_at", { ascending: false });
        setColleges((data ?? []) as College[]);
        setLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    const handleVisibilityChange = async (id: string, vis: Visibility) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("colleges") as any).update({ visibility: vis, is_published: vis === "public" }).eq("id", id);
        setColleges((prev) => prev.map((c) => c.id === id ? { ...c, visibility: vis } : c));
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
        const res = await deleteColleges([id]);
        if (res?.error) {
            alert(res.error);
            return;
        }
        setColleges((prev) => prev.filter((c) => c.id !== id));
        setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
    };

    const handleBulkVisibility = async (vis: Visibility) => {
        if (selected.size === 0) return;
        setBulkLoading(true);
        const ids = [...selected];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("colleges") as any).update({ visibility: vis, is_published: vis === "public" }).in("id", ids);
        setColleges((prev) => prev.map((c) => ids.includes(c.id) ? { ...c, visibility: vis } : c));
        setSelected(new Set());
        setBulkLoading(false);
    };

    const handleBulkDelete = async () => {
        if (selected.size === 0) return;
        if (!confirm(`Delete ${selected.size} college(s)? This cannot be undone.`)) return;
        setBulkLoading(true);
        const ids = [...selected];
        const res = await deleteColleges(ids);
        if (res?.error) {
            alert(res.error);
        } else {
            setColleges((prev) => prev.filter((c) => !ids.includes(c.id)));
            setSelected(new Set());
        }
        setBulkLoading(false);
    };

    const toggleSelect = (id: string) => {
        setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    };
    const toggleAll = () => {
        if (selected.size === displayed.length) setSelected(new Set());
        else setSelected(new Set(displayed.map((c) => c.id)));
    };

    const cycleSort = (key: SortKey) => {
        if (sortKey === key) setSortAsc((a) => !a);
        else { setSortKey(key); setSortAsc(true); }
    };

    const displayed = useMemo(() => {
        let list = colleges.filter((c) => {
            const q = search.toLowerCase();
            const matchSearch = !q || c.name?.toLowerCase().includes(q) || c.location_city?.toLowerCase().includes(q) || c.location_state?.toLowerCase().includes(q);
            const matchVis = visFilter === "all" || (c.visibility ?? "draft") === visFilter;
            const matchType = typeFilter === "all" || c.type === typeFilter;
            return matchSearch && matchVis && matchType;
        });
        list = [...list].sort((a, b) => {
            let va: string | number | null = null, vb: string | number | null = null;
            if (sortKey === "name") { va = a.name ?? ""; vb = b.name ?? ""; }
            else if (sortKey === "rank") { va = a.rank ?? 99999; vb = b.rank ?? 99999; }
            else if (sortKey === "rating") { va = a.rating ?? 0; vb = b.rating ?? 0; }
            else { va = a.created_at; vb = b.created_at; }
            if (va === null) return 1;
            if (vb === null) return -1;
            return sortAsc ? (va < vb ? -1 : 1) : (va > vb ? -1 : 1);
        });
        return list;
    }, [colleges, search, visFilter, typeFilter, sortKey, sortAsc]);

    const counts = {
        all: colleges.length,
        public: colleges.filter((c) => c.visibility === "public").length,
        draft: colleges.filter((c) => !c.visibility || c.visibility === "draft").length,
        hidden: colleges.filter((c) => c.visibility === "hidden").length,
    };

    const SortButton = ({ colKey, label }: { colKey: SortKey; label: string }) => (
        <button onClick={() => cycleSort(colKey)} className="flex items-center gap-1 group">
            {label}
            <ArrowUpDown className={`w-3 h-3 ${sortKey === colKey ? "text-red-400" : "text-slate-600 group-hover:text-slate-400"}`} />
        </button>
    );

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Colleges</h1>
                    <p className="text-slate-400 text-sm">Add, edit, and manage all institutions on the platform.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => setIsBulkUploadOpen(true)}
                        className="flex items-center gap-2 bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white px-5 py-2.5 rounded-lg transition-all font-semibold shadow-lg shrink-0"
                    >
                        <Upload className="w-4 h-4" />
                        Bulk Upload
                    </button>
                    <Link
                        href="/colleges/new"
                        className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-500 transition-all font-semibold shadow-lg shadow-red-900/20 shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        Add College
                    </Link>
                </div>
            </div>

            {/* Stat cards / vis filter */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {([
                    { key: "all", label: "Total", color: "text-white", bg: "bg-slate-800 border-slate-700" },
                    { key: "public", label: "Public", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
                    { key: "draft", label: "Draft", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
                    { key: "hidden", label: "Hidden", color: "text-slate-400", bg: "bg-slate-800 border-slate-700" },
                ] as const).map((s) => (
                    <button
                        key={s.key}
                        onClick={() => setVisFilter(s.key as Visibility | "all")}
                        className={`p-4 rounded-xl border text-left transition-all ${s.bg} ${visFilter === s.key ? "ring-2 ring-red-500/40" : "hover:opacity-80"}`}
                    >
                        <div className={`text-2xl font-bold ${s.color}`}>{counts[s.key]}</div>
                        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">{s.label}</div>
                    </button>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-3 mb-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by name, city, or state…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                    />
                </div>

                {/* Type filter */}
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as CollegeType)}
                    className="bg-slate-900 border border-slate-700 text-sm text-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                >
                    <option value="all">All Types</option>
                    <option value="Private">Private</option>
                    <option value="Public/Government">Government</option>
                    <option value="Deemed">Deemed</option>
                </select>

                {/* View toggle */}
                <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-1">
                    <button
                        onClick={() => setView("table")}
                        className={`p-1.5 rounded-md transition-all ${view === "table" ? "bg-red-600 text-white" : "text-slate-400 hover:text-white"}`}
                        title="Table view"
                    >
                        <List className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setView("grid")}
                        className={`p-1.5 rounded-md transition-all ${view === "grid" ? "bg-red-600 text-white" : "text-slate-400 hover:text-white"}`}
                        title="Grid view"
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Bulk action bar */}
            {selected.size > 0 && (
                <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 mb-4">
                    <span className="text-sm font-semibold text-slate-300">{selected.size} selected</span>
                    <div className="flex items-center gap-2 ml-auto">
                        <button
                            onClick={() => handleBulkVisibility("public")}
                            disabled={bulkLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <Eye className="w-3 h-3" /> Bulk Publish
                        </button>
                        <button
                            onClick={() => handleBulkVisibility("draft")}
                            disabled={bulkLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <EyeOff className="w-3 h-3" /> Bulk Unpublish
                        </button>
                        <button
                            onClick={handleBulkDelete}
                            disabled={bulkLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <Trash2 className="w-3 h-3" /> Delete
                        </button>
                        <button
                            onClick={() => setSelected(new Set())}
                            className="text-xs text-slate-500 hover:text-slate-300 transition-colors ml-1"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}

            {/* TABLE VIEW */}
            {view === "table" && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-800">
                            <thead className="bg-slate-950/50">
                                <tr>
                                    <th className="px-4 py-3.5 w-10">
                                        <input
                                            type="checkbox"
                                            checked={displayed.length > 0 && selected.size === displayed.length}
                                            onChange={toggleAll}
                                            className="accent-red-500 w-4 h-4 cursor-pointer"
                                        />
                                    </th>
                                    <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        <SortButton colKey="name" label="College" />
                                    </th>
                                    <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">Type</th>
                                    <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                                        <SortButton colKey="rank" label="Rank" />
                                    </th>
                                    <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                                        <SortButton colKey="rating" label="Rating" />
                                    </th>
                                    <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider hidden xl:table-cell">Fees</th>
                                    <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i}>
                                            <td colSpan={8} className="px-4 py-4">
                                                <div className="h-8 bg-slate-800 rounded-lg animate-pulse" />
                                            </td>
                                        </tr>
                                    ))
                                ) : displayed.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-16 text-center">
                                            <GraduationCap className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                                            <p className="text-slate-400 font-semibold text-lg">No colleges found</p>
                                            <p className="text-slate-600 text-sm mt-1 mb-5">
                                                {search || visFilter !== "all" || typeFilter !== "all"
                                                    ? "Try adjusting your search or filters."
                                                    : "Add your first college to get started."}
                                            </p>
                                            {!search && visFilter === "all" && typeFilter === "all" && (
                                                <Link href="/colleges/new" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all">
                                                    <Plus className="w-4 h-4" /> Add First College
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ) : displayed.map((college) => {
                                    const vis = (college.visibility ?? "draft") as Visibility;
                                    const isChecked = selected.has(college.id);
                                    return (
                                        <tr key={college.id} className={`hover:bg-slate-800/40 transition-colors group ${isChecked ? "bg-red-900/10" : ""}`}>
                                            {/* Checkbox */}
                                            <td className="px-4 py-3.5">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => toggleSelect(college.id)}
                                                    className="accent-red-500 w-4 h-4 cursor-pointer"
                                                />
                                            </td>
                                            {/* College name + location */}
                                            <td className="px-4 py-3.5">
                                                <Link href={`/colleges/${college.id}`} className="flex items-center gap-3 group/inner">
                                                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                                                        {college.image ? (
                                                            <img src={college.image} alt={college.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Building2 className="w-4 h-4 text-slate-600" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-slate-200 group-hover/inner:text-red-400 transition-colors max-w-[200px] truncate">
                                                            {college.name}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            {[college.location_city, college.location_state].filter(Boolean).join(", ") || "—"}
                                                        </div>
                                                    </div>
                                                </Link>
                                            </td>
                                            {/* Type */}
                                            <td className="px-4 py-3.5 hidden md:table-cell">
                                                <span className="px-2 py-1 text-xs font-semibold rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                                                    {college.type ?? "—"}
                                                </span>
                                            </td>
                                            {/* Visibility */}
                                            <td className="px-4 py-3.5">
                                                <VisibilityBadge
                                                    collegeId={college.id}
                                                    visibility={vis}
                                                    onChange={handleVisibilityChange}
                                                />
                                            </td>
                                            {/* Rank */}
                                            <td className="px-4 py-3.5 hidden lg:table-cell">
                                                {college.rank ? (
                                                    <span className="flex items-center gap-1 text-sm font-bold text-slate-300">
                                                        <Award className="w-3.5 h-3.5 text-amber-400" />
                                                        #{college.rank}
                                                    </span>
                                                ) : <span className="text-slate-600 text-sm">—</span>}
                                            </td>
                                            {/* Rating */}
                                            <td className="px-4 py-3.5 hidden lg:table-cell">
                                                {college.rating ? (
                                                    <span className="flex items-center gap-1 text-sm font-bold text-slate-300">
                                                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                                        {college.rating}
                                                    </span>
                                                ) : <span className="text-slate-600 text-sm">—</span>}
                                            </td>
                                            {/* Fees */}
                                            <td className="px-4 py-3.5 hidden xl:table-cell text-sm text-slate-400">
                                                {college.fees ? (
                                                    <div className="flex items-center gap-1.5 min-w-[120px]">
                                                        <IndianRupee className="w-3 h-3 text-slate-600" />
                                                        <span className="truncate">{college.fees || "N/A"}</span>
                                                    </div>
                                                ) : <span className="text-slate-600">—</span>}
                                            </td>
                                            {/* Actions */}
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-1.5 justify-end">
                                                    <Link
                                                        href={`/colleges/${college.id}`}
                                                        className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg transition-colors"
                                                        title="View"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </Link>
                                                    <Link
                                                        href={`/colleges/${college.id}/edit`}
                                                        className="p-1.5 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(college.id, college.name)}
                                                        className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {!loading && (
                        <div className="px-5 py-3 border-t border-slate-800 text-xs text-slate-500">
                            {displayed.length} of {colleges.length} college{colleges.length !== 1 ? "s" : ""}
                            {selected.size > 0 && ` · ${selected.size} selected`}
                        </div>
                    )}
                </div>
            )}

            {/* GRID VIEW */}
            {view === "grid" && (
                loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-48 bg-slate-900 rounded-xl animate-pulse border border-slate-800" />
                        ))}
                    </div>
                ) : displayed.length === 0 ? (
                    <div className="text-center py-16">
                        <GraduationCap className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-400 font-semibold text-lg">No colleges found</p>
                        <p className="text-slate-600 text-sm mt-1 mb-5">Try adjusting filters or add a new college.</p>
                        <Link href="/colleges/new" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all">
                            <Plus className="w-4 h-4" /> Add College
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {displayed.map((college) => {
                            const vis = (college.visibility ?? "draft") as Visibility;
                            const isChecked = selected.has(college.id);
                            return (
                                <div key={college.id} className={`bg-slate-900 border rounded-xl overflow-hidden shadow-lg transition-all hover:border-slate-700 ${isChecked ? "border-red-500/40 ring-2 ring-red-500/20" : "border-slate-800"}`}>
                                    {/* Card image */}
                                    <div className="h-28 bg-gradient-to-br from-slate-800 to-slate-900 relative">
                                        {college.image && (
                                            <img src={college.image} alt={college.name} className="w-full h-full object-cover opacity-60" />
                                        )}
                                        <div className="absolute top-2 left-2">
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => toggleSelect(college.id)}
                                                className="accent-red-500 w-4 h-4 cursor-pointer"
                                            />
                                        </div>
                                        <div className="absolute top-2 right-2">
                                            <VisibilityBadge collegeId={college.id} visibility={vis} onChange={handleVisibilityChange} />
                                        </div>
                                    </div>
                                    {/* Card content */}
                                    <div className="p-4">
                                        <Link href={`/colleges/${college.id}`}>
                                            <h3 className="font-bold text-slate-200 hover:text-red-400 transition-colors truncate text-sm mb-1">{college.name}</h3>
                                        </Link>
                                        <p className="text-xs text-slate-500 mb-3">{[college.location_city, college.location_state].filter(Boolean).join(", ") || "—"}</p>
                                        <div className="flex items-center gap-3 text-xs mb-3">
                                            {college.rank && <span className="flex items-center gap-1 text-slate-400"><Award className="w-3 h-3 text-amber-400" />#{college.rank}</span>}
                                            {college.rating && <span className="flex items-center gap-1 text-slate-400"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{college.rating}</span>}
                                            {college.type && <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px] font-semibold">{college.type}</span>}
                                        </div>
                                        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                                            <Link href={`/colleges/${college.id}/edit`} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700">
                                                <Edit2 className="w-3 h-3" /> Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(college.id, college.name)}
                                                className="p-1.5 text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )
            )}

            {/* Bulk shortcut: select all */}
            {!loading && displayed.length > 0 && selected.size === 0 && (
                <div className="mt-3 flex items-center gap-3">
                    <button
                        onClick={toggleAll}
                        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Select all {displayed.length}
                    </button>
                </div>
            )}

            <BulkUploadModal
                isOpen={isBulkUploadOpen}
                onClose={() => setIsBulkUploadOpen(false)}
                onSuccess={fetch}
            />
        </div>
    );
}
