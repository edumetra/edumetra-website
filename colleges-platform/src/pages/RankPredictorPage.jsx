import { useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import SEOHead from '../components/SEOHead';
import { Search, Trophy, ArrowRight, BookOpen, Star, GraduationCap, Crown, Lock, LayoutGrid, LayoutList } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSignup } from '../contexts/SignupContext';
import { usePremium } from '../contexts/PremiumContext';
import { categorizePrediction, canUserPredict, recordUsage, getUsage, PREDICTION_LEVELS } from '../components/predictor/predictorEngine';

const EXAMS = [
    { id: 'jee_main', label: 'JEE Main', field: 'Percentile (0–100)', min: 0, max: 100, unit: '%ile' },
    { id: 'jee_advanced', label: 'JEE Advanced', field: 'Rank', min: 1, max: 250000, unit: 'rank' },
    { id: 'neet', label: 'NEET', field: 'Score (0–720)', min: 0, max: 720, unit: 'marks' },
    { id: 'cat', label: 'CAT', field: 'Percentile (0–100)', min: 0, max: 100, unit: '%ile' },
    { id: 'clat', label: 'CLAT', field: 'Score (0–150)', min: 0, max: 150, unit: 'marks' },
    { id: 'cuet', label: 'CUET', field: 'Score (0–800)', min: 0, max: 800, unit: 'marks' },
];

export default function RankPredictorPage() {
    const { isSignedUp } = useSignup();
    const { isPremium, isPro } = usePremium();
    const [exam, setExam] = useState(EXAMS[0]);
    const [score, setScore] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [usage, setUsage] = useState(getUsage());

    const role = isPro ? 'pro' : isPremium ? 'premium' : 'free';
    const isGated = !isPremium && !isPro;

    useEffect(() => {
        setUsage(getUsage());
    }, [results]);

    const handlePredict = async () => {
        if (!score || !canUserPredict(role)) return;

        setLoading(true);
        const { data } = await supabase
            .from('colleges')
            .select('id, slug, name, location_city, location_state, type, stream, rating, fees, rank, image, cutoffs, naac_grade')
            .eq('visibility', 'public')
            .order('rank', { ascending: true });

        const mapped = (data || []).map(c => ({
            ...c,
            prediction: categorizePrediction(c, exam.id, parseFloat(score))
        })).filter(c => c.prediction.label !== 'Open');

        setResults(mapped);
        recordUsage();
        setLoading(false);
        
        // Save to session for Detail Page badge
        sessionStorage.setItem('last_prediction', JSON.stringify({ examId: exam.id, score }));
    };

    const grouped = useMemo(() => {
        if (!results) return null;
        return {
            safe: results.filter(r => r.prediction.label === 'Safe'),
            moderate: results.filter(r => r.prediction.label === 'Moderate'),
            risky: results.filter(r => r.prediction.label === 'Risky'),
        };
    }, [results]);

    return (
        <div className="min-h-screen bg-black pt-24 pb-20 px-4">
            <SEOHead
                title="Rank-Based College Predictor — Predict Your Admission Chances"
                description="Use our advanced algorithm to predict your chances of admission in top colleges based on your JEE, NEET, or CAT score."
                url="/rank-predictor"
            />
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-semibold mb-6">
                        <Trophy className="w-4 h-4" /> Priority Feature
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                        Rank-Based <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">College Predictor</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto">
                        Get data-driven predictions on whether a college is Safe, Moderate, or Risky for your rank.
                    </p>
                </div>

                {isGated ? (
                    /* Gate for Free/Guest */
                    <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center shadow-2xl">
                        <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
                            <Lock className="w-10 h-10 text-amber-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-4">Predictor is a Premium Feature</h2>
                        <p className="text-slate-400 mb-8 leading-relaxed">
                            Join 10,000+ students who use our predictor to make smarter admission choices. 
                            Upgrade to Premium or Pro to unlock Safe/Moderate/Risky indicators.
                        </p>
                        <Link
                            to="/pricing"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl transition-all shadow-xl shadow-amber-900/20 mb-6"
                        >
                            View Premium Plans <ArrowRight className="w-5 h-5" />
                        </Link>
                        <div className="grid grid-cols-3 gap-4 text-left">
                            {['Safe Picks', 'Moderate Reach', 'High-Risk Options'].map(f => (
                                <div key={f} className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <div className="text-emerald-400 font-bold text-xs mb-1">✓ Included</div>
                                    <div className="text-white text-xs font-semibold">{f}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Main Interface */
                    <>
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-10 shadow-xl">
                            <div className="grid md:grid-cols-2 gap-8 mb-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-4">Select Entrance Exam</label>
                                    <div className="flex flex-wrap gap-2">
                                        {EXAMS.map(e => (
                                            <button
                                                key={e.id}
                                                onClick={() => { setExam(e); setScore(''); setResults(null); }}
                                                className={`py-2 px-4 text-xs font-bold rounded-lg border transition-all ${exam.id === e.id ? 'bg-amber-500 border-amber-500 text-slate-950' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}
                                            >
                                                {e.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-4">{exam.field}</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={score}
                                            onChange={e => setScore(e.target.value)}
                                            min={exam.min}
                                            max={exam.max}
                                            placeholder={exam.unit}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 text-3xl font-black text-white focus:outline-none focus:border-amber-500/50 transition-all"
                                        />
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">{exam.unit}</div>
                                    </div>
                                    {isPremium && !isPro && (
                                        <div className="mt-3 flex items-center justify-between">
                                            <p className="text-slate-500 text-xs">Daily Usage: <span className="text-white font-bold">{usage.count} / 5</span></p>
                                            <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-amber-500" style={{ width: `${(usage.count / 5) * 100}%` }} />
                                            </div>
                                        </div>
                                    )}
                                    {isPro && <p className="text-amber-400/60 text-xs mt-3 font-bold">💎 Pro Plan: Unlimited Predictions</p>}
                                </div>
                            </div>

                            <button
                                onClick={handlePredict}
                                disabled={!score || loading || (isPremium && !isPro && usage.count >= 5)}
                                className="w-full py-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-30 text-slate-950 font-black rounded-xl transition-all flex items-center justify-center gap-3 text-xl shadow-2xl shadow-amber-900/30"
                            >
                                {loading ? (
                                    <span className="animate-pulse flex items-center gap-2"><Trophy className="w-5 h-5 animate-bounce" /> Analyzing Chances...</span>
                                ) : (
                                    <><Search className="w-6 h-6" /> Predict My Chances</>
                                )}
                            </button>
                        </div>

                        {/* Prediction Results */}
                        {results && (
                            <div className="grid lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {/* Safe */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                        <span className="font-black">SAFE PICKS</span>
                                        <span className="ml-auto text-xs bg-emerald-500/20 px-2 py-0.5 rounded-full">{grouped.safe.length}</span>
                                    </div>
                                    {grouped.safe.length === 0 ? (
                                        <EmptyState />
                                    ) : (
                                        grouped.safe.map(c => <CompactCollegeCard key={c.id} college={c} />)
                                    )}
                                </div>

                                {/* Moderate */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">
                                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                                        <span className="font-black">MODERATE REACH</span>
                                        <span className="ml-auto text-xs bg-amber-500/20 px-2 py-0.5 rounded-full">{grouped.moderate.length}</span>
                                    </div>
                                    {grouped.moderate.length === 0 ? (
                                        <EmptyState />
                                    ) : (
                                        grouped.moderate.map(c => <CompactCollegeCard key={c.id} college={c} />)
                                    )}
                                </div>

                                {/* Risky */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400">
                                        <div className="w-2 h-2 rounded-full bg-rose-400" />
                                        <span className="font-black">HIGH RISK</span>
                                        <span className="ml-auto text-xs bg-rose-500/20 px-2 py-0.5 rounded-full">{grouped.risky.length}</span>
                                    </div>
                                    {grouped.risky.length === 0 ? (
                                        <EmptyState />
                                    ) : (
                                        grouped.risky.map(c => <CompactCollegeCard key={c.id} college={c} />)
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function CompactCollegeCard({ college }) {
    return (
        <Link 
            to={`/colleges/${college.slug}`}
            className="flex items-center gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all group"
        >
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-800">
                <img src={college.image || ''} alt={college.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-xs group-hover:text-amber-400 transition-colors truncate">{college.name}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-slate-500 text-[10px]">{college.location_city}</span>
                    <div className="w-1 h-1 rounded-full bg-slate-700" />
                    <div className="flex items-center gap-0.5 text-amber-400 text-[10px] font-bold">
                        <Star className="w-2.5 h-2.5 fill-current" /> {college.rating}
                    </div>
                </div>
            </div>
            <div className={`px-2 py-1 rounded-lg border text-[9px] font-black tracking-tighter ${college.prediction.bg} ${college.prediction.color} ${college.prediction.border}`}>
                {college.prediction.label.toUpperCase()}
            </div>
        </Link>
    );
}

function EmptyState() {
    return (
        <div className="p-8 text-center bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl">
            <p className="text-slate-600 text-xs italic">No matching colleges in this category.</p>
        </div>
    );
}
