"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Mail, Download, Phone, Copy, Check, Search } from "lucide-react";
import toast from "react-hot-toast";

type Subscriber = {
    id: string;
    email: string;
    phone: string | null;
    created_at: string;
};

export default function NewsletterPage() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [copiedEmail, setCopiedEmail] = useState(false);
    const [copiedPhone, setCopiedPhone] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const fetchSubscribers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("newsletter_subscriptions")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            toast.error("Failed to load subscribers.");
        } else {
            setSubscribers(data || []);
        }
        setLoading(false);
    };

    const handleCopyEmails = () => {
        const emails = filterSubscribers().map(s => s.email).join(", ");
        navigator.clipboard.writeText(emails);
        setCopiedEmail(true);
        toast.success("Copied emails to clipboard!");
        setTimeout(() => setCopiedEmail(false), 2000);
    };

    const handleCopyPhones = () => {
        const phones = filterSubscribers().filter(s => s.phone).map(s => s.phone).join(", ");
        navigator.clipboard.writeText(phones);
        setCopiedPhone(true);
        toast.success("Copied phones to clipboard!");
        setTimeout(() => setCopiedPhone(false), 2000);
    };

    const downloadCSV = (type: "all" | "emails" | "phones") => {
        const filtered = filterSubscribers();
        if (filtered.length === 0) return toast.error("No data to export.");

        let csvString = "";
        let filename = "newsletter_export.csv";

        if (type === "all") {
            csvString = "Date,Email,Phone\n" + filtered.map(s => 
                `${new Date(s.created_at).toLocaleDateString()},${s.email},${s.phone || ""}`
            ).join("\n");
            filename = "newsletter_all_subscribers.csv";
        } else if (type === "emails") {
            csvString = "Email\n" + filtered.map(s => s.email).join("\n");
            filename = "newsletter_emails_only.csv";
        } else if (type === "phones") {
            csvString = "Phone\n" + filtered.filter(s => s.phone).map(s => s.phone).join("\n");
            filename = "newsletter_phones_only.csv";
        }

        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Downloaded ${filename}`);
    };

    const filterSubscribers = () => {
        return subscribers.filter(s => 
            s.email.toLowerCase().includes(search.toLowerCase()) || 
            (s.phone && s.phone.includes(search))
        );
    };

    const displayedSubscribers = filterSubscribers();

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Mail className="w-6 h-6 text-red-500" /> Newsletter Subscriptions
                </h1>
                <p className="text-slate-400 mt-1">Manage, copy, and export your newsletter audience.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg flex justify-between items-center">
                    <div>
                        <p className="text-sm text-slate-400 font-medium">Total Subscribers</p>
                        <p className="text-3xl font-bold text-white mt-1">{subscribers.length}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                        <Mail className="w-6 h-6" />
                    </div>
                </div>
                {/* Actions Panel */}
                <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg flex flex-col justify-center gap-3">
                    <p className="text-sm text-slate-400 font-medium tracking-wide">Bulk Actions & Exports</p>
                    <div className="flex flex-wrap items-center gap-3">
                        <button onClick={() => downloadCSV("all")} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm border border-slate-700 transition-colors">
                            <Download className="w-4 h-4 text-emerald-400" /> Full Export
                        </button>
                        <button onClick={() => downloadCSV("emails")} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm border border-slate-700 transition-colors">
                            <Mail className="w-4 h-4 text-blue-400" /> Emails Only
                        </button>
                        <button onClick={() => downloadCSV("phones")} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm border border-slate-700 transition-colors">
                            <Phone className="w-4 h-4 text-orange-400" /> Phones Only
                        </button>
                        
                        <div className="w-px h-8 bg-slate-700 mx-1 hidden md:block"></div>

                        <button onClick={handleCopyEmails} className="flex items-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-lg text-sm border border-red-500/20 transition-colors">
                            {copiedEmail ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Emails
                        </button>
                        <button onClick={handleCopyPhones} className="flex items-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-lg text-sm border border-red-500/20 transition-colors">
                            {copiedPhone ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Phones
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center bg-slate-900/50">
                    <h2 className="font-semibold text-white">Subscriber List</h2>
                    <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search email or phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-slate-600"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-950 text-slate-400 font-medium">
                            <tr>
                                <th className="px-6 py-3">Date Subscribed</th>
                                <th className="px-6 py-3">Email Address</th>
                                <th className="px-6 py-3">Phone Number</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-slate-500 font-medium">Loading subscribers...</td>
                                </tr>
                            ) : displayedSubscribers.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-slate-500 font-medium">
                                        {search ? "No subscribers match your search." : "No one has subscribed yet."}
                                    </td>
                                </tr>
                            ) : (
                                displayedSubscribers.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                                            {new Date(sub.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-300">
                                            {sub.email}
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">
                                            {sub.phone || <span className="text-slate-600 italic">Not provided</span>}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
