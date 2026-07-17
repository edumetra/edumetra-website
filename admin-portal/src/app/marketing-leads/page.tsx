"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Users, Mail, Phone, Calendar, RefreshCw } from "lucide-react";
import { FetchErrorBanner } from "@/components/FetchErrorBanner";

type MarketingLead = {
    id: string;
    created_at: string;
    name: string;
    email: string;
    phone: string;
    source: string;
    status: string;
};

export default function MarketingLeadsPage() {
    const supabase = createClient();
    const [leads, setLeads] = useState<MarketingLead[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const fetchLeads = async () => {
        setLoading(true);
        const { data, error } = await (supabase as any)
            .from("marketing_leads")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            setFetchError(error.message);
            setLeads([]);
        } else {
            setFetchError(null);
            setLeads((data as any[]) || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const visible = leads.filter((l) => {
        if (search) {
            const q = search.toLowerCase();
            return l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.phone.toLowerCase().includes(q);
        }
        return true;
    });

    const updateStatus = async (id: string, newStatus: string) => {
        const { error } = await (supabase as any)
            .from("marketing_leads")
            .update({ status: newStatus })
            .eq("id", id);
        
        if (!error) {
            setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus } : l));
        }
    };

    return (
        <div className="p-6 lg:p-10 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-blue-500/10 rounded-xl">
                            <Users className="w-6 h-6 text-blue-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Marketing Leads</h1>
                        <span className="px-2.5 py-1 bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-bold rounded-full">
                            {leads.length} total
                        </span>
                    </div>
                    <p className="text-slate-400 text-sm ml-14">
                        Leads generated from the dedicated landing page
                    </p>
                </div>
                <button
                    onClick={fetchLeads}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </button>
            </div>

            {fetchError && (
                <FetchErrorBanner message={fetchError} onRetry={fetchLeads} />
            )}

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <input
                    type="text"
                    placeholder="Search by name, email, or phone…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 min-w-[200px] bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/40"
                />
            </div>

            {/* Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48 text-slate-500">Loading…</div>
                ) : visible.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-500 gap-2">
                        <Users className="w-10 h-10 opacity-30" />
                        <p className="text-sm">No leads yet. Share your landing page to collect some!</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px] tracking-wider">
                                <th className="px-5 py-3 text-left">Name / Phone</th>
                                <th className="px-4 py-3 text-left">Email</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3 text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {visible.map((lead) => (
                                <tr key={lead.id} className="hover:bg-slate-800/40 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center text-xs font-bold">
                                                {lead.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <span className="text-slate-300 font-medium truncate max-w-[140px] block">
                                                    {lead.name}
                                                </span>
                                                <div className="flex items-center gap-1 text-slate-500 text-[10px]">
                                                    <Phone className="w-3 h-3" />
                                                    {lead.phone}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-1.5 text-slate-300">
                                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                                            <a href={`mailto:${lead.email}`} className="hover:text-white transition-colors">{lead.email}</a>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5 text-center">
                                        <select
                                            value={lead.status || "New"}
                                            onChange={(e) => updateStatus(lead.id, e.target.value)}
                                            className={`text-xs font-bold rounded-lg px-2 py-1 border outline-none ${
                                                lead.status === 'Contacted' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                lead.status === 'Converted' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                'bg-slate-800 text-slate-300 border-slate-700'
                                            }`}
                                        >
                                            <option value="New">New</option>
                                            <option value="Contacted">Contacted</option>
                                            <option value="Converted">Converted</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-3.5 text-right">
                                        <div className="flex items-center justify-end gap-1.5 text-slate-500">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(lead.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
