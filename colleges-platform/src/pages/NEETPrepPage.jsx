import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain, Calendar, Zap, BookOpen, Target, ChevronRight,
    Loader2, Sparkles, AlertCircle, RotateCcw, CheckCircle2,
    Dna, FlaskConical, Atom, Save, Clock
} from 'lucide-react';
import { useSignup } from '../contexts/SignupContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

import { usePremium } from '../contexts/PremiumContext';
import { pushLeadToTeleCRM } from '../services/telecrm';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const SUBJECTS = [
    { id: 'physics', label: 'Physics', icon: Atom, color: 'from-blue-500 to-indigo-600' },
    { id: 'chemistry', label: 'Chemistry', icon: FlaskConical, color: 'from-emerald-500 to-teal-600' },
    { id: 'biology', label: 'Biology', icon: Dna, color: 'from-rose-500 to-pink-600' },
];

const WEAK_TOPICS = {
    physics: ['Mechanics', 'Thermodynamics', 'Electrostatics', 'Optics', 'Modern Physics', 'Waves & Sound', 'Magnetism', 'Current Electricity'],
    chemistry: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Chemical Bonding', 'Equilibrium', 'Electrochemistry', 'p-block elements', 'Coordination Compounds'],
    biology: ['Human Physiology', 'Plant Physiology', 'Genetics', 'Ecology', 'Cell Biology', 'Reproduction', 'Biotechnology', 'Evolution'],
};

const CONFIDENCE_LABELS = ['Very Weak', 'Weak', 'Below Avg', 'Average', 'Above Avg', 'Good', 'Very Good', 'Strong', 'Very Strong', 'Expert'];
const CONFIDENCE_COLORS = ['bg-red-500', 'bg-red-400', 'bg-orange-500', 'bg-orange-400', 'bg-yellow-500', 'bg-yellow-400', 'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-emerald-400'];

async function fetchAITips(formData) {
    const subjectSummary = SUBJECTS.map(s =>
        `${s.label}: Confidence ${formData.confidence[s.id]}/10, Weak areas: ${formData.weakTopics[s.id]?.join(', ') || 'None specified'}`
    ).join('\n');

    const prompt = `You are an expert NEET exam coach in India. A student needs a highly personalised NEET preparation plan.

Student profile:
- Days left for NEET exam: ${formData.daysLeft}
- Daily available study hours: ${formData.studyHours}
- Last mock test score: ${formData.mockScore ? `${formData.mockScore}/720` : 'Not taken yet'}
- Target score: ${formData.targetScore}/720
Subject confidence (1=very weak, 10=expert):
${subjectSummary}

Respond ONLY with a JSON object in this format (no markdown, no extra text):
{
  "analysis": "2-3 sentences analysing the student's situation honestly",
  "priorityFocus": ["Point 1", "Point 2", "Point 3"],
  "subjectStrategies": {
    "physics": ["3-4 clear tips"],
    "chemistry": ["3-4 clear tips"],
    "biology": ["3-4 clear tips focusing on NCERT"]
  },
  "dailySchedule": [
    { "time": "e.g. 06:00 - 08:30", "task": "Task description" }
  ],
  "milestones": [
    { "period": "e.g. First 15 Days", "goal": "Goal description" }
  ],
  "hacks": ["3-4 NEET-specific game-changing tips"]
}

Be direct, specific, and motivating. Do not use generic advice.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.6,
            max_tokens: 2000,
            response_format: { type: "json_object" }
        }),
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'AI request failed');
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
}

export default function NEETPrepPage() {
    const { user } = useSignup();
    const { aiUsage, limits, refreshUsage } = usePremium();
    const [step, setStep] = useState(1); // 1=basics, 2=subjects, 3=topics
    const [formData, setFormData] = useState({
        daysLeft: '',
        studyHours: '',
        mockScore: '',
        targetScore: '600',
        confidence: { physics: 5, chemistry: 5, biology: 5 },
        weakTopics: { physics: [], chemistry: [], biology: [] },
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const toggleTopic = (subject, topic) => {
        setFormData(prev => {
            const current = prev.weakTopics[subject];
            const updated = current.includes(topic)
                ? current.filter(t => t !== topic)
                : [...current, topic];
            return { ...prev, weakTopics: { ...prev.weakTopics, [subject]: updated } };
        });
    };

    const handleGenerate = async () => {
        if (!user) {
            toast.error('Please sign in to generate a strategy');
            return;
        }

        if (aiUsage >= (limits.aiLimit || 0)) {
            toast.error(`You have reached your limit of ${limits.aiLimit === Infinity ? 'unlimited' : limits.aiLimit} AI generations for your current plan.`);
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const plan = await fetchAITips(formData);
            setResult(plan);
            
            // Increment usage
            await supabase
                .from('user_profiles')
                .update({ ai_usage_count: aiUsage + 1 })
                .eq('id', user.id);
                
            pushLeadToTeleCRM(
                {
                    name: user.user_metadata?.full_name || user.user_metadata?.name || '',
                    email: user.email,
                    phone: user.user_metadata?.phone || '',
                    neet_score: formData.score,
                    neet_target: formData.target,
                    status: 'Fresh'
                },
                ['AI Strategy Generated', 'NEET Prep Page']
            );

            refreshUsage();
        } catch (e) {
            setError(e.message);
            toast.error('AI Strategy generation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user) {
            toast.error('Please sign in to save your plan');
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase
                .from('user_neet_plans')
                .insert([{
                    user_id: user.id,
                    form_data: formData,
                    plan_text: JSON.stringify(result)
                }]);

            if (error) throw error;
            toast.success('Strategy saved to your profile!');
        } catch (e) {
            console.error(e);
            toast.error('Failed to save strategy');
        } finally {
            setSaving(false);
        }
    };


    const canProceedStep1 = formData.daysLeft && formData.studyHours && formData.targetScore;

    return (
        <div className="min-h-screen bg-[#070c1a] pt-28 pb-20 px-4">
            {/* Ambient */}
            <div className="fixed top-0 right-1/4 w-96 h-96 bg-rose-600/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-1/4 left-1/4 w-80 h-80 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-3xl mx-auto relative z-10">

                {/* Header */}
                <div className="text-center mb-12">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-black uppercase tracking-wider mb-5">
                        <Brain className="w-4 h-4" /> AI Powered
                    </span>
                    <h1 className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
                        NEET Prep
                        <span className="block bg-gradient-to-r from-rose-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                            Advisor
                        </span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-md mx-auto">
                        Tell us where you stand. Get a hyper-personalised NEET study plan powered by AI — in under 10 seconds.
                    </p>
                </div>

                {/* Step indicator */}
                {!result && (
                    <div className="flex items-center justify-center gap-2 mb-10">
                        {[1, 2, 3].map(s => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === s ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : step > s ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                    {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                                </div>
                                {s < 3 && <div className={`w-12 h-0.5 rounded-full ${step > s ? 'bg-emerald-500' : 'bg-slate-800'}`} />}
                            </div>
                        ))}
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {/* ── Step 1: Basics ── */}
                    {step === 1 && !result && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                            className="bg-slate-900/70 border border-slate-800/60 rounded-2xl p-6 md:p-8"
                        >
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-rose-400" /> Your Exam Situation
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">Days left for NEET *</label>
                                    <input type="number" min="1" max="365" placeholder="e.g. 45"
                                        value={formData.daysLeft}
                                        onChange={e => setFormData(p => ({ ...p, daysLeft: e.target.value }))}
                                        className="w-full px-4 py-3 bg-slate-950/60 border border-slate-700/50 text-white rounded-xl focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 placeholder:text-slate-600 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">Study hours per day *</label>
                                    <input type="number" min="1" max="18" step="0.5" placeholder="e.g. 8"
                                        value={formData.studyHours}
                                        onChange={e => setFormData(p => ({ ...p, studyHours: e.target.value }))}
                                        className="w-full px-4 py-3 bg-slate-950/60 border border-slate-700/50 text-white rounded-xl focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 placeholder:text-slate-600 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">Last mock score <span className="text-slate-500 font-normal">(optional)</span></label>
                                    <input type="number" min="0" max="720" placeholder="Score out of 720"
                                        value={formData.mockScore}
                                        onChange={e => setFormData(p => ({ ...p, mockScore: e.target.value }))}
                                        className="w-full px-4 py-3 bg-slate-950/60 border border-slate-700/50 text-white rounded-xl focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 placeholder:text-slate-600 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">Target NEET score *</label>
                                    <input type="number" min="0" max="720" placeholder="e.g. 620"
                                        value={formData.targetScore}
                                        onChange={e => setFormData(p => ({ ...p, targetScore: e.target.value }))}
                                        className="w-full px-4 py-3 bg-slate-950/60 border border-slate-700/50 text-white rounded-xl focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 placeholder:text-slate-600 transition-all"
                                    />
                                </div>
                            </div>
                            <button
                                disabled={!canProceedStep1}
                                onClick={() => setStep(2)}
                                className="mt-8 w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-xl shadow-rose-500/20"
                            >
                                Next: Subject Confidence <ChevronRight className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}

                    {/* ── Step 2: Subject Confidence ── */}
                    {step === 2 && !result && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                            className="bg-slate-900/70 border border-slate-800/60 rounded-2xl p-6 md:p-8"
                        >
                            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                <Target className="w-5 h-5 text-rose-400" /> Subject Confidence
                            </h2>
                            <p className="text-slate-500 text-sm mb-7">Slide to rate your current confidence level in each subject.</p>
                            <div className="space-y-8">
                                {SUBJECTS.map(({ id, label, icon: Icon, color }) => {
                                    const val = formData.confidence[id];
                                    return (
                                        <div key={id}>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
                                                        <Icon className="w-4 h-4 text-white" />
                                                    </div>
                                                    <span className="font-semibold text-white">{label}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs text-white font-bold ${CONFIDENCE_COLORS[val - 1]}`}>
                                                        {CONFIDENCE_LABELS[val - 1]}
                                                    </span>
                                                    <span className="text-slate-400 font-mono text-sm w-8 text-right">{val}/10</span>
                                                </div>
                                            </div>
                                            <input
                                                type="range" min="1" max="10" value={val}
                                                onChange={e => setFormData(p => ({ ...p, confidence: { ...p.confidence, [id]: Number(e.target.value) } }))}
                                                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-rose-500"
                                                style={{ background: `linear-gradient(to right, rgb(244,63,94) 0%, rgb(244,63,94) ${(val - 1) / 9 * 100}%, rgb(30,41,59) ${(val - 1) / 9 * 100}%, rgb(30,41,59) 100%)` }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex gap-3 mt-8">
                                <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-all">Back</button>
                                <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 transition-all flex items-center justify-center gap-2 shadow-xl shadow-rose-500/20">
                                    Next: Weak Topics <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ── Step 3: Weak Topics ── */}
                    {step === 3 && !result && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                            className="bg-slate-900/70 border border-slate-800/60 rounded-2xl p-6 md:p-8"
                        >
                            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-rose-400" /> Weak Topics
                            </h2>
                            <p className="text-slate-500 text-sm mb-7">Select your weakest topics in each subject (optional but helps the AI personalise better).</p>

                            <div className="space-y-7">
                                {SUBJECTS.map(({ id, label, icon: Icon, color }) => (
                                    <div key={id}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
                                                <Icon className="w-3.5 h-3.5 text-white" />
                                            </div>
                                            <span className="font-semibold text-white text-sm">{label}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {WEAK_TOPICS[id].map(topic => {
                                                const selected = formData.weakTopics[id].includes(topic);
                                                return (
                                                    <button
                                                        key={topic}
                                                        onClick={() => toggleTopic(id, topic)}
                                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${selected ? 'bg-rose-500/20 border-rose-500/50 text-rose-300' : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:border-slate-500/60 hover:text-slate-300'}`}
                                                    >
                                                        {topic}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {error && (
                                <div className="mt-6 flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-red-400 font-semibold text-sm">Error generating tips</p>
                                        <p className="text-red-300/70 text-xs mt-0.5">{error}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 mt-8">
                                <button onClick={() => setStep(2)} className="px-6 py-3 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-all">Back</button>
                                <button
                                    onClick={handleGenerate}
                                    disabled={loading}
                                    className="flex-1 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-xl shadow-rose-500/20"
                                >
                                    {loading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Generating your plan...</>
                                    ) : (
                                        <><Sparkles className="w-5 h-5" /> Generate My NEET Plan</>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ── Result ── */}
                    {result && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* Result header */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900/40 border border-slate-800/60 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
                                        <Sparkles className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-white">Custom NEET Strategy</h2>
                                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                                            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> {formData.daysLeft} Days Left
                                            </span>
                                            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                <Zap className="w-3 h-3" /> {formData.studyHours}h / Day
                                            </span>
                                            <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                <Target className="w-3 h-3" /> Target: {formData.targetScore}+
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/30 disabled:opacity-50 transition-all active:scale-95"
                                    >
                                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                        {saving ? 'Saving...' : 'Save Strategy'}
                                    </button>
                                    <button
                                        onClick={() => { setResult(null); setStep(1); setError(null); }}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 transition-all"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" /> Redo
                                    </button>
                                </div>
                            </div>

                            {/* Analysis Card */}
                            <div className="p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 rounded-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Brain className="w-20 h-20" />
                                </div>
                                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-yellow-400" /> Expert Analysis
                                </h3>
                                <p className="text-slate-300 text-sm leading-relaxed relative z-10 italic">
                                    "{result.analysis}"
                                </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Priority Card */}
                                <div className="p-6 bg-slate-900/70 border border-slate-800/60 rounded-2xl">
                                    <h3 className="text-sm font-black text-rose-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                                        <Target className="w-4 h-4" /> Immediate Priorities
                                    </h3>
                                    <ul className="space-y-3">
                                        {result.priorityFocus.map((p, i) => (
                                            <li key={i} className="flex items-start gap-3 p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                                                <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                                    <span className="text-[10px] font-bold text-rose-400">{i + 1}</span>
                                                </div>
                                                <span className="text-slate-300 text-sm">{p}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Subject Strategies */}
                                <div className="p-6 bg-slate-900/70 border border-slate-800/60 rounded-2xl">
                                    <h3 className="text-sm font-black text-blue-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                                        <BookOpen className="w-4 h-4" /> Subject Blueprint
                                    </h3>
                                    <div className="space-y-4">
                                        {SUBJECTS.map(({ id, label, icon: Icon, color }) => (
                                            <div key={id} className="group">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
                                                        <Icon className="w-3 h-3 text-white" />
                                                    </div>
                                                    <span className="text-xs font-bold text-white uppercase tracking-widest">{label}</span>
                                                </div>
                                                <div className="pl-8 space-y-1.5">
                                                    {result.subjectStrategies[id]?.map((tip, i) => (
                                                        <div key={i} className="text-xs text-slate-400 flex items-start gap-2">
                                                            <div className="w-1 h-1 rounded-full bg-slate-700 mt-1.5 shrink-0" />
                                                            <span>{tip}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Daily Schedule */}
                            <div className="p-6 bg-slate-900/70 border border-slate-800/60 rounded-2xl">
                                <h3 className="text-sm font-black text-emerald-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Daily Schedule Blueprint
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {result.dailySchedule.map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 p-3 bg-slate-950/40 border border-slate-800/40 rounded-xl">
                                            <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] font-mono text-emerald-400 shrink-0">
                                                {item.time}
                                            </div>
                                            <span className="text-xs text-slate-300">{item.task}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Milestones */}
                            <div className="p-6 bg-slate-900/70 border border-slate-800/60 rounded-2xl">
                                <h3 className="text-sm font-black text-orange-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> Master Milestones
                                </h3>
                                <div className="space-y-4">
                                    {result.milestones.map((m, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className="w-3 h-3 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50" />
                                                {i < result.milestones.length - 1 && <div className="w-0.5 flex-1 bg-slate-800 my-1" />}
                                            </div>
                                            <div className="pb-4">
                                                <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">{m.period}</p>
                                                <p className="text-sm text-slate-300">{m.goal}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Hacks */}
                            <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                                <h3 className="text-sm font-black text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Zap className="w-4 h-4" /> NEET Pro Hacks
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {result.hacks.map((h, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                            <p className="text-slate-300 text-sm italic">{h}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>


                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

