import { Link } from 'react-router-dom';
import { MapPin, Star, Trophy, ArrowRight, Wallet, BookOpen, GitCompareArrows, Bookmark, BookmarkCheck } from 'lucide-react';
import { useCompare } from '../../contexts/CompareContext';
import { useSignup } from '../../contexts/SignupContext';
import { usePremium } from '../../contexts/PremiumContext';
import { supabase } from '../../lib/supabase';
import UpgradeModal from '../UpgradeModal';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function CollegeCard({ college, savedIds = [], onSaveToggle }) {
    const { addToCompare, removeFromCompare, isInCompare, isFull } = useCompare();
    const { user } = useSignup();
    const inCompare = isInCompare(college.id);
    const [saving, setSaving] = useState(false);
    const [showUpgrade, setShowUpgrade] = useState(false);
    const isSaved = savedIds.includes(college.id);

    // Read premium limits safely
    let maxSaved = 5;
    try {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const p = usePremium();
        if (p) maxSaved = p.limits.saved;
    } catch { /* not ready */ }

    const handleCompare = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (inCompare) {
            removeFromCompare(college.id);
            toast.error('Removed from compare');
        } else if (!isFull) {
            addToCompare(college);
            toast.success('Added to compare');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) return;
        // Gate: free users get 5 saved colleges
        if (!isSaved && savedIds.length >= maxSaved) {
            setShowUpgrade(true);
            return;
        }
        setSaving(true);
        if (isSaved) {
            await supabase.from('saved_colleges').delete().eq('user_id', user.id).eq('college_id', college.id);
            toast.error('Removed from saved colleges');
        } else {
            await supabase.from('saved_colleges').insert({ user_id: user.id, college_id: college.id });
            toast.success('College saved to profile!');
        }
        onSaveToggle?.(college.id, !isSaved);
        setSaving(false);
    };

    return (
        <>
            <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} featureName="Save more than 5 colleges" />
            <Link 
                to={`/colleges/${college.slug}`}
                className="group bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl overflow-hidden hover:-translate-y-1 hover:border-red-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/10 flex flex-col md:flex-row relative"
            >
                {/* Image */}
                <div className="relative w-full md:w-64 h-48 md:h-auto flex-shrink-0 overflow-hidden">
                    <img src={college.image} alt={college.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1">
                        <Trophy className="w-3 h-3" />#{college.rank}
                    </div>
                    {college.naac_grade && (
                        <div className="absolute top-3 right-3 bg-emerald-600/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded">
                            NAAC {college.naac_grade}
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent md:hidden" />
                </div>

                {/* Content */}
                <div className="flex-1 p-5 md:p-7 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="inline-block px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded border border-slate-700">{college.type}</span>
                                    {college.stream && (
                                        <span className="inline-block px-2 py-0.5 bg-red-500/10 text-red-400 text-xs rounded border border-red-500/20">{college.stream}</span>
                                    )}
                                </div>
                                <h3 className="text-2xl font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1">{college.name}</h3>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-1.5 bg-slate-800/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-slate-700/50">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    <span className="text-sm font-bold text-slate-100">{college.rating || '—'}</span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Rating</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                            <MapPin className="w-4 h-4 shrink-0" />{college.location}
                        </div>

                        {/* Updated Stats - Simplified */}
                        <div className="mb-5 p-4 bg-slate-900/40 border border-slate-800/60 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wider flex items-center gap-2">
                                <BookOpen className="w-3.5 h-3.5 text-red-500" /> Exams Accepted
                            </p>
                            <p className="text-sm font-semibold text-slate-200">{college.exams || 'Merit Based'}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-2">
                        <div className="px-5 py-3 bg-red-600/10 text-red-400 group-hover:bg-red-600 group-hover:text-white text-sm font-bold rounded-full transition-all border border-red-500/20 flex items-center gap-2 active:scale-95">
                            View Details <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                        
                        <div className="flex items-center gap-2.5">
                            {/* Compare */}
                            <button
                                onClick={handleCompare}
                                title={inCompare ? 'Remove from compare' : 'Add to compare'}
                                className={`p-2.5 rounded-full border transition-all active:scale-95 ${inCompare ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-500/20' : 'border-slate-700 bg-slate-800/30 text-slate-400 hover:border-red-500/50 hover:text-red-400'}`}
                            >
                                <GitCompareArrows className="w-4 h-4" />
                            </button>
                            {/* Save */}
                            {user && (
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    title={isSaved ? 'Remove from saved' : 'Save college'}
                                    className={`p-2.5 rounded-full border transition-all active:scale-95 ${isSaved ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'border-slate-700 bg-slate-800/30 text-slate-400 hover:border-amber-500/40 hover:text-amber-400'}`}
                                >
                                    {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        </>
    );
}
