import { Crown, CheckCircle, X, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const PREMIUM_PERKS = [
    'Compare up to 5 colleges at once',
    'Save unlimited colleges',
    'AI-powered review insights (Gemini)',
    'Full placement data & salary stats',
    'Priority deadline alerts',
    'Ad-free experience',
];

export default function UpgradeModal({ isOpen, onClose, featureName }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
            <div className="relative z-10 w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/20 rounded-3xl p-8 shadow-2xl shadow-amber-900/20">
                {/* Close */}
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                    <X className="w-4 h-4" />
                </button>

                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-900/30">
                    <Crown className="w-8 h-8 text-white" />
                </div>

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-black text-white mb-2">Unlock Premium</h2>
                    {featureName && (
                        <p className="text-slate-400 text-sm">
                            <span className="text-amber-400 font-semibold">"{featureName}"</span> is a Premium feature.
                        </p>
                    )}
                    <p className="text-slate-400 text-sm mt-1">Upgrade to access this and much more.</p>
                </div>

                {/* Perks */}
                <div className="space-y-2.5 mb-8">
                    {PREMIUM_PERKS.map(perk => (
                        <div key={perk} className="flex items-center gap-3">
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="text-slate-300 text-sm">{perk}</span>
                        </div>
                    ))}
                </div>

                {/* Pricing */}
                <div className="text-center mb-6">
                    <span className="text-3xl font-black text-amber-400">₹299</span>
                    <span className="text-slate-500 text-sm"> / month</span>
                    <p className="text-slate-600 text-xs mt-1">7-day free trial · Cancel anytime</p>
                </div>

                <Link
                    to="/#pricing"
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-amber-900/30"
                >
                    <Zap className="w-4 h-4" /> Upgrade to Premium
                </Link>
                <button onClick={onClose} className="w-full mt-3 py-2 text-slate-500 hover:text-slate-300 text-sm transition-colors">
                    Maybe later
                </button>
            </div>
        </div>
    );
}
