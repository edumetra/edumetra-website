"use client";

import { useState } from "react";
import { Save, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { updatePremiumLocks } from "@/app/actions/collegeFeatures";

const AVAILABLE_FEATURES = [
    { id: "placements", label: "Placement Statistics" },
    { id: "cutoffs", label: "Exam Cutoffs" },
    { id: "rankings", label: "Rankings & Accreditations" },
    { id: "reviews", label: "Student Reviews" },
    { id: "gallery", label: "Campus Gallery" },
    { id: "courses", label: "Courses & Fees" },
    { id: "contact", label: "Contact Information" },
];

type VisibilityConfig = {
    visible_in_free: string[];
    visible_in_signed_up: string[];
    visible_in_pro: string[];
    visible_in_premium: string[];
};

export default function PremiumLockingManager({
    collegeId,
    visibilityConfig = {
        visible_in_free: [],
        visible_in_signed_up: [],
        visible_in_pro: [],
        visible_in_premium: AVAILABLE_FEATURES.map(f => f.id)
    },
}: {
    collegeId: string;
    visibilityConfig?: VisibilityConfig;
}) {
    const [config, setConfig] = useState<VisibilityConfig>(visibilityConfig);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

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

        const res = await updatePremiumLocks(collegeId, config);

        if (res.error) {
            setError(res.error);
        } else {
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
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
            <div className={`p-4 rounded-xl border mb-4 bg-slate-950/50 border-${color}-500/20`}>
                <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-sm font-bold text-${color}-400`}>{title}</h3>
                    <div className="text-xs font-bold px-2 py-1 rounded bg-slate-900 text-slate-400">
                        <span className="text-slate-200">{selectedCount}</span> Visible
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                    {AVAILABLE_FEATURES.map((feature) => {
                        const isVisible = config[tier].includes(feature.id);
                        const isDisabled = false;

                        return (
                            <button
                                key={feature.id}
                                onClick={() => toggleFeature(tier, feature.id)}
                                disabled={tier === "visible_in_premium"} // Premium always has everything, though we can make it editable if we want
                                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-semibold transition-all h-20 text-center ${isVisible
                                    ? `bg-${color}-500/10 border-${color}-500/40 text-${color}-400`
                                    : isDisabled
                                        ? "bg-slate-800/30 border-slate-800 text-slate-600 cursor-not-allowed"
                                        : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-700"
                                    }`}
                            >
                                {isVisible ? <Eye className="w-4 h-4 mb-1" /> : <EyeOff className="w-4 h-4 mb-1 opacity-40" />}
                                {feature.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-400" /> Feature Visibility Tiers
                </h2>
            </div>

            <p className="text-sm text-slate-400 mb-6">
                Configure which features are visible at each user tier. Features not visible in a tier will show an upgrade prompt.
            </p>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-4 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
            )}

            {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl mb-4 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> Visibility configuration saved successfully!
                </div>
            )}

            <div className="space-y-4 mb-6">
                {renderTierConfig("Free Tier (Not Signed In)", "visible_in_free", "slate")}
                {renderTierConfig("Signed Up Tier (Basic Account)", "visible_in_signed_up", "blue")}
                {renderTierConfig("Pro Tier", "visible_in_pro", "purple")}
                {renderTierConfig("Premium Tier", "visible_in_premium", "amber")}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {loading ? "Saving..." : "Save Configuration"}
                </button>
            </div>
        </div>
    );
}
