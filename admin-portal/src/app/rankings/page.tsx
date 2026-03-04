"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Plus, Trash2, Search, Trophy, FileText } from "lucide-react";

type Ranking = {
    id: string;
    college_id: string;
    provider: string;
    year: number;
    rank: number;
    colleges?: { name: string };
};

export default function RankingsManager() {
    const supabase = createClient();

    const [rankings, setRankings] = useState<Ranking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Form Modal State
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        college_id: "", provider: "NIRF", year: new Date().getFullYear(), rank: ""
    });
    const [collegesList, setCollegesList] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        fetchData();
        fetchColleges();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("rankings")
                .select(`
                    *,
                    colleges(name)
                `)
                .order("year", { ascending: false })
                .order("rank", { ascending: true })
                .limit(100);

            if (error) {
                if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
                    setRankings([]);
                    return;
                }
                throw error;
            }
            setRankings(data || []);
        } catch (err) {
            console.error("Failed to load rankings:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchColleges = async () => {
        const { data } = await supabase.from("colleges").select("id, name").order("name");
        if (data) setCollegesList(data);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Remove this ranking?")) return;
        const { error } = await supabase.from("rankings").delete().eq("id", id);
        if (!error) {
            setRankings(prev => prev.filter(r => r.id !== id));
        }
    };

    const handleSaveManual = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                college_id: formData.college_id,
                provider: formData.provider,
                year: Number(formData.year),
                rank: Number(formData.rank),
            };

            const { error } = await supabase.from("rankings").insert([payload as never]);
            if (error) throw error;

            setShowForm(false);
            setFormData({ college_id: "", provider: "NIRF", year: new Date().getFullYear(), rank: "" });
            fetchData();
        } catch (err: any) {
            alert("Error saving: " + err.message);
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-amber-500" /> Institution Rankings
                    </h1>
                    <p className="text-slate-400 text-sm">Manage global rankings like NIRF, India Today, etc.</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 bg-amber-600 text-white px-5 py-2.5 rounded-lg hover:bg-amber-500 transition-colors font-medium text-sm shadow-lg shadow-amber-900/20"
                >
                    <Plus className="w-5 h-5" /> Add New Ranking
                </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-slate-950/50">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Filter by college or provider..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-800">
                        <thead className="bg-slate-950/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">College</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Provider / Year</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Rank</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 bg-slate-900">
                            {loading ? (
                                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Loading records...</td></tr>
                            ) : rankings.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-16 text-center">
                                        <FileText className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                                        <h3 className="text-slate-300 font-medium text-lg">No Rankings Found</h3>
                                        <p className="text-slate-500 text-sm mt-1">Start tracking institution performance by adding a record.</p>
                                    </td>
                                </tr>
                            ) : (
                                rankings
                                    .filter(r =>
                                        (r.colleges?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                                        r.provider.toLowerCase().includes(searchTerm.toLowerCase())
                                    )
                                    .map((row) => (
                                        <tr key={row.id} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-200">
                                                {row.colleges?.name || "Unknown College"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 mr-2">
                                                    {row.provider}
                                                </span>
                                                <span className="text-slate-400 text-sm">{row.year}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-lg font-black text-white">#{row.rank}</div>
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
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-amber-500" /> Record Ranking
                            </h2>
                            <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handleSaveManual} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">College *</label>
                                <select
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                                    value={formData.college_id}
                                    onChange={(e) => setFormData({ ...formData, college_id: e.target.value })}
                                >
                                    <option value="">Select College</option>
                                    {collegesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Ranking Provider *</label>
                                <input
                                    type="text" required placeholder="e.g. NIRF, India Today, QS" list="providers"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                                    value={formData.provider} onChange={e => setFormData({ ...formData, provider: e.target.value })}
                                />
                                <datalist id="providers">
                                    <option value="NIRF" />
                                    <option value="India Today" />
                                    <option value="Outlook" />
                                    <option value="The Week" />
                                    <option value="QS World" />
                                </datalist>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Year *</label>
                                    <input
                                        type="number" required placeholder="YYYY"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                                        value={formData.year} onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Rank Achieved *</label>
                                    <input
                                        type="number" required placeholder="e.g. 15" min="1"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold"
                                        value={formData.rank} onChange={e => setFormData({ ...formData, rank: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 text-slate-400 hover:text-white">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold">Save Ranking</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
