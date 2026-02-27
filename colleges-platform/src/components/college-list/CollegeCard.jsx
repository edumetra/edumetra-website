import { Link } from 'react-router-dom';
import { MapPin, Star, Trophy, ArrowRight, Wallet, BookOpen, GitCompareArrows, Bookmark, BookmarkCheck } from 'lucide-react';
import { useCompare } from '../../contexts/CompareContext';
import { useSignup } from '../../contexts/SignupContext';
import { usePremium } from '../../contexts/PremiumContext';
import { supabase } from '../../lib/supabase';
import UpgradeModal from '../UpgradeModal';
import { useState } from 'react';

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
        if (inCompare) {
            removeFromCompare(college.id);
        } else if (!isFull) {
            addToCompare(college);
        }
        // if isFull and not inCompare → CompareContext will fire its own UpgradeModal
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!user) return;
        // Gate: free users get 5 saved colleges
        if (!isSaved && savedIds.length >= maxSaved) {
            setShowUpgrade(true);
            return;
        }
        setSaving(true);
        if (isSaved) {
            await supabase.from('saved_colleges').delete().eq('user_id', user.id).eq('college_id', college.id);
        } else {
            await supabase.from('saved_colleges').insert({ user_id: user.id, college_id: college.id });
        }
        onSaveToggle?.(college.id, !isSaved);
        setSaving(false);
    };

    return (
        <>
            <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} featureName="Save more than 5 colleges" />
            <div className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:-translate-y-1 hover:border-red-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/20 flex flex-col md:flex-row">
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
                <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="inline-block px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded border border-slate-700">{college.type}</span>
                                    {college.stream && (
                                        <span className="inline-block px-2 py-0.5 bg-red-500/10 text-red-400 text-xs rounded border border-red-500/20">{college.stream}</span>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1">{college.name}</h3>
                            </div>
                            <div className="flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50">
                                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm font-semibold text-slate-200">{college.rating || '—'}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                            <MapPin className="w-4 h-4 shrink-0" />{college.location}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4 py-4 border-y border-slate-800/50">
                            <div>
                                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Wallet className="w-3 h-3" /> Total Fees</p>
                                <p className="text-sm font-semibold text-slate-200">{college.fees}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><BookOpen className="w-3 h-3" /> Avg. Package</p>
                                <p className="text-sm font-semibold text-green-400">{college.avgPackage}</p>
                            </div>
                            <div className="hidden lg:block">
                                <p className="text-xs text-slate-500 mb-1">Exam Accepted</p>
                                <p className="text-sm font-semibold text-slate-200">{college.exams}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-auto">
                        <button className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-red-900/20">
                            Apply Now
                        </button>
                        <Link to={`/colleges/${college.id}`} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors border border-slate-700 flex items-center gap-2 group/btn">
                            View <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                        {/* Compare */}
                        <button
                            onClick={handleCompare}
                            title={inCompare ? 'Remove from compare' : isFull ? `Compare list full (max ${maxCompare})` : 'Add to compare'}
                            className={`p-2.5 rounded-lg border transition-all ${inCompare ? 'bg-red-600 border-red-600 text-white' : isFull ? 'border-slate-700 text-slate-600 cursor-not-allowed' : 'border-slate-700 text-slate-400 hover:border-red-500/50 hover:text-red-400'}`}
                        >
                            <GitCompareArrows className="w-4 h-4" />
                        </button>
                        {/* Save */}
                        {user && (
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                title={isSaved ? 'Remove from saved' : 'Save college'}
                                className={`p-2.5 rounded-lg border transition-all ${isSaved ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'border-slate-700 text-slate-400 hover:border-amber-500/40 hover:text-amber-400'}`}
                            >
                                {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
