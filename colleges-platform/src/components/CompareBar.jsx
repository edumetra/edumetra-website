import { useNavigate } from 'react-router-dom';
import { useCompare } from '../contexts/CompareContext';
import { usePremium } from '../contexts/PremiumContext';
import { X, GitCompareArrows, Plus } from 'lucide-react';

export default function CompareBar() {
    const { compareList, removeFromCompare, clearCompare, maxCompare } = useCompare();
    const navigate = useNavigate();

    // Safely read premium info
    let tier = 'free';
    try {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const p = usePremium();
        if (p) tier = p.tier;
    } catch { /* not ready */ }

    if (compareList.length === 0) return null;

    // Show slots dynamically based on tier
    const slots = Array.from({ length: maxCompare }, (_, i) => i);

    return (
        <>
            {compareList.length > 0 && (
                <div className="fixed bottom-16 sm:bottom-0 left-0 right-0 z-50 flex justify-center pb-4 px-4 pointer-events-none">
                    <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl shadow-black/60 px-4 py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-2xl">
                        {/* Slots */}
                        <div className="flex-1 overflow-x-auto scrollbar-hide flex items-center gap-2 py-1 w-full sm:overflow-visible sm:flex-wrap">
                            {slots.map(i => {
                                const college = compareList[i];
                                return college ? (
                                    <div key={college.id} className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-medium max-w-[150px] shrink-0 sm:shrink">
                                        <span className="truncate">{college.name}</span>
                                        <button onClick={() => removeFromCompare(college.id)} className="shrink-0 p-0.5 text-slate-400 hover:text-red-400 transition-colors">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <div key={i} className="flex items-center gap-1.5 border border-dashed border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-600 shrink-0">
                                        <Plus className="w-3 h-3" /> Add college
                                    </div>
                                );
                            })}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t border-slate-800 sm:border-0">
                            <button onClick={clearCompare} className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-3 py-2">Clear</button>
                            <button
                                disabled={compareList.length < 2}
                                onClick={() => navigate('/compare')}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all active:scale-95"
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
