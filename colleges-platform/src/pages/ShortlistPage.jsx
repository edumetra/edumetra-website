import { useState } from 'react';
import { supabase } from '../lib/supabase';
import SEOHead from '../components/SEOHead';
import { ArrowRight, ArrowLeft, Star, BookOpen, MapPin, Wallet, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const STEPS = ['Stream', 'States', 'Budget', 'Ownership', 'Results'];

const STREAMS = ['Engineering', 'Medical', 'Arts', 'Commerce', 'Management', 'Law'];
const STATES = ['Andhra Pradesh', 'Bihar', 'Delhi', 'Gujarat', 'Karnataka', 'Kerala', 'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'];
const BUDGET_OPTIONS = [
    { label: 'Under ₹1 Lakh', max: 100000 },
    { label: '₹1L – ₹3L', max: 300000, min: 100000 },
    { label: '₹3L – ₹7L', max: 700000, min: 300000 },
    { label: '₹7L – ₹15L', max: 1500000, min: 700000 },
    { label: 'Over ₹15L', min: 1500000 },
];
const OWNERSHIP = ['Government', 'Private', 'Deemed', 'Any'];

function StepProgress({ current }) {
    return (
        <div className="flex items-center gap-1 mb-10">
            {STEPS.slice(0, -1).map((s, i) => (
                <div key={s} className="flex items-center gap-1">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-black transition-all ${i < current ? 'bg-red-600 text-white' : i === current ? 'ring-2 ring-red-500 text-red-400 bg-transparent' : 'bg-slate-800 text-slate-600'}`}>
                        {i < current ? <CheckCircle className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={`text-xs font-semibold ${i === current ? 'text-white' : 'text-slate-600'}`}>{s}</span>
                    {i < STEPS.length - 2 && <div className={`w-8 h-px ${i < current ? 'bg-red-600' : 'bg-slate-800'}`} />}
                </div>
            ))}
        </div>
    );
}

function OptionGrid({ options, selected, onSelect, multi = false }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {options.map(opt => {
                const val = typeof opt === 'string' ? opt : opt.label;
                const isSelected = multi ? selected.includes(val) : selected === val;
                return (
                    <button
                        key={val}
                        onClick={() => {
                            if (multi) {
                                onSelect(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
                            } else {
                                onSelect(val);
                            }
                        }}
                        className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${isSelected ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-900/20' : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white bg-slate-900/50'}`}
                    >
                        {val}
                    </button>
                );
            })}
        </div>
    );
}

export default function ShortlistPage() {
    const [step, setStep] = useState(0);
    const [stream, setStream] = useState('');
    const [states, setStates] = useState([]);
    const [budget, setBudget] = useState('');
    const [ownership, setOwnership] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const canProceed = () => {
        if (step === 0) return !!stream;
        if (step === 1) return states.length > 0;
        if (step === 2) return !!budget;
        if (step === 3) return !!ownership;
        return true;
    };

    const handleNext = async () => {
        if (step < 3) { setStep(s => s + 1); return; }

        // Fetch results
        setLoading(true);
        const selectedBudget = BUDGET_OPTIONS.find(b => b.label === budget);
        let query = supabase.from('colleges').select('*').eq('visibility', 'public');

        if (stream) query = query.eq('stream', stream);
        if (states.length > 0) query = query.in('location_state', states);
        if (selectedBudget?.min) query = query.gte('fees_numeric', selectedBudget.min);
        if (selectedBudget?.max) query = query.lte('fees_numeric', selectedBudget.max);
        if (ownership && ownership !== 'Any') query = query.ilike('type', `%${ownership}%`);
        query = query.order('rating', { ascending: false }).limit(30);

        const { data } = await query;
        setResults(data || []);
        setLoading(false);
        setStep(4);
    };

    return (
        <div className="min-h-screen bg-black pt-24 pb-20 px-4">
            <SEOHead
                title="College Shortlisting Wizard — Get Personalised Recommendations"
                description="Answer 4 quick questions about your stream, location, budget and preferences to get a personalised college shortlist."
                url="/shortlist"
            />
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-white mb-3">
                        Find Your <span className="bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">Perfect Match</span>
                    </h1>
                    <p className="text-slate-400">Answer 4 quick questions for a personalised college shortlist.</p>
                </div>

                {step < 4 ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                        <StepProgress current={step} />

                        {step === 0 && (
                            <div>
                                <h2 className="text-xl font-bold text-white mb-2">What stream are you interested in?</h2>
                                <p className="text-slate-500 text-sm mb-6">Choose one stream to narrow your options.</p>
                                <OptionGrid options={STREAMS} selected={stream} onSelect={setStream} />
                            </div>
                        )}
                        {step === 1 && (
                            <div>
                                <h2 className="text-xl font-bold text-white mb-2">Which states do you prefer?</h2>
                                <p className="text-slate-500 text-sm mb-6">Select one or more states. We'll show colleges in those regions.</p>
                                <OptionGrid options={STATES} selected={states} onSelect={setStates} multi />
                            </div>
                        )}
                        {step === 2 && (
                            <div>
                                <h2 className="text-xl font-bold text-white mb-2">What's your annual fee budget?</h2>
                                <p className="text-slate-500 text-sm mb-6">We'll filter colleges within your range.</p>
                                <OptionGrid options={BUDGET_OPTIONS} selected={budget} onSelect={setBudget} />
                            </div>
                        )}
                        {step === 3 && (
                            <div>
                                <h2 className="text-xl font-bold text-white mb-2">College ownership preference?</h2>
                                <p className="text-slate-500 text-sm mb-6">Government colleges often have lower fees; private ones vary widely.</p>
                                <OptionGrid options={OWNERSHIP} selected={ownership} onSelect={setOwnership} />
                            </div>
                        )}

                        <div className="flex items-center gap-3 mt-8">
                            {step > 0 && (
                                <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 px-5 py-3 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 rounded-xl font-semibold transition-all">
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                disabled={!canProceed() || loading}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold rounded-xl transition-all"
                            >
                                {loading ? 'Finding colleges...' : step === 3 ? 'Show My Matches' : (<>Next Step <ArrowRight className="w-4 h-4" /></>)}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">
                                <span className="text-red-400">{results.length}</span> colleges matched your preferences
                            </h2>
                            <button onClick={() => setStep(0)} className="text-sm text-slate-500 hover:text-white underline">Start over</button>
                        </div>
                        {results.length === 0 ? (
                            <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
                                <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-400">No colleges matched all your criteria.</p>
                                <button onClick={() => setStep(0)} className="mt-4 text-red-400 hover:text-red-300 text-sm font-medium">Try different preferences →</button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {results.map((c, i) => (
                                    <div key={c.id} className="flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:border-red-500/30 transition-all group">
                                        <div className="text-slate-600 font-bold text-sm w-6 shrink-0">#{i + 1}</div>
                                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-800">
                                            <img src={c.image} alt={c.name} className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-white group-hover:text-red-400 transition-colors truncate">{c.name}</p>
                                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.location_city}, {c.location_state}</span>
                                                {c.fees && <span className="flex items-center gap-1"><Wallet className="w-3 h-3" />{c.fees}</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            {c.rating > 0 && <div className="flex items-center gap-1 text-amber-400 text-sm font-bold"><Star className="w-3.5 h-3.5 fill-current" />{c.rating}</div>}
                                            <Link to={`/colleges/${c.id}`} className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1">
                                                View <ArrowRight className="w-3 h-3" />
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
