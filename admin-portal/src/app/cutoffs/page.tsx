"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Plus, Trash2, Upload, Search, Download, FileText, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";
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

export default function CutoffsManager() {
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [cutoffs, setCutoffs] = useState<Cutoff[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<{ success: number; failed: number; errors: any[] } | null>(null);

    // Form Modal State
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        college_id: "", course_id: "", exam_name: "", year: new Date().getFullYear(),
        category: "General", closing_score: "", closing_rank: ""
    });
    const [collegesList, setCollegesList] = useState<{ id: string; name: string }[]>([]);
    const [coursesList, setCoursesList] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        fetchData();
        fetchColleges();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("cutoffs")
                .select(`
                    *,
                    colleges(name),
                    college_courses(name)
                `)
                .order("year", { ascending: false })
                .limit(100);

            if (error) {
                // Table might not exist if migration didn't run
                if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
                    setCutoffs([]);
                    return;
                }
                throw error;
            }
            setCutoffs(data || []);
        } catch (err) {
            console.error("Failed to load cutoffs:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchColleges = async () => {
        const { data } = await supabase.from("colleges").select("id, name").order("name");
        if (data) setCollegesList(data);
    };

    const fetchCourses = async (collegeId: string) => {
        const { data } = await supabase.from("college_courses").select("id, name").eq("college_id", collegeId);
        if (data) setCoursesList(data);
        else setCoursesList([]);
    };

    const handleCollegeChange = (collegeId: string) => {
        setFormData({ ...formData, college_id: collegeId, course_id: "" });
        fetchCourses(collegeId);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this cutoff record?")) return;
        const { error } = await supabase.from("cutoffs").delete().eq("id", id);
        if (!error) {
            setCutoffs(prev => prev.filter(c => c.id !== id));
        }
    };

    const handleSaveManual = async (e: React.FormEvent) => {
        e.preventDefault();
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

            const { error } = await supabase.from("cutoffs").insert([payload as never]);
            if (error) throw error;

            setShowForm(false);
            fetchData();
        } catch (err: any) {
            alert("Error saving: " + err.message);
        }
    };

    // CSV Uploader
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setUploadResult(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const rows = results.data as any[];
                let successCount = 0;
                let failCount = 0;
                let errorLog = [];

                // To speed up, we should batch these or pre-fetch college IDs matching names.
                // For simplicity in this admin tool, we'll process sequentially or map known IDs.
                // Assuming CSV structure: college_id, course_id, exam_name, year, category, score, rank

                const inserts = rows.map(row => ({
                    college_id: row.college_id?.trim(),
                    course_id: row.course_id?.trim() || null,
                    exam_name: row.exam_name?.trim() || 'Custom',
                    year: parseInt(row.year) || new Date().getFullYear(),
                    category: row.category?.trim() || 'General',
                    closing_score: row.score ? parseFloat(row.score) : null,
                    closing_rank: row.rank ? parseInt(row.rank) : null,
                })).filter(r => r.college_id); // Basic validation

                if (inserts.length > 0) {
                    // Split into chunks of 100
                    for (let i = 0; i < inserts.length; i += 100) {
                        const chunk = inserts.slice(i, i + 100);
                        const { error } = await supabase.from("cutoffs").insert(chunk as never);
                        if (error) {
                            failCount += chunk.length;
                            errorLog.push(error.message);
                        } else {
                            successCount += chunk.length;
                        }
                    }
                }

                setUploadResult({ success: successCount, failed: failCount, errors: errorLog });
                setUploading(false);
                fetchData();
                if (fileInputRef.current) fileInputRef.current.value = "";
            },
            error: (err) => {
                alert("CSV Parse Error: " + err.message);
                setUploading(false);
            }
        });
    };

    const downloadTemplate = () => {
        const headers = ["college_id", "course_id", "exam_name", "year", "category", "score", "rank"];
        const example = ["UUID_HERE", "", "NEET", "2024", "General", "650", "1500"];
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + example.join(",");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "cutoffs_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Cutoffs Engine</h1>
                    <p className="text-slate-400 text-sm">Manage historic exam cutoffs for admissions prediction.</p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="file"
                        accept=".csv"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 bg-slate-800 text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors font-medium border border-slate-700 text-sm"
                    >
                        {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {uploading ? "Processing..." : "Bulk CSV Upload"}
                    </button>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition-colors font-medium text-sm"
                    >
                        <Plus className="w-4 h-4" /> Add Single
                    </button>
                </div>
            </div>

            {uploadResult && (
                <div className={`mb-6 p-4 rounded-xl border flex items-start gap-4 ${uploadResult.failed > 0 ? "bg-amber-500/10 border-amber-500/30" : "bg-emerald-500/10 border-emerald-500/30"}`}>
                    {uploadResult.failed > 0 ? <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" /> : <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />}
                    <div>
                        <h3 className={`font-semibold ${uploadResult.failed > 0 ? "text-amber-400" : "text-emerald-400"}`}>Upload Complete</h3>
                        <p className="text-sm text-slate-300 mt-1">
                            Successfully imported <strong>{uploadResult.success}</strong> rows. {uploadResult.failed > 0 && `Failed to import ${uploadResult.failed} rows.`}
                        </p>
                        {uploadResult.errors.length > 0 && (
                            <details className="mt-2 text-xs text-amber-300">
                                <summary className="cursor-pointer">View Error Logs</summary>
                                <ul className="mt-1 list-disc pl-4 opacity-80">
                                    {uploadResult.errors.map((err, i) => <li key={i}>{err}</li>)}
                                </ul>
                            </details>
                        )}
                    </div>
                </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Filter by college, exam, or year..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                        />
                    </div>
                    <button onClick={downloadTemplate} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 group">
                        <Download className="w-3 h-3 group-hover:-translate-y-0.5 transition-transform" /> CSV Template
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-800">
                        <thead className="bg-slate-950/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">College</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Exam & Year</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Closing Stats</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 bg-slate-900">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading records...</td></tr>
                            ) : cutoffs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <FileText className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                                        <h3 className="text-slate-300 font-medium text-lg">No Cutoff Data</h3>
                                        <p className="text-slate-500 text-sm mt-1">Upload a CSV or add records manually to populate this table.</p>
                                    </td>
                                </tr>
                            ) : (
                                cutoffs
                                    .filter(c =>
                                        (c.colleges?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                                        c.exam_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        c.year.toString().includes(searchTerm)
                                    )
                                    .map((row) => (
                                        <tr key={row.id} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-200">{row.colleges?.name || "Unknown College"}</div>
                                                <div className="text-xs text-slate-500">{row.college_courses?.name || "All Courses / General"}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 mr-2">
                                                    {row.exam_name}
                                                </span>
                                                <span className="text-slate-300 text-sm">{row.year}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-slate-300">{row.category}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {row.closing_score && <div className="text-sm text-slate-300">Score: <span className="font-bold text-white">{row.closing_score}</span></div>}
                                                {row.closing_rank && <div className="text-sm text-slate-300">Rank: <span className="font-bold text-white">#{row.closing_rank}</span></div>}
                                                {(!row.closing_score && !row.closing_rank) && <span className="text-slate-500 text-xs">N/A</span>}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleDelete(row.id)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Manual Add Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Add Cutoff Record</h2>
                            <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handleSaveManual} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">College *</label>
                                <select
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                                    value={formData.college_id}
                                    onChange={(e) => handleCollegeChange(e.target.value)}
                                >
                                    <option value="">Select College</option>
                                    {collegesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Course (Optional)</label>
                                <select
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white disabled:opacity-50"
                                    value={formData.course_id}
                                    onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                                    disabled={!formData.college_id}
                                >
                                    <option value="">Applies to Entire College</option>
                                    {coursesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Exam Name *</label>
                                    <input
                                        type="text" required placeholder="e.g. NEET"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                                        value={formData.exam_name} onChange={e => setFormData({ ...formData, exam_name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Year *</label>
                                    <input
                                        type="number" required placeholder="YYYY"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                                        value={formData.year} onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Category Quota *</label>
                                <input
                                    type="text" required placeholder="e.g. General, SC/ST, AIQ"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                                    value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Closing Score</label>
                                    <input
                                        type="number" step="0.1" placeholder="Score if applicable"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                                        value={formData.closing_score} onChange={e => setFormData({ ...formData, closing_score: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Closing Rank</label>
                                    <input
                                        type="number" placeholder="Rank if applicable"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                                        value={formData.closing_rank} onChange={e => setFormData({ ...formData, closing_rank: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 text-slate-400 hover:text-white">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold">Save Cutoff</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
