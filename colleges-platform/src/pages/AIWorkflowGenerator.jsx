import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutGrid, ListChecks, ClipboardList, AlertTriangle, ChevronRight,
    Loader2, Sparkles, Target, RotateCcw, GraduationCap, Map,
    FileText, Calendar, Wallet, CheckCircle2, Search, Brain
} from 'lucide-react';
import { useSignup } from '../contexts/SignupContext';
import { usePremium } from '../contexts/PremiumContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const EXAMS = ['NEET', 'JEE Main', 'JEE Advanced', 'CAT', 'CLAT', 'NID', 'NATA', 'GATE', 'CUET'];
const STATUSES = ['Class 12th', 'Dropper', 'Final Year Student', 'Graduate'];
const CATEGORIES = ['General', 'OBC-NCL', 'SC', 'ST', 'EWS', 'PwD'];

async function fetchWorkflow(formData) {
    const prompt = `You are a professional Admissions Consultant in India. Generate a highly detailed, step-by-step admission workflow roadmap for a student.

Student Details:
- Target Exam: ${formData.exam}
- Current Status: ${formData.status}
- Category: ${formData.category}
- Target Institutions/Goals: ${formData.goals || 'Top tier colleges in the field'}

Respond ONLY with a JSON object in this format (no markdown, no extra text):
{
  "summary": "2-3 sentences providing an overview of the difficulty and strategy needed for this specific path.",
  "workflow": [
    {
      "stage": "e.g. Exam Preparation & Registration",
      "period": "e.g. Oct - Jan",
      "tasks": ["Task 1", "Task 2", "Task 3"]
    },
    {
      "stage": "e.g. Choice Filling & Counselling",
      "period": "e.g. June - Aug",
      "tasks": ["Task descriptions..."]
    }
  ],
  "documents": ["List exactly 6-8 required documents for this specific admission process"],
  "criticalDeadlines": [
    { "event": "e.g. Form Correction Window", "impact": "High/Medium/Low", "notes": "Brief explanation" }
  ],
  "counsellingTips": ["3-4 expert strategies for the counselling/seat allocation rounds"],
  "estimatedCosts": "Brief overview of application and initial admission fees to expect"
}

Be specific to the Indian admissions context. Use real terms like JOSAA, MCC, CAP rounds, etc. where applicable.`;

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
            max_tokens: 2500,
            response_format: { type: "json_object" }
        }),
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'AI Roadmap generation failed');
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
}

export default function AIWorkflowGenerator() {
    const { user } = useSignup();
    const { aiUsage, limits, refreshUsage } = usePremium();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [formData, setFormData] = useState({
        exam: 'NEET',
        status: 'Class 12th',
        category: 'General',
        goals: ''
    });

    const handleGenerate = async () => {
        if (!user) {
            toast.error('Please sign in to generate your roadmap');
            return;
        }

        if (aiUsage >= (limits.aiLimit || 0)) {
            toast.error(`AI Limit reached. Upgrade to continue generating roadmaps.`);
            return;
        }

        setLoading(true);
        setResult(null);
        try {
            const data = await fetchWorkflow(formData);
            setResult(data);
            refreshUsage();
        } catch (e) {
            console.error(e);
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#070c1a] pt-28 pb-20 px-4">
            {/* Background elements */}
            <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="text-center mb-12">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-black uppercase tracking-widest mb-4">
                        <Sparkles className="w-3.5 h-3.5" /> Admission Intelligence
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
                        AI Admission <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Roadmap</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Your personalized step-by-step masterplan from registration to reporting. No more confusion, just clear targets.
                    </p>
                </div>

                {!result && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-900/60 border border-slate-800/60 p-6 md:p-10 rounded-3xl"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Target Exam</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {EXAMS.slice(0, 9).map(exam => (
                                            <button 
                                                key={exam}
                                                onClick={() => setFormData(p => ({ ...p, exam }))}
                                                className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${formData.exam === exam ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:text-slate-300'}`}
                                            >
                                                {exam}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Current Status</label>
                                    <select 
                                        value={formData.status}
                                        onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}
                                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50"
                                    >
                                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Category (For Quota)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {CATEGORIES.map(cat => (
                                            <button 
                                                key={cat}
                                                onClick={() => setFormData(p => ({ ...p, category: cat }))}
                                                className={`py-2 px-4 rounded-xl text-xs font-bold transition-all border ${formData.category === cat ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:text-slate-300'}`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Specific Goals & Target Colleges</label>
                                    <textarea 
                                        placeholder="e.g. Want to target top IITs or NIT Trichy, interested in CS branch..."
                                        value={formData.goals}
                                        onChange={e => setFormData(p => ({ ...p, goals: e.target.value }))}
                                        rows={3}
                                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50 text-sm resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            disabled={loading}
                            onClick={handleGenerate}
                            className="w-full mt-10 py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-900/40 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {loading ? <><Loader2 className="w-6 h-6 animate-spin" /> mapping the path...</> : <><Brain className="w-6 h-6" /> Generate Master Roadmap</>}
                        </button>
                    </motion.div>
                )}

                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            <div className="flex items-center justify-between">
                                <button onClick={() => setResult(null)} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">
                                    <RotateCcw className="w-4 h-4" /> Start Over
                                </button>
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                    AI Engine v3.0 · Powered by Groq
                                </span>
                            </div>

                            {/* Summary */}
                            <div className="p-8 bg-gradient-to-br from-blue-600/10 to-emerald-600/5 border border-blue-500/20 rounded-3xl">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                                        <Map className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-white mb-2">The Path Ahead</h2>
                                        <p className="text-slate-300 leading-relaxed italic">"{result.summary}"</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Workflow Timeline */}
                                <div className="lg:col-span-2 space-y-6">
                                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <ListChecks className="w-4 h-4" /> Step-by-Step Workflow
                                    </h3>
                                    <div className="space-y-4">
                                        {result.workflow.map((item, idx) => (
                                            <div key={idx} className="group relative">
                                                <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-slate-800 last:hidden" />
                                                <div className="flex items-start gap-6">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 z-10 group-hover:border-blue-500/50 transition-colors">
                                                        <span className="text-lg font-black text-blue-500">{idx + 1}</span>
                                                    </div>
                                                    <div className="flex-1 bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl group-hover:bg-slate-900/60 transition-all">
                                                        <div className="flex justify-between items-center mb-4">
                                                            <h4 className="font-bold text-white uppercase tracking-wider">{item.stage}</h4>
                                                            <span className="px-3 py-1 bg-slate-950 rounded-full text-[10px] font-black text-slate-500 border border-slate-800 uppercase">
                                                                {item.period}
                                                            </span>
                                                        </div>
                                                        <ul className="space-y-3">
                                                            {item.tasks.map((task, tidx) => (
                                                                <li key={tidx} className="flex items-start gap-3">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                                                    <span className="text-xs text-slate-400 leading-relaxed font-medium">{task}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Sidebar Info */}
                                <div className="space-y-8">
                                    {/* Critical list */}
                                    <div className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-3xl">
                                        <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4" /> Critical Milestones
                                        </h3>
                                        <div className="space-y-5">
                                            {result.criticalDeadlines.map((dl, idx) => (
                                                <div key={idx} className="relative pl-4 border-l border-emerald-500/20">
                                                    <p className="text-xs font-bold text-white mb-1 uppercase tracking-wider">{dl.event}</p>
                                                    <p className="text-[10px] text-slate-500 leading-relaxed">{dl.notes}</p>
                                                    <span className={`mt-2 inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${dl.impact === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                                        {dl.impact} Impact
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Document Prep */}
                                    <div className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-3xl">
                                        <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                            <FileText className="w-4 h-4" /> Checklist
                                        </h3>
                                        <div className="space-y-3">
                                            {result.documents.map((doc, idx) => (
                                                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-950/40 rounded-xl border border-slate-800/50">
                                                    <div className="w-4 h-4 rounded border border-slate-700 flex items-center justify-center shrink-0">
                                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-sm opacity-20" />
                                                    </div>
                                                    <span className="text-[11px] text-slate-400 font-medium">{doc}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Tips */}
                                    <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl">
                                        <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                            <Brain className="w-4 h-4" /> Pro Tips
                                        </h3>
                                        <ul className="space-y-4">
                                            {result.counsellingTips.map((tip, idx) => (
                                                <li key={idx} className="text-xs text-slate-300 italic flex gap-2">
                                                    <span className="text-emerald-500">✦</span> "{tip}"
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
