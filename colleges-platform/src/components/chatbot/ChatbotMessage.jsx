import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ExternalLink, Crown, ArrowRight, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useChatbot, GUEST_TURN_LIMIT } from './ChatbotContext';

// ── Individual message bubble ────────────────────────────────────────────────
function MessageBubble({ msg, isLatest }) {
    const isBot = msg.role === 'bot';
    const { user } = useChatbot();
    const userInitial = (user?.user_metadata?.full_name || user?.email || '?').charAt(0).toUpperCase();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            className={`flex gap-2 ${isBot ? 'items-start' : 'items-end justify-end'}`}
        >
            {isBot && (
                <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-[11px] font-black text-white shadow-md mt-0.5">
                    E
                </div>
            )}

            <div className={`max-w-[82%] flex flex-col gap-1.5`}>
                {msg.content && (
                    <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm whitespace-pre-line ${isBot
                        ? 'bg-[#1e2a42] text-slate-100 rounded-tl-sm border border-slate-700/40'
                        : 'bg-gradient-to-br from-red-600 to-rose-700 text-white rounded-br-sm'
                    }`}>
                        {msg.content}
                    </div>
                )}

                {msg.chips && isLatest && <QuickReplies chips={msg.chips} />}
                {msg.colleges && <CollegeCards colleges={msg.colleges} />}
                {msg.type === 'pricing' && <PricingCard />}
                {msg.type === 'premium_gate' && <PremiumGateCard />}
                {msg.type === 'signup_gate' && <SignupGateCard reason={msg.reason} />}
                {msg.cutoffs !== undefined && (
                    <CutoffTable name={msg.collegeName} cutoffs={msg.cutoffs} exams={msg.exams} />
                )}
                {msg.type === 'predictions' && <PredictionsCard predictions={msg.predictions} />}
                {msg.type === 'success' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-emerald-900/30 border border-emerald-600/30 rounded-xl px-4 py-3 text-sm text-emerald-400 font-medium"
                    >
                        ✅ {msg.successText}
                    </motion.div>
                )}
                {/* Turn limit warning */}
                {msg.type === 'turn_limit' && <TurnLimitCard />}
            </div>

            {!isBot && (
                <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-[11px] font-black text-white shadow-md border border-slate-500/30">
                    {userInitial}
                </div>
            )}
        </motion.div>
    );
}

// ── Quick reply chips ─────────────────────────────────────────────────────────
export function QuickReplies({ chips }) {
    const { addMessage, botSay, setFlow, setFlowData, flowData, canContinue, incrementGuestTurn, role, isSignedUp, openSignUp, turnsLeft } = useChatbot();
    const [used, setUsed] = useState(false);

    const handleChip = (chip) => {
        if (used) return;

        if (!canContinue()) {
            // Soft gate — show turn limit card inline
            setUsed(true);
            addMessage({ role: 'user', content: chip.label });
            botSay("You've used your free messages for now.", {
                delay: 300,
                type: 'turn_limit',
            });
            return;
        }

        setUsed(true);
        incrementGuestTurn();
        addMessage({ role: 'user', content: chip.label });
        chip.action?.({ botSay, setFlow, setFlowData, flowData, role, isSignedUp, openSignUp });
    };

    return (
        <AnimatePresence>
            {!used && (
                <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4, transition: { duration: 0.15 } }}
                    className="flex flex-wrap gap-1.5"
                >
                    {chips.map((chip) => (
                        <motion.button
                            key={chip.label}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => handleChip(chip)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-full bg-slate-700/80 hover:bg-red-600/20 text-slate-200 hover:text-red-300 border border-slate-600/60 hover:border-red-500/40 transition-all"
                        >
                            {chip.emoji && <span className="mr-1">{chip.emoji}</span>}
                            {chip.label}
                        </motion.button>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ── Guest turn-limit soft gate ───────────────────────────────────────────────
function TurnLimitCard() {
    const { openSignUp } = useChatbot();
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800/60 border border-slate-600/50 rounded-xl p-4 text-center w-full"
        >
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-2.5">
                <Lock className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-white text-xs font-bold mb-1">You've used {GUEST_TURN_LIMIT} free messages</p>
            <p className="text-slate-400 text-[11px] mb-3 leading-relaxed">
                Create a free account for unlimited access to Edu, college data, cutoffs & more.
            </p>
            <div className="space-y-2">
                <button
                    onClick={() => openSignUp()}
                    className="w-full py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold rounded-lg transition-all shadow-md"
                >
                    Sign Up Free — It's Instant →
                </button>
                <button
                    onClick={() => openSignUp('signin')}
                    className="w-full py-1.5 text-slate-500 hover:text-slate-300 text-[11px] transition-colors"
                >
                    Already have an account? Sign in
                </button>
            </div>
        </motion.div>
    );
}

// ── Signup gate (for cutoff feature) ─────────────────────────────────────────
function SignupGateCard({ reason }) {
    const { openSignUp } = useChatbot();
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800/60 border border-slate-600/50 rounded-xl p-4 text-center w-full"
        >
            <Lock className="w-5 h-5 text-slate-400 mx-auto mb-2" />
            <p className="text-white text-xs font-bold mb-1">{reason || 'Sign in to continue'}</p>
            <p className="text-slate-400 text-[10px] mb-3">Free account · Takes 30 seconds</p>
            <button
                onClick={() => openSignUp()}
                className="w-full py-2 bg-white text-slate-900 text-xs font-bold rounded-lg hover:bg-slate-100 transition-colors"
            >
                Sign Up Free →
            </button>
        </motion.div>
    );
}

// ── College result cards ─────────────────────────────────────────────────────
function CollegeCards({ colleges }) {
    if (!colleges.length) return (
        <p className="text-xs text-slate-400 italic">No matching colleges found. Try broadening filters.</p>
    );
    return (
        <div className="space-y-2 w-full">
            {colleges.map(c => (
                <Link key={c.id} to={`/colleges/${c.slug}`}
                    className="flex items-center gap-3 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 hover:border-red-500/30 rounded-xl p-3 transition-all group">
                    {c.image ? (
                        <img src={c.image} alt={c.name} className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-700" />
                    ) : (
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-900/40 to-slate-800 flex items-center justify-center text-white font-black text-lg shrink-0 border border-slate-700">
                            {c.name?.[0]}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-bold truncate group-hover:text-red-400 transition-colors">{c.name}</p>
                        <p className="text-slate-500 text-[10px] mt-0.5">{c.location_city}, {c.location_state}</p>
                        {c.fees > 0 && <p className="text-emerald-400 text-[10px] font-semibold mt-0.5">₹{(c.fees / 100000).toFixed(1)}L/yr</p>}
                    </div>
                    <div className="shrink-0 text-right space-y-1">
                        {c.rating > 0 && (
                            <div className="flex items-center gap-1 text-amber-400 text-[10px] font-bold justify-end">
                                <Star className="w-2.5 h-2.5 fill-current" /> {c.rating}
                            </div>
                        )}
                        <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-red-400 transition-colors ml-auto" />
                    </div>
                </Link>
            ))}
        </div>
    );
}

// ── Cutoff table ────────────────────────────────────────────────────────────
function CutoffTable({ name, cutoffs, exams }) {
    const hasCutoffs = Array.isArray(cutoffs) && cutoffs.length > 0;
    return (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 w-full">
            <p className="text-white text-xs font-bold mb-2 flex items-center gap-1.5">📊 {name} — Cutoffs</p>
            {hasCutoffs ? (
                <div className="space-y-2">
                    {cutoffs.map((c, i) => (
                        <div key={i} className="flex justify-between items-center text-[11px] py-1 border-b border-slate-700/40 last:border-0">
                            <span className="text-slate-400 font-medium">{c.exam || c.name || 'General'}</span>
                            <span className="text-emerald-400 font-bold bg-emerald-900/20 px-2 py-0.5 rounded-md">
                                {c.cutoff || c.score || c.rank || '—'}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-slate-400 text-xs">{exams ? `Accepted exams: ${exams}` : 'Cutoff data not yet available.'}</p>
            )}
        </div>
    );
}

// ── Predictions card ─────────────────────────────────────────────────────────
function PredictionsCard({ predictions }) {
    return (
        <div className="space-y-2 w-full max-w-[280px]">
            {predictions.map(c => (
                <Link 
                    key={c.id} 
                    to={`/colleges/${c.slug}`}
                    className="flex justify-between items-center p-2.5 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:border-amber-500/30 transition-all group"
                >
                    <div className="flex-1 min-w-0 mr-3">
                        <p className="text-white text-[11px] font-bold truncate group-hover:text-amber-400">{c.name}</p>
                        <p className="text-slate-500 text-[9px] truncate">{c.location_city}</p>
                    </div>
                    <div className={`shrink-0 px-2 py-0.5 border rounded-md text-[9px] font-black ${c.prediction.bg} ${c.prediction.color} ${c.prediction.border}`}>
                        {c.prediction.label.toUpperCase()}
                    </div>
                </Link>
            ))}
        </div>
    );
}

// ── Pricing card ─────────────────────────────────────────────────────────────
function PricingCard() {
    const plans = [
        { name: 'Free', price: '₹0', icon: '🆓', features: ['5 college views/day', 'Basic filters', 'Student reviews'] },
        { name: 'Premium', price: '₹499/mo', icon: '⚡', features: ['Unlimited views', 'Cutoff predictions', 'Priority counselling'], highlight: true },
        { name: 'Pro', price: '₹999/mo', icon: '👑', features: ['All Premium', 'AI recommendations', '1:1 Expert sessions'] },
    ];
    return (
        <div className="space-y-2 w-full">
            {plans.map(p => (
                <div key={p.name} className={`rounded-xl p-3 border ${p.highlight ? 'bg-red-600/10 border-red-500/30' : 'bg-slate-800/50 border-slate-700/40'}`}>
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-white text-xs font-bold">{p.icon} {p.name}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.highlight ? 'bg-red-600/20 text-red-400' : 'text-slate-400'}`}>{p.price}</span>
                    </div>
                    <ul className="space-y-0.5">
                        {p.features.map(f => (
                            <li key={f} className="text-slate-400 text-[10px] flex items-center gap-1.5">
                                <span className="text-emerald-400 font-bold">✓</span> {f}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
            <Link to="/pricing" className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold rounded-xl transition-all">
                View Full Plans <ArrowRight className="w-3 h-3" />
            </Link>
        </div>
    );
}

// ── Premium gate ─────────────────────────────────────────────────────────────
export function PremiumGateCard() {
    return (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-amber-950/30 border border-amber-500/25 rounded-xl p-4 text-center w-full">
            <Crown className="w-5 h-5 text-amber-400 mx-auto mb-2" />
            <p className="text-white text-xs font-bold mb-1">Premium Feature</p>
            <p className="text-slate-400 text-[10px] mb-3">Admission predictions need Premium or Pro</p>
            <Link to="/pricing" className="block w-full py-2 bg-amber-500 text-amber-950 text-xs font-bold rounded-lg hover:bg-amber-400 transition-all">
                Upgrade Now →
            </Link>
        </motion.div>
    );
}

// ── Typing indicator ─────────────────────────────────────────────────────────
export function TypingIndicator() {
    return (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 items-start">
            <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-[11px] font-black text-white shadow-md">
                E
            </div>
            <div className="bg-[#1e2a42] border border-slate-700/40 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map(i => (
                        <motion.div key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }} />
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

export default MessageBubble;
