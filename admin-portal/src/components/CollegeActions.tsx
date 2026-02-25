"use client";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/shared/types/database.types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Edit, Trash2, ChevronDown } from "lucide-react";

type Visibility = Database['public']['Tables']['colleges']['Row']['visibility'];


const VISIBILITY_OPTIONS: { value: Visibility; label: string; color: string }[] = [
    { value: "public", label: "Public", color: "text-emerald-400" },
    { value: "draft", label: "Draft", color: "text-amber-400" },
    { value: "hidden", label: "Hidden", color: "text-slate-400" },
];

export default function CollegeActions({ id, visibility: initialVisibility }: { id: string; visibility: Visibility }) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [currentVisibility, setCurrentVisibility] = useState<Visibility>(initialVisibility || "draft");

    const handleVisibilityChange = async (newVisibility: Visibility) => {
        setStatusLoading(true);
        setDropdownOpen(false);
        const { error } = await supabase
            .from("colleges")
            .update({ visibility: newVisibility })
            .eq("id", id);

        if (!error) {
            setCurrentVisibility(newVisibility);
            router.refresh();
        }
        setStatusLoading(false);
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this college? This cannot be undone.")) return;
        setLoading(true);
        await supabase.from("colleges").delete().eq("id", id);
        router.refresh();
        setLoading(false);
    };

    const current = VISIBILITY_OPTIONS.find(o => o.value === currentVisibility) ?? VISIBILITY_OPTIONS[1];

    return (
        <div className="flex items-center gap-2 justify-end">
            {/* Visibility status dropdown */}
            <div className="relative">
                <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    disabled={statusLoading}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${currentVisibility === "public"
                        ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                        : currentVisibility === "hidden"
                            ? "bg-slate-700/50 border-slate-600/50 text-slate-400"
                            : "bg-amber-500/10 border-amber-500/25 text-amber-400"
                        }`}
                >
                    <span className={`w-1.5 h-1.5 rounded-full ${currentVisibility === "public" ? "bg-emerald-400" :
                        currentVisibility === "hidden" ? "bg-slate-500" : "bg-amber-400"
                        }`} />
                    {statusLoading ? "..." : current.label}
                    <ChevronDown className={`w-3 h-3 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {dropdownOpen && (
                    <div className="absolute right-0 mt-1 w-36 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-20 overflow-hidden">
                        {VISIBILITY_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => handleVisibilityChange(opt.value)}
                                className={`flex items-center gap-2 w-full px-3 py-2.5 text-xs font-medium hover:bg-slate-700/70 transition-colors text-left ${opt.color} ${opt.value === currentVisibility ? "bg-slate-700/40" : ""}`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${opt.value === "public" ? "bg-emerald-400" :
                                    opt.value === "hidden" ? "bg-slate-500" : "bg-amber-400"
                                    }`} />
                                {opt.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <Link
                href={`/colleges/${id}/edit`}
                className="p-1.5 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
                title="Edit"
            >
                <Edit className="w-4 h-4" />
            </Link>
            <button
                onClick={handleDelete}
                disabled={loading}
                className="p-1.5 bg-red-500/10 text-red-400 hover:text-white hover:bg-red-600 rounded-lg transition-colors border border-red-500/20 disabled:opacity-50"
                title="Delete"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}
