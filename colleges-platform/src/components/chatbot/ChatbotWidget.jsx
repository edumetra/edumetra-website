import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, RotateCcw, GraduationCap, Crown, Sparkles } from 'lucide-react';
import { useChatbot, GUEST_TURN_LIMIT } from './ChatbotContext';
import MessageBubble, { TypingIndicator } from './ChatbotMessage';
import { getWelcomeFlow, handleTextInput } from './flows/index';

const GREETED_KEY = 'edu_greeted';

// ── Main chat window (open to ALL users) ────────────────────────────────────
function ChatWindow({ onClose }) {
    const {
        messages, botSay,
        flow, setFlow, flowData, setFlowData,
        isTyping, role, isSignedUp, user,
        addMessage, resetChat, initialized,
        canContinue, incrementGuestTurn, turnsLeft,
        openSignUp,
    } = useChatbot();

    const [text, setText] = useState('');
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    // Send welcome on first open
    useEffect(() => {
        if (!initialized) return;
        if (messages.length === 0) {
            const w = getWelcomeFlow(user, role);
            botSay(w.content, { delay: 400, chips: w.chips });
            setFlow('welcome');
        }
    }, [initialized]); // eslint-disable-line

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const textFlows = ['cutoff_search', 'counsellor_name', 'counsellor_phone'];
    useEffect(() => {
        if (textFlows.includes(flow)) setTimeout(() => inputRef.current?.focus(), 200);
    }, [flow]); // eslint-disable-line

    const handleSend = async () => {
        const trimmed = text.trim();
        if (!trimmed) return;

        if (!canContinue()) {
            addMessage({ role: 'user', content: trimmed });
            setText('');
            botSay("You've reached the free message limit.", {
                delay: 300,
                type: 'turn_limit',
            });
            return;
        }

        incrementGuestTurn();
        addMessage({ role: 'user', content: trimmed });
        setText('');
        await handleTextInput({
            text: trimmed,
            flow, flowData, setFlow, setFlowData,
            botSay, role, isSignedUp, user,
        });
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const showInput = textFlows.includes(flow) ||
        ['welcome', 'results', 'pricing', 'counsellor_done', null].includes(flow);

    const placeholder =
        flow === 'cutoff_search' ? 'Type college name...' :
        flow === 'counsellor_name' ? 'Your name...' :
        flow === 'counsellor_phone' ? 'Phone number...' :
        'Ask anything — colleges, cutoffs, streams...';

    const displayName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || null;
    const userInitial = (user?.user_metadata?.full_name || user?.email || '?').charAt(0).toUpperCase();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute bottom-20 right-0 w-[340px] sm:w-[380px] max-h-[600px] flex flex-col bg-[#0d1424] border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden"
            style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)' }}
        >
            {/* Header */}
            <div className="shrink-0 px-4 py-3 bg-gradient-to-r from-red-700 to-rose-700">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="text-white font-bold text-sm">Edu</p>
                            {role === 'premium' && (
                                <span className="flex items-center gap-0.5 text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded-full">
                                    <Crown className="w-2.5 h-2.5" /> PREMIUM
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                            <p className="text-red-100/80 text-[10px] truncate">
                                {displayName ? `Chatting as ${displayName}` : 'Admission Guide · Online'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <button onClick={resetChat} title="Reset" className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                            <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={onClose} className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Context / status strip */}
            <div className="shrink-0 px-4 py-1.5 bg-slate-900/80 border-b border-slate-800/60 flex items-center gap-2">
                {isSignedUp ? (
                    <>
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-[9px] font-black text-white border border-slate-500/30">
                            {userInitial}
                        </div>
                        <span className="text-slate-500 text-[10px] flex-1">
                            {role === 'premium' ? '⚡ Premium — all features unlocked' : 'Free plan · Upgrade for predictions'}
                        </span>
                        {role !== 'premium' && (
                            <a href="/pricing" className="text-[9px] font-bold text-red-400 hover:text-red-300 whitespace-nowrap">Upgrade →</a>
                        )}
                    </>
                ) : (
                    <>
                        <span className="text-slate-500 text-[10px] flex-1">
                            Guest · {turnsLeft > 0 ? `${turnsLeft} free message${turnsLeft !== 1 ? 's' : ''} left` : 'Limit reached'}
                        </span>
                        <button
                            onClick={() => openSignUp()}
                            className="text-[9px] font-bold text-red-400 hover:text-red-300 whitespace-nowrap transition-colors"
                        >
                            Sign up free →
                        </button>
                    </>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
                {messages.map((msg, idx) => (
                    <MessageBubble key={msg.id} msg={msg} isLatest={idx === messages.length - 1} />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="shrink-0 px-3 py-3 border-t border-slate-800/60 bg-[#0a111e]">
                {showInput ? (
                    <div className="flex items-center gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={text}
                            onChange={e => setText(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder={placeholder}
                            disabled={!isSignedUp && !canContinue()}
                            className="flex-1 bg-slate-800/80 border border-slate-700/60 text-white text-sm placeholder:text-slate-600 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500/50 focus:bg-slate-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        />
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={handleSend}
                            disabled={!text.trim() || (!isSignedUp && !canContinue())}
                            className="p-2.5 bg-gradient-to-br from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 disabled:opacity-30 text-white rounded-xl transition-all shadow-md shadow-red-900/30"
                        >
                            <Send className="w-4 h-4" />
                        </motion.button>
                    </div>
                ) : (
                    <p className="text-center text-slate-700 text-[10px] py-1">Select an option above ↑</p>
                )}
                <p className="text-center text-slate-800 text-[9px] mt-1.5">Edu · Edumetra Admission Guide</p>
            </div>
        </motion.div>
    );
}

// ── Floating trigger + first-visit greeting ──────────────────────────────────
export default function ChatbotWidget() {
    const { isOpen, setIsOpen, messages } = useChatbot();
    const [showGreeting, setShowGreeting] = useState(false);

    const hasMessages = messages.length > 0;

    useEffect(() => {
        if (localStorage.getItem(GREETED_KEY)) return;
        const timer = setTimeout(() => setShowGreeting(true), 6000);
        return () => clearTimeout(timer);
    }, []); // eslint-disable-line

    const handleGreetingClick = () => {
        localStorage.setItem(GREETED_KEY, '1');
        setShowGreeting(false);
        setIsOpen(true);
    };

    const handleGreetingDismiss = (e) => {
        e.stopPropagation();
        localStorage.setItem(GREETED_KEY, '1');
        setShowGreeting(false);
    };

    useEffect(() => {
        if (isOpen) {
            localStorage.setItem(GREETED_KEY, '1');
            setShowGreeting(false);
        }
    }, [isOpen]);

    return (
        <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-[60]">
            {/* Chat window — open to all (no sign-in gate) */}
            <AnimatePresence mode="wait">
                {isOpen && <ChatWindow key="chat" onClose={() => setIsOpen(false)} />}
            </AnimatePresence>

            {/* First-visit greeting bubble */}
            <AnimatePresence>
                {showGreeting && !isOpen && (
                    <motion.div
                        key="greeting"
                        initial={{ opacity: 0, y: 16, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                        onClick={handleGreetingClick}
                        className="absolute bottom-20 right-0 w-[230px] bg-[#0f1629] border border-slate-700/60 rounded-2xl shadow-2xl p-4 cursor-pointer hover:border-red-500/30 transition-colors group select-none"
                        style={{ boxShadow: '0 16px 40px rgba(0,0,0,0.55)' }}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-[11px] font-black text-white shadow">E</div>
                            <span className="text-white text-xs font-bold flex-1">Edu</span>
                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                            <button onClick={handleGreetingDismiss} className="text-slate-600 hover:text-slate-400 transition-colors rounded p-0.5 ml-1">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="bg-[#1e2a42] border border-slate-700/40 rounded-xl rounded-tl-sm px-3 py-2.5 text-[12px] text-slate-100 leading-relaxed mb-3">
                            👋 Hi! What are you looking for?
                            <br />
                            <span className="text-slate-400 text-[11px]">I can help find colleges, check cutoffs & plan your admission — free.</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-red-400 text-xs font-bold group-hover:text-red-300 transition-colors">Let's chat →</span>
                            <span className="text-slate-600 text-[10px]">No sign-in needed</span>
                        </div>
                        <div className="absolute -bottom-[9px] right-7 w-4 h-4 bg-[#0f1629] border-r border-b border-slate-700/60 rotate-45" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pulse ring */}
            {!isOpen && (
                <motion.div
                    className="absolute inset-0 rounded-full bg-red-500/25"
                    animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
                />
            )}

            {/* FAB */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setIsOpen(o => !o)}
                className="relative w-14 h-14 bg-gradient-to-br from-red-600 to-rose-700 rounded-full shadow-[0_8px_30px_rgba(220,38,38,0.45)] flex items-center justify-center border border-red-500/40"
                title="Admission Guide"
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                            <X className="w-6 h-6 text-white" />
                        </motion.span>
                    ) : (
                        <motion.span key="icon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                            <GraduationCap className="w-6 h-6 text-white" />
                        </motion.span>
                    )}
                </AnimatePresence>

                {!isOpen && hasMessages && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#070c1a] rounded-full" />
                )}
            </motion.button>

            {/* Tooltip before greeting */}
            <AnimatePresence>
                {!isOpen && !showGreeting && !hasMessages && !localStorage.getItem(GREETED_KEY) && (
                    <motion.div
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: 1.5 }}
                        className="absolute bottom-full mb-3 right-0 bg-[#0f1629] border border-slate-700/60 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-xl whitespace-nowrap pointer-events-none"
                    >
                        <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            Need admission guidance?
                        </span>
                        <div className="absolute bottom-0 right-5 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-700/60" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
