import { useNavigate } from 'react-router-dom';
import { useCompare } from '../contexts/CompareContext';
import { usePremium } from '../contexts/PremiumContext';
import { X, GitCompareArrows, Plus, Crown } from 'lucide-react';
import UpgradeModal from './UpgradeModal';

export default function CompareBar() {
    const { compareList, removeFromCompare, clearCompare, maxCompare, showUpgradeModal, closeUpgradeModal } = useCompare();
    const navigate = useNavigate();

    // Safely read premium info
    let tier = 'free';
    try {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const p = usePremium();
        if (p) tier = p.tier;
    } catch { /* not ready */ }

    if (compareList.length === 0 && !showUpgradeModal) return null;

    // Show slots dynamically based on tier
    const slots = Array.from({ length: maxCompare }, (_, i) => i);

    return (
        <>
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={closeUpgradeModal}
                featureName="Compare more than 2 colleges"
            />

            {compareList.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 px-4 pointer-events-none">
                    <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl shadow-black/60 px-4 py-3 flex items-center gap-3 w-full max-w-2xl">
                        {/* Slots */}
                        <div className="flex-1 flex items-center gap-2 flex-wrap">
                            {slots.map(i => {
                                const college = compareList[i];
                                return college ? (
                                    <div key={college.id} className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-medium max-w-[160px]">
                                        <span className="truncate">{college.name}</span>
                                        <button onClick={() => removeFromCompare(college.id)} className="shrink-0 text-slate-400 hover:text-red-400 transition-colors">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <div key={i} className="flex items-center gap-1.5 border border-dashed border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-600">
                                        <Plus className="w-3 h-3" /> Add college
                                    </div>
                                );
                            })}
                            {tier === 'free' && (
                                <span className="text-xs text-slate-600 flex items-center gap-1">
                                    <Crown className="w-3 h-3 text-amber-600" /> Up to {maxCompare} (free)
                                </span>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                            <button onClick={clearCompare} className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2">Clear</button>
                            <button
                                disabled={compareList.length < 2}
                                onClick={() => navigate('/compare')}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all hover:scale-105"
                            >
                                <GitCompareArrows className="w-4 h-4" /> Compare ({compareList.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
