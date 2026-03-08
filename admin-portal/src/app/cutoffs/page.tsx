"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import {
    Plus, Trash2, Upload, Search, Download, FileText,
    CheckCircle, AlertTriangle, RefreshCw, Edit2, Save, X,
    Filter, ChevronDown, BarChart2,
} from "lucide-react";
import Papa from "papaparse";

type Cutoff = {
    id: string;
    college_id: string;
    course_id: string | null;
    exam_name: string;
    year: number;
    category: string;
    closing_score: number | null;
    closing_rank: number | null;
    colleges?: { name: string };
    college_courses?: { name: string };
};

const EXAMS = ["NEET", "JEE Main", "JEE Advanced", "GATE", "CAT", "CLAT", "CUET", "Custom"];
const CATEGORIES = ["General", "OBC", "SC", "ST", "EWS", "AIQ", "Management", "NRI"];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i);

export default function CutoffsManager() {
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [cutoffs, setCutoffs] = useState<Cutoff[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterExam, setFilterExam] = useState("All");
    const [filterYear, setFilterYear] = useState("All");
    const [filterCategory, setFilterCategory] = useState("All");
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<Partial<Cutoff>>({});

    // Form Modal
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        college_id: "", course_id: "", exam_name: "NEET", year: CURRENT_YEAR,
        category: "General", closing_score: "", closing_rank: "",
    });
    const [collegesList, setCollegesList] = useState<{ id: string; name: string }[]>([]);
    const [coursesList, setCoursesList] = useState<{ id: string; name: string }[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchData(); fetchColleges(); }, []);// eslint-disable-line

    const fetchData = async () => {
        setLoading(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from("cutoffs")
            .select("*, colleges(name), college_courses(name)")
            .order("year", { ascending: false })
            .order("closing_rank", { ascending: true })
            .limit(500);
        if (!error) setCutoffs(data || []);
        setLoading(false);
    };

    const fetchColleges = async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any).from("colleges").select("id, name").order("name");
        if (data) setCollegesList(data);
    };

    const fetchCourses = async (collegeId: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any).from("college_courses").select("id, name").eq("college_id", collegeId);
        setCoursesList(data || []);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this cutoff record?")) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).from("cutoffs").delete().eq("id", id);
        if (!error) setCutoffs((prev) => prev.filter((c) => c.id !== id));
    };

    const handleSaveManual = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                college_id: formData.college_id,
                course_id: formData.course_id || null,
                exam_name: formData.exam_name,
                year: Number(formData.year),
                category: formData.category,
                closing_score: formData.closing_score ? Number(formData.closing_score) : null,
                closing_rank: formData.closing_rank ? Number(formData.closing_rank) : null,
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase as any).from("cutoffs").insert([payload]);
            if (error) throw error;
            setShowForm(false);
            setFormData({ college_id: "", course_id: "", exam_name: "NEET", year: CURRENT_YEAR, category: "General", closing_score: "", closing_rank: "" });
            fetchData();
        } catch (err: unknown) {
            alert("Error: " + (err as Error).message);
        } finally {
            setSaving(false);
        }
    };

    const startEdit = (row: Cutoff) => {
        setEditingId(row.id);
        setEditValues({
            closing_score: row.closing_score,
            closing_rank: row.closing_rank,
            category: row.category,
            exam_name: row.exam_name,
            year: row.year,
        });
    };

    const saveEdit = async (id: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).from("cutoffs").update(editValues).eq("id", id);
        if (!error) {
            setCutoffs((prev) => prev.map((c) => c.id === id ? { ...c, ...editValues } : c));
            setEditingId(null);
        } else {
            alert("Save failed: " + error.message);
        }
    };

    // CSV Upload
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
                    course_id: row.course_id?.trim() || null,
                    exam_name: row.exam_name?.trim() || "Custom",
                    year: parseInt(row.year) || CURRENT_YEAR,
                    category: row.category?.trim() || "General",
                    closing_score: row.score ? parseFloat(row.score) : null,
                    closing_rank: row.rank ? parseInt(row.rank) : null,
                })).filter((r) => r.college_id);

                let successCount = 0, failCount = 0;
                const errorLog: string[] = [];
                for (let i = 0; i < inserts.length; i += 100) {
                    const chunk = inserts.slice(i, i + 100);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const { error } = await (supabase as any).from("cutoffs").insert(chunk);
                    if (error) { failCount += chunk.length; errorLog.push(error.message); }
                    else successCount += chunk.length;
                }
                setUploadResult({ success: successCount, failed: failCount, errors: errorLog });
                setUploading(false);
                fetchData();
                if (fileInputRef.current) fileInputRef.current.value = "";
            },
            error: (err) => { alert("CSV Error: " + err.message); setUploading(false); },
        });
    };

    const downloadTemplate = () => {
        const csv = "college_id,course_id,exam_name,year,category,score,rank\nUUID_HERE,,NEET,2024,General,650,1500";
        const a = document.createElement("a");
        a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
        a.download = "cutoffs_template.csv";
        a.click();
    };

    const exportCSV = () => {
        const rows = filtered.map((c) => ({
            college: c.colleges?.name || c.college_id,
            course: c.college_courses?.name || "",
            exam: c.exam_name,
            year: c.year,
            category: c.category,
            closing_score: c.closing_score ?? "",
            closing_rank: c.closing_rank ?? "",
        }));
        const csv = Papa.unparse(rows);
        const a = document.createElement("a");
        a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
        a.download = "cutoffs_export.csv";
        a.click();
    };

    const allExams = Array.from(new Set(cutoffs.map((c) => c.exam_name)));
    const allCategories = Array.from(new Set(cutoffs.map((c) => c.category)));

    const filtered = cutoffs.filter((c) => {
        const matchSearch = !searchTerm ||
            (c.colleges?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            c.exam_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchExam = filterExam === "All" || c.exam_name === filterExam;
        const matchYear = filterYear === "All" || c.year === parseInt(filterYear);
        const matchCat = filterCategory === "All" || c.category === filterCategory;
        return matchSearch && matchExam && matchYear && matchCat;
    });

    // Stats
    const totalRecords = cutoffs.length;
    const uniqueColleges = new Set(cutoffs.map((c) => c.college_id)).size;
    const latestYear = cutoffs[0]?.year ?? CURRENT_YEAR;

    const inputCls = "w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40";

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Cutoffs Engine</h1>
                    <p className="text-slate-400 text-sm">Manage historic exam cutoffs for admissions prediction.</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                    <button onClick={downloadTemplate} className="flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-300 px-3 py-2 rounded-lg hover:bg-slate-700 text-xs font-semibold transition-colors">
                        <Download className="w-3.5 h-3.5" /> CSV Template
                    </button>
                    <button onClick={exportCSV} className="flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-300 px-3 py-2 rounded-lg hover:bg-slate-700 text-xs font-semibold transition-colors">
                        <BarChart2 className="w-3.5 h-3.5" /> Export
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                        className="flex items-center gap-2 bg-slate-700 border border-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-600 text-sm font-semibold transition-colors">
                        {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {uploading ? "Processing..." : "Bulk Upload"}
                    </button>
                    <button onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 text-sm font-semibold transition-colors shadow-lg shadow-red-900/20">
                        <Plus className="w-4 h-4" /> Add Record
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: "Total Records", value: totalRecords, color: "text-red-400" },
                    { label: "Colleges Covered", value: uniqueColleges, color: "text-blue-400" },
                    { label: "Latest Year", value: latestYear, color: "text-amber-400" },
                ].map((s) => (
                    <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Upload Result */}
            {uploadResult && (
                <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 ${uploadResult.failed > 0 ? "bg-amber-500/10 border-amber-500/20" : "bg-emerald-500/10 border-emerald-500/20"}`}>
                    {uploadResult.failed > 0 ? <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" /> : <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
                    <div className="text-sm">
                        <p className={`font-bold ${uploadResult.failed > 0 ? "text-amber-400" : "text-emerald-400"}`}>Upload Complete</p>
                        <p className="text-slate-400 mt-0.5">
                            {uploadResult.success} rows imported. {uploadResult.failed > 0 && `${uploadResult.failed} failed.`}
                        </p>
                        {uploadResult.errors[0] && <p className="text-xs text-red-400 mt-1">{uploadResult.errors[0]}</p>}
                    </div>
                    <button onClick={() => setUploadResult(null)} className="ml-auto text-slate-600 hover:text-slate-400"><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* Filters */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-4 flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[180px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="text" placeholder="Search college, exam..." value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-red-500/50" />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs text-slate-500 font-semibold">Filter:</span>
                </div>
                {[
                    { label: "Exam", value: filterExam, setter: setFilterExam, options: ["All", ...allExams] },
                    { label: "Year", value: filterYear, setter: setFilterYear, options: ["All", ...YEARS.map(String)] },
                    { label: "Category", value: filterCategory, setter: setFilterCategory, options: ["All", ...allCategories] },
                ].map((f) => (
                    <div key={f.label} className="relative">
                        <select value={f.value} onChange={(e) => f.setter(e.target.value)}
                            className="appearance-none bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold rounded-lg pl-3 pr-7 py-2 focus:outline-none cursor-pointer">
                            {f.options.map((o) => <option key={o}>{o}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
                    </div>
                ))}
                {(filterExam !== "All" || filterYear !== "All" || filterCategory !== "All" || searchTerm) && (
                    <button onClick={() => { setFilterExam("All"); setFilterYear("All"); setFilterCategory("All"); setSearchTerm(""); }}
                        className="text-xs text-red-400 hover:text-red-300 font-semibold">Clear filters</button>
                )}
                <span className="ml-auto text-xs text-slate-500">{filtered.length} of {totalRecords} records</span>
            </div>

            {/* Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-800">
                        <thead className="bg-slate-950/60">
                            <tr>
                                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase">College / Course</th>
                                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase">Exam</th>
                                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase">Year</th>
                                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase">Category</th>
                                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase">Closing Score</th>
                                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase">Closing Rank</th>
                                <th className="px-5 py-3.5 text-right text-xs font-bold text-slate-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {loading ? (
                                <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-500 text-sm">Loading records...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-16 text-center">
                                        <FileText className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                                        <p className="text-slate-400 font-semibold">No cutoff records found</p>
                                        <p className="text-slate-600 text-xs mt-1">Upload a CSV or add records manually</p>
                                    </td>
                                </tr>
                            ) : filtered.map((row) => {
                                const isEditing = editingId === row.id;
                                return (
                                    <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                                        <td className="px-5 py-3.5">
                                            <div className="font-semibold text-slate-200 text-sm">{row.colleges?.name || "—"}</div>
                                            {row.college_courses?.name && (
                                                <div className="text-xs text-slate-500">{row.college_courses.name}</div>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            {isEditing ? (
                                                <select value={editValues.exam_name} onChange={(e) => setEditValues((p) => ({ ...p, exam_name: e.target.value }))} className={inputCls}>
                                                    {EXAMS.map((ex) => <option key={ex}>{ex}</option>)}
                                                </select>
                                            ) : (
                                                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-xs font-bold">{row.exam_name}</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            {isEditing ? (
                                                <input type="number" value={editValues.year} onChange={(e) => setEditValues((p) => ({ ...p, year: parseInt(e.target.value) }))} className={`${inputCls} w-24`} />
                                            ) : (
                                                <span className="text-slate-300 text-sm font-semibold">{row.year}</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            {isEditing ? (
                                                <select value={editValues.category} onChange={(e) => setEditValues((p) => ({ ...p, category: e.target.value }))} className={inputCls}>
                                                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                                                </select>
                                            ) : (
                                                <span className="text-slate-300 text-sm">{row.category}</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            {isEditing ? (
                                                <input type="number" step="0.1" value={editValues.closing_score ?? ""} onChange={(e) => setEditValues((p) => ({ ...p, closing_score: e.target.value ? parseFloat(e.target.value) : null }))} className={`${inputCls} w-28`} />
                                            ) : (
                                                <span className="text-white font-bold">{row.closing_score ?? <span className="text-slate-600 font-normal text-xs">—</span>}</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            {isEditing ? (
                                                <input type="number" value={editValues.closing_rank ?? ""} onChange={(e) => setEditValues((p) => ({ ...p, closing_rank: e.target.value ? parseInt(e.target.value) : null }))} className={`${inputCls} w-28`} />
                                            ) : (
                                                <span className="text-white font-bold">{row.closing_rank ? `#${row.closing_rank}` : <span className="text-slate-600 font-normal text-xs">—</span>}</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {isEditing ? (
                                                    <>
                                                        <button onClick={() => saveEdit(row.id)} className="p-1.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 rounded-lg transition-colors">
                                                            <Save className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button onClick={() => setEditingId(null)} className="p-1.5 bg-slate-700 text-slate-400 hover:bg-slate-600 rounded-lg transition-colors">
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => startEdit(row)} className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors">
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button onClick={() => handleDelete(row.id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
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

            {/* Quick add modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-xl font-bold text-white">Add Cutoff Record</h2>
                            <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSaveManual} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">College *</label>
                                <select required className={inputCls} value={formData.college_id}
                                    onChange={(e) => { setFormData({ ...formData, college_id: e.target.value, course_id: "" }); fetchCourses(e.target.value); }}>
                                    <option value="">Select College</option>
                                    {collegesList.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Course (Optional)</label>
                                <select className={`${inputCls} disabled:opacity-50`} value={formData.course_id} disabled={!formData.college_id}
                                    onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}>
                                    <option value="">Entire College</option>
                                    {coursesList.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Exam *</label>
                                    <select required className={inputCls} value={formData.exam_name}
                                        onChange={(e) => setFormData({ ...formData, exam_name: e.target.value })}>
                                        {EXAMS.map((ex) => <option key={ex}>{ex}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Year *</label>
                                    <select required className={inputCls} value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}>
                                        {YEARS.map((y) => <option key={y}>{y}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Category / Quota *</label>
                                <select required className={inputCls} value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Closing Score</label>
                                    <input type="number" step="0.1" placeholder="e.g. 650"
                                        className={inputCls} value={formData.closing_score}
                                        onChange={(e) => setFormData({ ...formData, closing_score: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Closing Rank</label>
                                    <input type="number" placeholder="e.g. 1500"
                                        className={inputCls} value={formData.closing_rank}
                                        onChange={(e) => setFormData({ ...formData, closing_rank: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 text-slate-400 hover:text-white text-sm font-semibold">Cancel</button>
                                <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-sm disabled:opacity-50">
                                    {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                                    {saving ? "Saving..." : "Save Cutoff"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
