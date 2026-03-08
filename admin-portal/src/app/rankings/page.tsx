"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import {
    Plus, Trash2, Search, Trophy, FileText, Edit2, Save, X,
    Upload, Download, RefreshCw, CheckCircle, AlertTriangle,
    ChevronDown, Filter, Medal,
} from "lucide-react";
import Papa from "papaparse";

type Ranking = {
    id: string;
    college_id: string;
    provider: string;
    year: number;
    rank: number;
    category?: string;
    colleges?: { name: string; location_state?: string };
};

const PROVIDERS = ["NIRF", "India Today", "Outlook", "The Week", "QS World", "Times Higher Education", "NAAC", "Custom"];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i);

const RANK_COLOR = (r: number) => {
    if (r === 1) return "text-amber-400";
    if (r === 2) return "text-slate-300";
    if (r === 3) return "text-amber-700";
    return "text-slate-400";
};

const RANK_BG = (r: number) => {
    if (r <= 3) return "bg-amber-500/10 border-amber-500/20";
    if (r <= 10) return "bg-blue-500/10 border-blue-500/20";
    return "bg-slate-800/50 border-slate-700";
};

export default function RankingsManager() {
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [rankings, setRankings] = useState<Ranking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterProvider, setFilterProvider] = useState("All");
    const [filterYear, setFilterYear] = useState(String(CURRENT_YEAR));
    const [viewMode, setViewMode] = useState<"table" | "leaderboard">("leaderboard");
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<{ success: number; failed: number } | null>(null);

    // Inline edit
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<Partial<Ranking>>({});

    // Modal
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ college_id: "", provider: "NIRF", year: CURRENT_YEAR, rank: "", category: "" });
    const [collegesList, setCollegesList] = useState<{ id: string; name: string }[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchData(); fetchColleges(); }, []); // eslint-disable-line

    const fetchData = async () => {
        setLoading(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from("rankings")
            .select("*, colleges(name, location_state)")
            .order("year", { ascending: false })
            .order("rank", { ascending: true })
            .limit(500);
        if (!error) setRankings(data || []);
        setLoading(false);
    };

    const fetchColleges = async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any).from("colleges").select("id, name").order("name");
        if (data) setCollegesList(data);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Remove this ranking?")) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).from("rankings").delete().eq("id", id);
        if (!error) setRankings((prev) => prev.filter((r) => r.id !== id));
    };

    const startEdit = (row: Ranking) => {
        setEditingId(row.id);
        setEditValues({ rank: row.rank, provider: row.provider, year: row.year, category: row.category });
    };

    const saveEdit = async (id: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).from("rankings").update(editValues).eq("id", id);
        if (!error) {
            setRankings((prev) => prev.map((r) => r.id === id ? { ...r, ...editValues } : r));
            setEditingId(null);
        } else alert("Save failed: " + error.message);
    };

    const handleSaveManual = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                college_id: formData.college_id,
                provider: formData.provider,
                year: Number(formData.year),
                rank: Number(formData.rank),
                category: formData.category || null,
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase as any).from("rankings").insert([payload]);
            if (error) throw error;
            setShowForm(false);
            setFormData({ college_id: "", provider: "NIRF", year: CURRENT_YEAR, rank: "", category: "" });
            fetchData();
        } catch (err: unknown) {
            alert("Error: " + (err as Error).message);
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setUploadResult(null);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const rows = results.data as any[];
                const inserts = rows.map((row) => ({
                    college_id: row.college_id?.trim(),
                    provider: row.provider?.trim() || "NIRF",
                    year: parseInt(row.year) || CURRENT_YEAR,
                    rank: parseInt(row.rank),
                    category: row.category?.trim() || null,
                })).filter((r) => r.college_id && r.rank);

                let success = 0, failed = 0;
                for (let i = 0; i < inserts.length; i += 100) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const { error } = await (supabase as any).from("rankings").insert(inserts.slice(i, i + 100));
                    if (error) failed += inserts.slice(i, i + 100).length;
                    else success += inserts.slice(i, i + 100).length;
                }
                setUploadResult({ success, failed });
                setUploading(false);
                fetchData();
                if (fileInputRef.current) fileInputRef.current.value = "";
            },
        });
    };

    const downloadTemplate = () => {
        const csv = "college_id,provider,year,rank,category\nUUID_HERE,NIRF,2024,15,Engineering";
        const a = document.createElement("a");
        a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
        a.download = "rankings_template.csv";
        a.click();
    };

    const exportCSV = () => {
        const rows = filtered.map((r) => ({
            college: r.colleges?.name || r.college_id,
            provider: r.provider,
            year: r.year,
            rank: r.rank,
            category: r.category || "",
        }));
        const a = document.createElement("a");
        a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(Papa.unparse(rows));
        a.download = "rankings_export.csv";
        a.click();
    };

    const allProviders = Array.from(new Set(rankings.map((r) => r.provider)));

    const filtered = rankings.filter((r) => {
        const matchSearch = !searchTerm ||
            (r.colleges?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            r.provider.toLowerCase().includes(searchTerm.toLowerCase());
        const matchProvider = filterProvider === "All" || r.provider === filterProvider;
        const matchYear = filterYear === "All" || r.year === parseInt(filterYear);
        return matchSearch && matchProvider && matchYear;
    });

    // Stats
    const uniqueColleges = new Set(rankings.map((r) => r.college_id)).size;
    const uniqueProviders = new Set(rankings.map((r) => r.provider)).size;
    const top1 = rankings.find((r) => r.rank === 1 && r.provider === filterProvider && (filterYear === "All" || r.year === parseInt(filterYear)));

    const inputCls = "w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40";

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-amber-500" />
                    <div>
                        <h1 className="text-3xl font-bold text-white">Institution Rankings</h1>
                        <p className="text-slate-400 text-sm">Track NIRF, India Today, QS rankings per college.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                    <button onClick={downloadTemplate} className="flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-300 px-3 py-2 rounded-lg hover:bg-slate-700 text-xs font-semibold transition-colors">
                        <Download className="w-3.5 h-3.5" /> Template
                    </button>
                    <button onClick={exportCSV} className="flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-300 px-3 py-2 rounded-lg hover:bg-slate-700 text-xs font-semibold transition-colors">
                        <Download className="w-3.5 h-3.5" /> Export
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                        className="flex items-center gap-2 bg-slate-700 border border-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-600 text-sm font-semibold transition-colors">
                        {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {uploading ? "Importing..." : "Bulk Import"}
                    </button>
                    <button onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-500 text-sm font-semibold transition-colors shadow-lg shadow-amber-900/20">
                        <Plus className="w-4 h-4" /> Add Ranking
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="text-2xl font-black text-amber-400">{rankings.length}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mt-0.5">Total Records</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="text-2xl font-black text-blue-400">{uniqueColleges}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mt-0.5">Colleges Ranked</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="text-2xl font-black text-purple-400">{uniqueProviders}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mt-0.5">Providers</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="text-sm font-bold text-emerald-400 leading-tight truncate">{top1?.colleges?.name || "—"}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mt-0.5">Current #1</div>
                </div>
            </div>

            {/* Upload result */}
            {uploadResult && (
                <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${uploadResult.failed > 0 ? "bg-amber-500/10 border-amber-500/20" : "bg-emerald-500/10 border-emerald-500/20"}`}>
                    {uploadResult.failed > 0 ? <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" /> : <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
                    <p className="text-sm text-slate-300">
                        <strong className={uploadResult.failed > 0 ? "text-amber-400" : "text-emerald-400"}>{uploadResult.success} imported</strong>
                        {uploadResult.failed > 0 && `, ${uploadResult.failed} failed`}
                    </p>
                    <button onClick={() => setUploadResult(null)} className="ml-auto text-slate-600 hover:text-slate-400"><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* Filters + View Toggle */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-4 flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[180px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="text" placeholder="Search college or provider..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-slate-500" />
                </div>
                {[
                    { value: filterProvider, setter: setFilterProvider, options: ["All", ...allProviders] },
                    { value: filterYear, setter: setFilterYear, options: ["All", ...YEARS.map(String)] },
                ].map((f, i) => (
                    <div key={i} className="relative">
                        <select value={f.value} onChange={(e) => f.setter(e.target.value)}
                            className="appearance-none bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold rounded-lg pl-3 pr-7 py-2 focus:outline-none cursor-pointer">
                            {f.options.map((o) => <option key={o}>{o}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
                    </div>
                ))}
                {/* View mode toggle */}
                <div className="ml-auto flex gap-1 bg-slate-800 border border-slate-700 rounded-lg p-1">
                    <button onClick={() => setViewMode("leaderboard")} className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${viewMode === "leaderboard" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"}`}>
                        <Medal className="w-3.5 h-3.5 inline mr-1" />Leaderboard
                    </button>
                    <button onClick={() => setViewMode("table")} className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${viewMode === "table" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"}`}>
                        <FileText className="w-3.5 h-3.5 inline mr-1" />Table
                    </button>
                </div>
                <span className="text-xs text-slate-500">{filtered.length} records</span>
            </div>

            {/* Leaderboard View */}
            {viewMode === "leaderboard" && !loading && filtered.length > 0 && (
                <div className="space-y-2 mb-6">
                    {filtered.slice(0, 50).map((row) => {
                        const isEditing = editingId === row.id;
                        return (
                            <div key={row.id} className={`flex items-center gap-4 p-4 rounded-xl border ${RANK_BG(row.rank)} transition-all`}>
                                {/* Rank number */}
                                <div className={`w-12 text-center font-black text-xl ${RANK_COLOR(row.rank)}`}>
                                    {row.rank <= 3 ? (
                                        <Trophy className={`w-6 h-6 mx-auto ${RANK_COLOR(row.rank)}`} />
                                    ) : `#${row.rank}`}
                                </div>
                                {/* College */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-white text-sm truncate">{row.colleges?.name || "—"}</p>
                                    {row.colleges?.location_state && (
                                        <p className="text-xs text-slate-500">{row.colleges.location_state}</p>
                                    )}
                                </div>
                                {/* Provider + year */}
                                {isEditing ? (
                                    <div className="flex items-center gap-2">
                                        <select value={editValues.provider} onChange={(e) => setEditValues((p) => ({ ...p, provider: e.target.value }))}
                                            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none">
                                            {PROVIDERS.map((p) => <option key={p}>{p}</option>)}
                                        </select>
                                        <select value={editValues.year} onChange={(e) => setEditValues((p) => ({ ...p, year: parseInt(e.target.value) }))}
                                            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none w-20">
                                            {YEARS.map((y) => <option key={y}>{y}</option>)}
                                        </select>
                                        <input type="number" value={editValues.rank?.toString() ?? ""} min="1" placeholder="Rank"
                                            onChange={(e) => setEditValues((p) => ({ ...p, rank: parseInt(e.target.value) }))}
                                            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none w-20" />

                                        <button onClick={() => saveEdit(row.id)} className="p-1.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 rounded transition-colors"><Save className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => setEditingId(null)} className="p-1.5 bg-slate-700 text-slate-400 hover:bg-slate-600 rounded transition-colors"><X className="w-3.5 h-3.5" /></button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-xs font-bold">{row.provider}</span>
                                        <span className="text-slate-500 text-xs">{row.year}</span>
                                        {row.category && <span className="text-slate-600 text-xs">{row.category}</span>}
                                        <button onClick={() => startEdit(row)} className="p-1 text-slate-600 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors"><Edit2 className="w-3 h-3" /></button>
                                        <button onClick={() => handleDelete(row.id)} className="p-1 text-slate-600 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {filtered.length > 50 && (
                        <p className="text-center text-xs text-slate-600 pt-2">Showing 50 of {filtered.length} — use filters to narrow results</p>
                    )}
                </div>
            )}

            {/* Table View */}
            {viewMode === "table" && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-800">
                            <thead className="bg-slate-950/60">
                                <tr>
                                    <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase">Rank</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase">College</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase">Provider</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase">Year</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase">Category</th>
                                    <th className="px-5 py-3.5 text-right text-xs font-bold text-slate-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {loading ? (
                                    <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-500 text-sm">Loading...</td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-16 text-center">
                                            <Trophy className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                                            <p className="text-slate-400 font-semibold">No rankings found</p>
                                            <p className="text-slate-600 text-xs mt-1">Add rankings manually or import a CSV</p>
                                        </td>
                                    </tr>
                                ) : filtered.map((row) => {
                                    const isEditing = editingId === row.id;
                                    return (
                                        <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                                            <td className="px-5 py-3.5">
                                                {isEditing ? (
                                                    <input type="number" min="1" value={editValues.rank?.toString() ?? ""}
                                                        onChange={(e) => setEditValues((p) => ({ ...p, rank: parseInt(e.target.value) }))}
                                                        className="w-20 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:outline-none" />
                                                ) : (
                                                    <span className={`text-xl font-black ${RANK_COLOR(row.rank)}`}>#{row.rank}</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 font-semibold text-slate-200 text-sm">{row.colleges?.name || "—"}</td>
                                            <td className="px-5 py-3.5">
                                                {isEditing ? (
                                                    <select value={editValues.provider} onChange={(e) => setEditValues((p) => ({ ...p, provider: e.target.value }))}
                                                        className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none">
                                                        {PROVIDERS.map((p) => <option key={p}>{p}</option>)}
                                                    </select>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-xs font-bold">{row.provider}</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-400 text-sm">
                                                {isEditing ? (
                                                    <select value={editValues.year} onChange={(e) => setEditValues((p) => ({ ...p, year: parseInt(e.target.value) }))}
                                                        className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none">
                                                        {YEARS.map((y) => <option key={y}>{y}</option>)}
                                                    </select>
                                                ) : row.year}
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-500 text-xs">{row.category || "—"}</td>
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {isEditing ? (
                                                        <>
                                                            <button onClick={() => saveEdit(row.id)} className="p-1.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 rounded-lg transition-colors"><Save className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => setEditingId(null)} className="p-1.5 bg-slate-700 text-slate-400 hover:bg-slate-600 rounded-lg transition-colors"><X className="w-3.5 h-3.5" /></button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => startEdit(row)} className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleDelete(row.id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {loading && (
                <div className="flex items-center justify-center py-20 text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading rankings...
                </div>
            )}

            {/* Add Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-amber-500" /> Add Ranking
                            </h2>
                            <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSaveManual} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">College *</label>
                                <select required className={inputCls} value={formData.college_id}
                                    onChange={(e) => setFormData({ ...formData, college_id: e.target.value })}>
                                    <option value="">Select College</option>
                                    {collegesList.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Ranking Provider *</label>
                                <select required className={inputCls} value={formData.provider}
                                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}>
                                    {PROVIDERS.map((p) => <option key={p}>{p}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Year *</label>
                                    <select required className={inputCls} value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}>
                                        {YEARS.map((y) => <option key={y}>{y}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Rank *</label>
                                    <input type="number" required min="1" placeholder="e.g. 15" className={inputCls}
                                        value={formData.rank} onChange={(e) => setFormData({ ...formData, rank: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Category (Optional)</label>
                                <input type="text" placeholder="e.g. Engineering, Medical, Overall" className={inputCls}
                                    value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 text-slate-400 hover:text-white text-sm font-semibold">Cancel</button>
                                <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-sm disabled:opacity-50">
                                    {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trophy className="w-3.5 h-3.5" />}
                                    {saving ? "Saving..." : "Save Ranking"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
