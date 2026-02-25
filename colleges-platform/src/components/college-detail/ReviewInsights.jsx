import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Sparkles, RefreshCw, Bot, AlertCircle, Crown } from 'lucide-react';
import UpgradeModal from '../UpgradeModal';
import { usePremium } from '../../contexts/PremiumContext';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

async function generateInsights(reviews) {
    if (!GEMINI_API_KEY) throw new Error('VITE_GEMINI_API_KEY not set');

    const reviewTexts = reviews
        .slice(0, 50)
        .map((r, i) => `Review ${i + 1} (${r.rating}/5): ${r.review_text}`)
        .join('\n\n');

    const prompt = `You are an objective education advisor. Analyze these student reviews for a college and provide exactly 3 concise bullet-point insights in this JSON format:
{
  "insights": [
    { "emoji": "✅", "text": "Positive insight about the college" },
    { "emoji": "⚠️", "text": "Area to be mindful of" },
    { "emoji": "💡", "text": "Overall recommendation or helpful tip" }
  ],
  "summary": "One sentence overall sentiment"
}

Reviews:
${reviewTexts}

Respond with only valid JSON, no markdown.`;

    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 512 },
        }),
    });

    if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(text.replace(/```json|```/g, '').trim());
}

export function ReviewInsights({ collegeId }) {
    const [state, setState] = useState('idle'); // idle | loading | done | error | no_key
    const [insights, setInsights] = useState(null);
    const [error, setError] = useState('');
    const [showUpgrade, setShowUpgrade] = useState(false);

    // Read premium tier via hook — PremiumContext is always mounted above
    const { can } = usePremium();
    const canUseAI = can('aiInsights'); // false for free, true for premium/pro

    const handleGenerate = async () => {
        if (!canUseAI) { setShowUpgrade(true); return; }
        if (!GEMINI_API_KEY) { setState('no_key'); return; }
        setState('loading');
        try {
            const { data } = await supabase
                .from('reviews')
                .select('rating, review_text')
                .eq('college_id', collegeId)
                .eq('moderation_status', 'visible')
                .limit(50);

            if (!data || data.length < 3) {
                setError('Not enough reviews to generate insights (need at least 3 visible reviews).');
                setState('error');
                return;
            }
            const result = await generateInsights(data);
            setInsights(result);
            setState('done');
        } catch (e) {
            setError(e.message);
            setState('error');
        }
    };

    return (
        <>
            <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} featureName="AI Review Insights" />

            {state === 'idle' && (
                <div className="mb-6 p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-violet-500/10 rounded-xl">
                            <Sparkles className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                            <p className="text-white font-semibold text-sm flex items-center gap-2">
                                AI Review Summary
                                {!canUseAI && (
                                    <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold rounded uppercase tracking-wider flex items-center gap-1">
                                        <Crown className="w-2.5 h-2.5" />Premium
                                    </span>
                                )}
                            </p>
                            <p className="text-slate-400 text-xs">
                                {canUseAI
                                    ? 'Get a Gemini-powered insight based on all student reviews'
                                    : 'Upgrade to Premium to unlock AI-generated review summaries'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleGenerate}
                        className={`shrink-0 flex items-center gap-2 px-4 py-2.5 text-white text-sm font-bold rounded-xl transition-colors shadow-lg ${canUseAI ? 'bg-violet-600 hover:bg-violet-500 shadow-violet-900/30' : 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/30'}`}
                    >
                        {canUseAI ? <><Bot className="w-4 h-4" /> Generate</> : <><Crown className="w-4 h-4" /> Unlock</>}
                    </button>
                </div>
            )}

            {state === 'loading' && (
                <div className="mb-6 p-5 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                        <RefreshCw className="w-5 h-5 text-violet-400 animate-spin" />
                        <p className="text-slate-400 text-sm">Analysing reviews with Gemini AI...</p>
                    </div>
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => <div key={i} className="h-5 bg-slate-800 rounded-lg w-3/4" />)}
                    </div>
                </div>
            )}

            {state === 'no_key' && (
                <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                    <p className="text-amber-300 text-sm">
                        Add <code className="bg-amber-500/10 px-1.5 py-0.5 rounded text-xs">VITE_GEMINI_API_KEY</code> to <code className="bg-amber-500/10 px-1.5 py-0.5 rounded text-xs">.env.local</code>.
                        Free key at <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-200">aistudio.google.com</a>.
                    </p>
                </div>
            )}

            {state === 'error' && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                        <p className="text-red-300 text-sm">{error}</p>
                    </div>
                    <button onClick={() => setState('idle')} className="shrink-0 text-xs text-slate-500 hover:text-white">Retry</button>
                </div>
            )}

            {state === 'done' && (
                <div className="mb-6 p-5 bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-violet-400" />
                            <span className="text-white font-bold text-sm">AI-Powered Insights</span>
                            <span className="px-2 py-0.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 text-xs font-bold rounded-full">Gemini</span>
                        </div>
                        <button onClick={() => setState('idle')} className="text-xs text-slate-600 hover:text-slate-400">Refresh</button>
                    </div>
                    {insights?.summary && <p className="text-slate-300 text-sm mb-4 italic">"{insights.summary}"</p>}
                    <div className="space-y-3">
                        {(insights?.insights || []).map((ins, i) => (
                            <div key={i} className="flex items-start gap-3 text-sm">
                                <span className="text-xl shrink-0 leading-tight">{ins.emoji}</span>
                                <p className="text-slate-300 leading-relaxed">{ins.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
