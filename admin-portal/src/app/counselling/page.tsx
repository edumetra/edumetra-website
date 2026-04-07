"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Headphones, Download, Search, Calendar, User, Phone, Mail, GraduationCap, MapPin } from "lucide-react";
import Papa from "papaparse";

type CounsellingRequest = {
    id: string;
    name: string;
    phone: string;
    email: string;
    neet_marks: number | null;
    city: string | null;
    created_at: string;
};

export default function CounsellingPage() {
    const supabase = createClient();
    const [requests, setRequests] = useState<CounsellingRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState<string | null>(null);

    const fetchRequests = async () => {
        setLoading(true);
        setError(null);
        const { data, error: fetchErr } = await supabase
            .from("counselling_requests")
            .select("*")
            .order("created_at", { ascending: false });

        if (fetchErr) setError("Failed to load counselling requests.");
        else setRequests(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const filteredRequests = requests.filter(req => 
        req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.phone.includes(searchTerm) ||
        (req.city && req.city.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleDownloadCSV = () => {
        if (filteredRequests.length === 0) return;

        const csvData = filteredRequests.map(req => ({
            Name: req.name,
            Phone: req.phone,
            Email: req.email,
            "NEET Marks": req.neet_marks,
            City: req.city,
            "Date Submitted": new Date(req.created_at).toLocaleString()
        }));

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `counselling_requests_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                        <Headphones className="w-8 h-8 text-red-500" />
                        Counselling Requests
                    </h1>
                    <p className="text-slate-400 text-sm">View and manage students who have requested free counselling.</p>
                </div>
                <button
                    onClick={handleDownloadCSV}
                    disabled={filteredRequests.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors w-fit"
                >
                    <Download className="w-5 h-5" /> Download CSV
                </button>
            </div>

            {/* Filters & Search */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by name, email, phone or city..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                    />
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex items-center justify-between">
                    <div className="text-sm text-slate-400 font-medium">Total Requests</div>
                    <div className="text-xl font-bold text-white">{filteredRequests.length}</div>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm">
                    ⚠️ {error}
                </div>
            )}

            {/* Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-800">
                        <thead className="bg-slate-950/50">
                            <tr>
                                {["Student Info", "Contact", "NEET Marks", "Location", "Date"].map(h => (
                                    <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {loading ? (
                                <tr><td colSpan={5} className="py-12 text-center text-slate-500">Loading requests...</td></tr>
                            ) : filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <Headphones className="w-16 h-16 text-slate-800 mx-auto mb-4" />
                                        <p className="text-slate-400 font-medium text-lg">No counselling requests found</p>
                                        <p className="text-slate-600 text-sm mt-1">Try adjusting your search or check back later.</p>
                                    </td>
                                </tr>
                            ) : filteredRequests.map(req => (
                                <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 font-bold">
                                                {req.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-slate-200">{req.name}</div>
                                                <div className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Mail className="w-3 h-3" /> {req.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="text-sm text-slate-300 flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-slate-500" />
                                            {req.phone}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-sm font-bold">
                                            <GraduationCap className="w-4 h-4" />
                                            {req.neet_marks || "N/A"}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="text-sm text-slate-400 flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-slate-500" />
                                            {req.city || "—"}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <div className="text-xs text-slate-500 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-600" />
                                            {new Date(req.created_at).toLocaleDateString()}
                                            <span className="text-slate-700">
                                                {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
