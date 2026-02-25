import { useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import SEOHead from '../components/SEOHead';
import { Search, Trophy, ArrowRight, BookOpen, Star, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

const EXAMS = [
    { id: 'jee_main', label: 'JEE Main', field: 'Percentile (0–100)', min: 0, max: 100, unit: '%ile' },
    { id: 'jee_advanced', label: 'JEE Advanced', field: 'Rank', min: 1, max: 250000, unit: 'rank' },
    { id: 'neet', label: 'NEET', field: 'Score (0–720)', min: 0, max: 720, unit: 'marks' },
    { id: 'cat', label: 'CAT', field: 'Percentile (0–100)', min: 0, max: 100, unit: '%ile' },
    { id: 'clat', label: 'CLAT', field: 'Score (0–150)', min: 0, max: 150, unit: 'marks' },
    { id: 'cuet', label: 'CUET', field: 'Score (0–800)', min: 0, max: 800, unit: 'marks' },
];

function isEligible(cutoffs, examId, score) {
    if (!cutoffs || !Array.isArray(cutoffs) || cutoffs.length === 0) return true; // no cutoff = open
    const cut = cutoffs.find(c => c.exam?.toLowerCase().replace(/\s/g, '_') === examId);
    if (!cut) return false;
    if (examId === 'jee_advanced') {
        return score <= (cut.max_rank ?? Infinity);
    }
    return score >= (cut.min_score ?? 0);
}

export default function EligibilityCheckerPage() {
    const [exam, setExam] = useState(EXAMS[0]);
    const [score, setScore] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleCheck = async () => {
        if (!score) return;
        setLoading(true);
        const { data } = await supabase
            .from('colleges')
            .select('id, name, location_city, location_state, type, stream, rating, fees, rank, image, cutoffs, naac_grade')
            .eq('visibility', 'public')
            .order('rank', { ascending: true });

        const eligible = (data || []).filter(c => isEligible(c.cutoffs, exam.id, parseFloat(score)));
        setResults(eligible);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-black pt-24 pb-20 px-4">
            <SEOHead
                title="Eligibility Checker — Find Colleges You Can Get Into"
                description="Enter your JEE, NEET, CAT or other exam score to instantly see which colleges you're eligible for."
                url="/eligibility"
            />
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold mb-6">
                        <GraduationCap className="w-4 h-4" /> Eligibility Checker
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                        Know Your <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Eligible Colleges</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto">
                        Enter your exam score and instantly see every college you're likely to get into.
                    </p>
                </div>

                {/* Input Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-10">
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        {/* Exam Select */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-3">Entrance Exam</label>
                            <div className="grid grid-cols-3 gap-2">
                                {EXAMS.map(e => (
                                    <button
                                        key={e.id}
                                        onClick={() => { setExam(e); setScore(''); setResults(null); }}
                                        className={`py-2.5 px-3 text-sm font-semibold rounded-xl border transition-all ${exam.id === e.id ? 'bg-red-600 border-red-600 text-white' : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white'}`}
                                    >
                                        {e.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Score Input */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-3">{exam.field}</label>
                            <input
                                type="number"
                                value={score}
                                onChange={e => setScore(e.target.value)}
                                min={exam.min}
                                max={exam.max}
                                placeholder={`Enter your ${exam.unit}`}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-4 text-2xl font-bold text-white placeholder-slate-600 focus:outline-none focus:border-red-500/60 transition-colors"
                            />
                            <p className="text-slate-600 text-xs mt-2">Valid range: {exam.min} — {exam.max}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleCheck}
                        disabled={!score || loading}
                        className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-40 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-lg shadow-xl shadow-red-900/20"
                    >
                        {loading ? (
                            <span className="animate-pulse">Checking eligibility...</span>
                        ) : (
                            <><Search className="w-5 h-5" /> Check Eligibility</>
                        )}
                    </button>
                </div>

                {/* Results */}
                {results !== null && (
                    <div>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-white">
                                {results.length > 0 ? (
                                    <><span className="text-emerald-400">{results.length}</span> eligible colleges found</>
                                ) : 'No matching colleges found'}
                            </h2>
                            {results.length > 0 && (
                                <span className="text-slate-500 text-sm">{exam.label} · {score} {exam.unit}</span>
                            )}
                        </div>

                        {results.length === 0 ? (
                            <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
                                <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-400">No colleges have cutoff data for this exam yet.</p>
                                <p className="text-slate-600 text-sm mt-1">Try a different exam or check back later.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {results.map((c, i) => (
                                    <div key={c.id} className="flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all group">
                                        <div className="text-slate-600 font-bold text-sm w-8 text-right shrink-0">#{c.rank || i + 1}</div>
                                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-800">
                                            <img src={c.image || ''} alt={c.name} className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-white group-hover:text-emerald-400 transition-colors truncate">{c.name}</p>
                                            <p className="text-slate-500 text-xs">{c.location_city}, {c.location_state} · {c.stream}</p>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            {c.naac_grade && <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold">{c.naac_grade}</span>}
                                            {c.rating > 0 && (
                                                <div className="flex items-center gap-1 text-amber-400 text-sm font-bold">
                                                    <Star className="w-3.5 h-3.5 fill-current" />{c.rating}
                                                </div>
                                            )}
                                            <Link to={`/colleges/${c.id}`} className="p-2 text-slate-600 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
