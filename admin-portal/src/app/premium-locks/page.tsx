"use client";

import { useState } from "react";
import { Save, AlertCircle, CheckCircle2, Globe, Eye, EyeOff } from "lucide-react";
import { updateGlobalPremiumLocks } from "@/app/actions/collegeFeatures";

const AVAILABLE_FEATURES = [
    { id: "cutoffs", label: "Exam Cutoffs" },
    { id: "rankings", label: "Rankings & Accreditations" },
    { id: "reviews", label: "Student Reviews" },
    { id: "gallery", label: "Campus Gallery" },
    { id: "courses", label: "Courses & Fees" },
    { id: "contact", label: "Contact Information" },
    { id: "admissions", label: "Admission Details" },
    { id: "qna", label: "Questions & Answers" },
    { id: "faq", label: "Frequently Asked Questions" },
];

type VisibilityConfig = {
    visible_in_free: string[];
    visible_in_signed_up: string[];
    visible_in_pro: string[];
    visible_in_premium: string[];
};

export default function GlobalPremiumLocksPage() {
    // Note: We start empty for top-level, or pre-filled with Premium having all.
    const [config, setConfig] = useState<VisibilityConfig>({
        visible_in_free: [],
        visible_in_signed_up: [],
        visible_in_pro: [],
        visible_in_premium: AVAILABLE_FEATURES.map(f => f.id)
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const toggleFeature = (tier: keyof VisibilityConfig, featureId: string) => {
        setConfig((prev) => {
            const current = prev[tier];
            if (current.includes(featureId)) {
                return { ...prev, [tier]: current.filter((id) => id !== featureId) };
            } else {
                return { ...prev, [tier]: [...current, featureId] };
            }
        });
    };

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        const res = await updateGlobalPremiumLocks(config);

        if (res.error) {
            setError(res.error);
        } else {
            setSuccess(true);
            setTimeout(() => setSuccess(false), 5000);
            setShowConfirm(false);
        }
        setLoading(false);
    };

    const renderTierConfig = (
        title: string,
        tier: keyof VisibilityConfig,
        color: string
    ) => {
        const selectedCount = config[tier].length;

        return (
            <div className={`p-4 md:p-6 rounded-2xl border mb-6 bg-slate-950/50 border-${color}-500/20`}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-base font-bold text-${color}-400`}>{title}</h3>
                    <div className="text-sm font-bold px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
                        <span className="text-slate-200">{selectedCount}</span> Visible
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
                    {AVAILABLE_FEATURES.map((feature) => {
                        const isVisible = config[tier].includes(feature.id);
                        const isDisabled = false;

                        return (
                            <button
                                key={feature.id}
                                onClick={() => toggleFeature(tier, feature.id)}
                                disabled={loading || tier === "visible_in_premium"}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all h-24 text-center ${isVisible
                                    ? `bg-${color}-500/10 border-${color}-500/50 text-${color}-400 shadow-[0_0_15px_rgba(0,0,0,0.1)] scale-[1.02] shadow-${color}-900/20`
                                    : isDisabled
                                        ? "bg-slate-800/50 border-slate-800 text-slate-600 cursor-not-allowed"
                                        : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-700 hover:text-white"
                                    }`}
                            >
                                {isVisible ? <Eye className="w-5 h-5 mb-2" /> : <EyeOff className="w-5 h-5 mb-2 opacity-40" />}
                                {feature.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Globe className="w-6 h-6 text-blue-500" />
                        Global Feature Visibility
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Configure feature visibility across <b>all colleges</b> simultaneously based on user tiers.
                    </p>
                </div>
            </div>

            <div className="bg-slate-900 border border-blue-500/20 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-xl">
                {/* Background glow */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-4 rounded-xl mb-8 text-sm">
                    <p className="font-semibold mb-1">How this works:</p>
                    <ul className="list-disc list-inside space-y-1 ml-1 text-blue-300">
                        <li>Configure which sections are visible for Free, Signed Up, Pro, and Premium tiers.</li>
                        <li>Clicking save will overwrite the configuration for <b>every college</b> in the entire database.</li>
                        <li>You can still go to individual college pages later to customize their specific visibility rules.</li>
                    </ul>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <div>
                            <p className="font-bold">Error applying global visibility</p>
                            <p className="text-red-300/80 mt-0.5">{error}</p>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <div>
                            <p className="font-bold">Successfully updated all colleges!</p>
                            <p className="text-emerald-300/80 mt-0.5">The visibility configuration has been globally applied.</p>
                        </div>
                    </div>
                )}

                <div className="space-y-2 mb-8 relative z-10">
                    {renderTierConfig("Free Tier (Not Signed In)", "visible_in_free", "slate")}
                    {renderTierConfig("Signed Up Tier (Basic Account)", "visible_in_signed_up", "blue")}
                    {renderTierConfig("Pro Tier", "visible_in_pro", "purple")}
                    {renderTierConfig("Premium Tier", "visible_in_premium", "amber")}
                </div>

                <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                    <p className="text-sm text-slate-400 font-medium">
                        Apply this configuration to all colleges in the database.
                    </p>

                    {showConfirm ? (
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button
                                onClick={() => setShowConfirm(false)}
                                disabled={loading}
                                className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-xl transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-50 shadow-lg shadow-red-900/20"
                            >
                                {loading ? "Updating..." : "Yes, Update All Colleges"}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowConfirm(true)}
                            disabled={loading}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-blue-900/20 hover:shadow-blue-500/25 active:scale-95"
                        >
                            <Save className="w-5 h-5" />
                            {loading ? "Processing..." : "Apply Globally"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
