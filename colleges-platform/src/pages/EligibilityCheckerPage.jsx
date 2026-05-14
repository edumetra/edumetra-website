import { useState } from 'react';
import { supabase } from '../lib/supabase';
import SEOHead from '../components/SEOHead';
import { Search, GraduationCap, Brain, Target, AlertCircle, Sparkles, TrendingUp, Loader2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSignup } from '../contexts/SignupContext';
import { pushLeadToTeleCRM } from '../services/telecrm';

const EXAMS = [
    { id: 'jee_main', label: 'JEE Main', field: 'Percentile (0–100)', min: 0, max: 100, unit: '%ile' },
    { id: 'jee_advanced', label: 'JEE Advanced', field: 'Rank', min: 1, max: 250000, unit: 'rank' },
    { id: 'neet', label: 'NEET', field: 'Score (0–720)', min: 0, max: 720, unit: 'marks' },
    { id: 'cat', label: 'CAT', field: 'Percentile (0–100)', min: 0, max: 100, unit: '%ile' },
    { id: 'clat', label: 'CLAT', field: 'Score (0–150)', min: 0, max: 150, unit: 'marks' },
    { id: 'cuet', label: 'CUET', field: 'Score (0–800)', min: 0, max: 800, unit: 'marks' },
];

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

async function checkEligibilityWithAI(examLabel, score, unit) {
    const prompt = `You are an expert Indian college admission counsellor at Edumetra. A student has achieved the following result:
Exam: ${examLabel}
Score/Rank: ${score} ${unit}

Provide a highly detailed, realistic, honest, and highly accurate admission eligibility analysis. 
Return ONLY a valid JSON object in the exact format below (no markdown, no other text):
{
  "verdict": "A short, direct 1-sentence summary of their chances",
  "probability": "Low", "Medium", or "High",
  "analysis": "A detailed 4-5 sentence paragraph explaining exactly what this score means for their admission prospects, including historical context and specific challenges or advantages they have.",
  "expectedColleges": ["Detailed description of a type or tier of college they can expect (e.g., 'Lower tier NITs in home state', 'Tier-3 Private Medical Colleges with high fees')", "Another detailed category"],
  "alternatives": ["Alternative option 1 in detail (e.g., 'Consider state level exams like MHT-CET or KCET')", "Alternative option 2 in detail"],
  "edumetraAdvice": "A highly encouraging call to action telling them to get in touch with Edumetra's expert counsellors to navigate these options, find hidden gems, or plan their next steps."
}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            max_tokens: 1000,
            response_format: { type: "json_object" }
        }),
    });

    if (!response.ok) {
        throw new Error('AI analysis failed');
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
}

export default function EligibilityCheckerPage() {
    const { user } = useSignup();
    const [exam, setExam] = useState(EXAMS[0]);
    const [score, setScore] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCheck = async () => {
        if (!score) return;
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const aiData = await checkEligibilityWithAI(exam.label, score, exam.unit);
            setResult(aiData);
            
            if (user) {
                pushLeadToTeleCRM(
                    {
                        name: user.user_metadata?.full_name || user.user_metadata?.name || '',
                        email: user.email,
                        phone: user.user_metadata?.phone || '',
                        status: 'Fresh',
                        exam_eligibility_checked: exam.label,
                        exam_score: score
                    },
                    ['Eligibility Checker Used']
                );
            }
        } catch (e) {
            setError("We couldn't analyze your eligibility right now. Please try again.");
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#070c1a] pt-24 pb-20 px-4 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
            
            <SEOHead
                title="AI Eligibility Checker — Know Your Admission Chances"
                description="Enter your exam score and let our AI engine analyze your admission prospects instantly."
                url="/eligibility"
            />
            
            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-wider mb-6">
                        <Brain className="w-4 h-4" /> AI Powered Checker
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                        Know Your <span className="bg-gradient-to-r from-red-500 to-rose-400 bg-clip-text text-transparent">Eligibility</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto">
                        Enter your exam score and let our intelligent engine instantly analyze your admission prospects.
                    </p>
                </div>

                {/* Input Card */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 mb-10 backdrop-blur-xl shadow-2xl">
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                        {/* Exam Select */}
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">Select Entrance Exam</label>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                {EXAMS.map(e => (
                                    <button
                                        key={e.id}
                                        onClick={() => { setExam(e); setScore(''); setResult(null); setError(null); }}
                                        className={`py-3 px-3 text-sm font-bold rounded-xl border transition-all ${exam.id === e.id ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/20' : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-white'}`}
                                    >
                                        {e.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Score Input */}
                        <div className="flex flex-col justify-center">
                            <label className="block text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">Your {exam.field}</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={score}
                                    onChange={e => setScore(e.target.value)}
                                    min={exam.min}
                                    max={exam.max}
                                    placeholder={`Enter your ${exam.unit}`}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-2xl font-black text-white placeholder:text-slate-700 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
                                />
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                                    {exam.unit}
                                </div>
                            </div>
                            <p className="text-slate-500 text-xs mt-3 font-semibold">Valid range: {exam.min} — {exam.max}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleCheck}
                        disabled={!score || loading}
                        className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-3 text-lg shadow-xl shadow-red-900/20"
                    >
                        {loading ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Profile...</>
                        ) : (
                            <><Search className="w-5 h-5" /> Check My Chances</>
                        )}
                    </button>

                    {error && (
                        <div className="mt-6 flex items-center justify-center gap-2 text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20 font-semibold text-sm">
                            <AlertCircle className="w-5 h-5" /> {error}
                        </div>
                    )}
                </div>

                {/* AI Results */}
                {result && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
                        {/* Overview Banner */}
                        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl flex flex-col md:flex-row gap-6 items-center md:items-start">
                            <div className="shrink-0">
                                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl ${
                                    result.probability === 'High' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                    result.probability === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                    'bg-red-500/20 text-red-400 border border-red-500/30'
                                }`}>
                                    <TrendingUp className="w-10 h-10" />
                                </div>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <div className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-3 border bg-slate-950/50 text-slate-300 border-slate-800">
                                    Probability: <span className={
                                        result.probability === 'High' ? 'text-emerald-400' :
                                        result.probability === 'Medium' ? 'text-amber-400' : 'text-red-400'
                                    }>{result.probability}</span>
                                </div>
                                <h2 className="text-2xl font-black text-white mb-2">{result.verdict}</h2>
                                <p className="text-slate-400 text-sm leading-relaxed">{result.analysis}</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Expected Colleges */}
                            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
                                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5 text-blue-400" /> Expected College Tiers
                                </h3>
                                <ul className="space-y-4">
                                    {result.expectedColleges?.map((college, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                                <Sparkles className="w-3 h-3 text-blue-400" />
                                            </div>
                                            <span className="text-slate-300 text-sm font-medium">{college}</span>
                                        </li>
                                    ))}
                                    {(!result.expectedColleges || result.expectedColleges.length === 0) && (
                                        <li className="text-slate-500 text-sm">No specific tiers identified for this score.</li>
                                    )}
                                </ul>
                            </div>

                            {/* Alternatives */}
                            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
                                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-amber-400" /> Suggested Alternatives
                                </h3>
                                <ul className="space-y-4">
                                    {result.alternatives?.map((alt, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                                <ChevronRight className="w-3 h-3 text-amber-400" />
                                            </div>
                                            <span className="text-slate-300 text-sm font-medium">{alt}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Edumetra CTA */}
                        {result.edumetraAdvice && (
                            <div className="bg-gradient-to-r from-red-600/10 to-rose-600/10 border border-red-500/20 rounded-3xl p-6 md:p-8 backdrop-blur-xl flex flex-col md:flex-row gap-6 items-center">
                                <div className="shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-900/30">
                                    <span className="text-white font-black text-2xl">E</span>
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-lg font-black text-white mb-2">Need Expert Guidance?</h3>
                                    <p className="text-slate-300 text-sm leading-relaxed mb-4">{result.edumetraAdvice}</p>
                                    <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-xl transition-all shadow-md">
                                        Talk to an Expert <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
