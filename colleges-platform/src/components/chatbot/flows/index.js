import { searchCollegesByStreamAndState, searchCollegeByName, getCollegeCutoffs, saveCounsellingRequest } from './collegeSearch';
import { categorizePrediction, canUserPredict, PREDICTION_LEVELS } from '../../predictor/predictorEngine';

const EXAMS = [
    { id: 'jee_main', label: 'JEE Main', field: 'Percentile (0–100)', min: 0, max: 100, unit: '%ile' },
    { id: 'jee_advanced', label: 'JEE Advanced', field: 'Rank', min: 1, max: 250000, unit: 'rank' },
    { id: 'neet', label: 'NEET', field: 'Score (0–720)', min: 0, max: 720, unit: 'marks' },
    { id: 'cat', label: 'CAT', field: 'Percentile (0–100)', min: 0, max: 100, unit: '%ile' },
    { id: 'clat', label: 'CLAT', field: 'Score (0–150)', min: 0, max: 150, unit: 'marks' },
    { id: 'cuet', label: 'CUET', field: 'Score (0–800)', min: 0, max: 800, unit: 'marks' },
];

const STREAMS = ['Engineering', 'Medical', 'Management', 'Law', 'Arts & Science', 'Commerce'];
const STATES = ['Maharashtra', 'Karnataka', 'Delhi', 'Tamil Nadu', 'Telangana', 'Rajasthan', 'UP', 'Gujarat', 'Any State'];

// ── NLP-lite: extract stream and state from free text ────────────────────────
const STREAM_KEYWORDS = {
    Engineering: ['engineer', 'btech', 'b.tech', 'jee', 'iit', 'nit', 'cs', 'computer', 'mechanical', 'electrical'],
    Medical: ['mbbs', 'medical', 'neet', 'bds', 'doctor', 'medicine', 'dental', 'pharmacy'],
    Management: ['mba', 'management', 'bba', 'business', 'commerce', 'finance', 'marketing'],
    Law: ['law', 'llb', 'legal', 'clat', 'advocate', 'judiciary'],
    'Arts & Science': ['arts', 'science', 'bsc', 'ba ', 'humanities', 'physics', 'chemistry', 'biology'],
};

const STATE_KEYWORDS = {
    Maharashtra: ['maharashtra', 'mumbai', 'pune', 'nagpur', 'nashik'],
    Karnataka: ['karnataka', 'bangalore', 'bengaluru', 'mysore', 'hubli'],
    Delhi: ['delhi', 'new delhi', 'ncr'],
    'Tamil Nadu': ['tamil', 'chennai', 'tamilnadu', 'coimbatore', 'madurai'],
    Telangana: ['telangana', 'hyderabad', 'secunderabad'],
    Rajasthan: ['rajasthan', 'jaipur', 'jodhpur', 'kota'],
    UP: ['uttar pradesh', 'up', 'lucknow', 'kanpur', 'varanasi', 'allahabad'],
    Gujarat: ['gujarat', 'ahmedabad', 'surat', 'vadodara'],
};

export function detectIntent(text) {
    const lower = text.toLowerCase();
    let stream = null;
    let state = null;

    for (const [s, kws] of Object.entries(STREAM_KEYWORDS)) {
        if (kws.some(kw => lower.includes(kw))) { stream = s; break; }
    }
    for (const [st, kws] of Object.entries(STATE_KEYWORDS)) {
        if (kws.some(kw => lower.includes(kw))) { state = st; break; }
    }

    const isFindIntent = /college|university|institute|admission|find|suggest|show me|best|top/.test(lower);
    const isCutoffIntent = /cutoff|rank|score|marks|percentile|merit/.test(lower);
    const isCounsellorIntent = /counsel|talk|call|help me|guide|advisor|expert|speak/.test(lower);
    const isPricingIntent = /price|plan|premium|upgrade|pricing|cost|pay/.test(lower);

    return { stream, state, isFindIntent, isCutoffIntent, isCounsellorIntent, isPricingIntent };
}

// ── Personalised greeting ─────────────────────────────────────────────────────
export function getWelcomeFlow(user, role) {
    const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || null;
    const greeting = firstName ? `Hey ${firstName}! 👋` : 'Hi there! 👋';
    const premiumNote = role === 'premium' ? '\n\n✨ As a Premium member, you have full access including cutoff predictions.' : '';

    return {
        content: `${greeting} I'm Edu 🎓 — your personal admission guide.\n\nI can help you find colleges, check cutoffs, compare plans, or book a counselling call.${premiumNote}\n\nWhat are you looking for?`,
        chips: [
            {
                label: 'Find Colleges',
                emoji: '🏫',
                action: ({ botSay, setFlow }) => {
                    setFlow('stream_select');
                    botSay('Which stream are you targeting?', {
                        delay: 600,
                        chips: STREAMS.map(s => ({
                            label: s,
                            action: ({ botSay, setFlow, setFlowData }) => {
                                setFlowData({ stream: s });
                                setFlow('state_select');
                                botSay(`${s} — great choice! 🙌 Preferred state?`, {
                                    delay: 600,
                                    chips: STATES.map(st => ({
                                        label: st,
                                        action: ({ botSay, setFlow, setFlowData, flowData }) => {
                                            runCollegeSearch({ stream: flowData.stream || s, state: st, botSay, setFlow, setFlowData });
                                        },
                                    })),
                                });
                            },
                        })),
                    });
                },
            },
            {
                label: 'Check Cutoffs',
                emoji: '📊',
                action: startCutoffFlow,
            },
            {
                label: 'Compare Plans',
                emoji: '💎',
                action: ({ botSay, setFlow }) => {
                    setFlow('pricing');
                    botSay("Here's how our plans compare:", { delay: 500, type: 'pricing' });
                    setTimeout(() => {
                        botSay('Questions about Premium?', {
                            delay: 1200,
                            chips: [
                                {
                                    label: "What's included?",
                                    action: ({ botSay }) => botSay(
                                        '⚡ Premium gives you:\n• Unlimited college views\n• Full cutoff data\n• Admission predictions\n• Priority counselling\n\nAll from ₹499/month.',
                                        { delay: 500 }
                                    )
                                },
                                { label: '← Main Menu', action: (ctx) => reloadWelcome({ ...ctx, user, role }) },
                            ],
                        });
                    }, 1500);
                },
            },
            {
                label: 'Talk to Counsellor',
                emoji: '👨‍💼',
                action: startCounsellorFlow,
            },
            {
                label: 'Predict My Chances',
                emoji: '🎯',
                action: startPredictorFlow,
            },
        ],
    };
}

// ── College search runner ─────────────────────────────────────────────────────
async function runCollegeSearch({ stream, state, botSay, setFlow, setFlowData }) {
    const resolvedState = state === 'Any State' ? null : state;
    setFlowData(prev => ({ ...prev, state }));
    setFlow('results');
    botSay(`Searching for ${stream} colleges${resolvedState ? ` in ${resolvedState}` : ' across India'}...`, { delay: 400 });
    const colleges = await searchCollegesByStreamAndState(stream, resolvedState);

    if (colleges.length === 0) {
        botSay(`Couldn't find ${stream} colleges${resolvedState ? ` in ${resolvedState}` : ''}. Try a different state.`, {
            delay: 800,
            chips: [
                { label: 'Try Any State', action: (ctx) => runCollegeSearch({ stream, state: 'Any State', ...ctx }) },
                { label: '← Main Menu', action: reloadWelcome },
            ],
        });
        return;
    }

    botSay(`Found ${colleges.length} ${stream} colleges${resolvedState ? ` in ${resolvedState}` : ''}:`, {
        delay: 800,
        colleges,
    });

    setTimeout(() => {
        botSay('Want to dig deeper?', {
            delay: 1400,
            chips: [
                { label: 'Check Cutoffs', emoji: '📊', action: startCutoffFlow },
                { label: 'New Search', emoji: '🔄', action: reloadWelcome },
                { label: 'Talk to Counsellor', emoji: '👨‍💼', action: startCounsellorFlow },
            ],
        });
    }, 2000);
}

// ── Cutoff flow ──────────────────────────────────────────────────────────────
export function startCutoffFlow({ botSay, setFlow }) {
    setFlow('cutoff_search');
    botSay('Type the name of the college (or part of it) and I\'ll pull up the cutoffs:', {
        delay: 600,
        inputMode: 'text',
    });
}

// ── Predictor flow ──────────────────────────────────────────────────────────
export function startPredictorFlow({ botSay, role, setFlow }) {
    if (role === 'free' || !role) {
        botSay("Predicting your admission chances is a Premium feature. It helps you identify Safe, Moderate, and Risky colleges based on your rank.", {
            delay: 500,
            type: 'premium_gate'
        });
        return;
    }

    setFlow('predictor_exam');
    botSay("I'll help you predict your chances! 🎯\n\nWhich entrance exam did you appear for?", {
        delay: 600,
        chips: EXAMS.map(e => ({
            label: e.label,
            action: ({ botSay, setFlow, setFlowData }) => {
                setFlowData({ examId: e.id, examLabel: e.label, field: e.field, unit: e.unit });
                setFlow('predictor_score');
                botSay(`Excellent! What was your ${e.field}?`, { delay: 400, inputMode: 'text' });
            }
        }))
    });
}

// ── Counsellor flow ──────────────────────────────────────────────────────────
export function startCounsellorFlow({ botSay, setFlow, setFlowData }) {
    setFlow('counsellor_name');
    setFlowData({});
    botSay(`I'll connect you with our expert counselling team! 🎯\n\nFirst, what's your name?`, {
        delay: 500,
        inputMode: 'text',
    });
}

// ── Reload welcome ────────────────────────────────────────────────────────────
export function reloadWelcome({ botSay, setFlow, user, role }) {
    setFlow('welcome');
    const welcome = getWelcomeFlow(user, role);
    botSay(welcome.content, { delay: 300, chips: welcome.chips });
}

// ── Handle free-text input ────────────────────────────────────────────────────
export async function handleTextInput({
    text, flow, flowData, setFlow, setFlowData, botSay, role, isSignedUp, user
}) {
    // ── 1. Cutoff search ───────────────────────────────────────────────────
    if (flow === 'cutoff_search') {
        botSay(`Looking up "${text}"...`, { delay: 300 });
        const colleges = await searchCollegeByName(text);
        if (colleges.length === 0) {
            botSay(`No college matched "${text}". Try a shorter or different name.`, {
                delay: 700,
                chips: [
                    { label: 'Try again', action: startCutoffFlow },
                    { label: '← Main Menu', action: (ctx) => reloadWelcome({ ...ctx, user, role }) },
                ],
            });
            return;
        }
        botSay('Tap a college to see its cutoffs:', {
            delay: 700,
            chips: colleges.map(c => ({
                label: c.name.length > 32 ? c.name.slice(0, 32) + '…' : c.name,
                action: async ({ botSay, role, setFlow }) => {
                    botSay(`Fetching cutoffs for ${c.name}...`, { delay: 300 });
                    const data = await getCollegeCutoffs(c.id);
                    if (data) {
                        botSay(null, {
                            delay: 800,
                            cutoffs: data.cutoffs || [],
                            collegeName: data.name,
                            exams: data.exams,
                        });
                        setTimeout(() => {
                            if (role !== 'premium') {
                                botSay('Want to predict your admission probability for this college?', {
                                    delay: 1000,
                                    type: 'premium_gate',
                                });
                            } else {
                                botSay('💡 Based on historical data, students in the top 15% of their exam rank have a strong admission probability here.', { delay: 1000 });
                            }
                            setTimeout(() => {
                                botSay('Anything else?', {
                                    delay: 1600,
                                    chips: [
                                        { label: 'Find Colleges', emoji: '🏫', action: (ctx) => reloadWelcome({ ...ctx, user, role }) },
                                        { label: 'Talk to Counsellor', emoji: '👨‍💼', action: startCounsellorFlow },
                                        { label: '← Main Menu', action: (ctx) => reloadWelcome({ ...ctx, user, role }) },
                                    ],
                                });
                            }, role === 'premium' ? 1500 : 2200);
                        }, 1000);
                    }
                },
            })),
        });
        return;
    }

    // ── 2. Counsellor — name ───────────────────────────────────────────────
    if (flow === 'counsellor_name') {
        setFlowData({ name: text });
        setFlow('counsellor_phone');
        botSay(`Great to meet you, ${text}! 😊\n\nWhat's the best number to reach you on?`, { delay: 600, inputMode: 'text' });
        return;
    }

    // ── 3. Counsellor — phone ──────────────────────────────────────────────
    if (flow === 'counsellor_phone') {
        const phone = text.replace(/\D/g, '');
        if (phone.length < 10) {
            botSay('That doesn\'t look right — please enter a valid 10-digit number.', { delay: 400, inputMode: 'text' });
            return;
        }
        setFlow('counsellor_done');
        const success = await saveCounsellingRequest({
            name: flowData.name || 'Unknown',
            phone: text,
            userId: user?.id || null,
            query: 'Chatbot counselling request',
        });
        if (success) {
            botSay(`Perfect, ${flowData.name}!`, {
                delay: 500,
                type: 'success',
                successText: 'Our counselling team will call you within 24 hours. 🎉',
            });
        } else {
            botSay('Something went wrong saving your request. Please email us directly.', { delay: 500 });
        }
        setTimeout(() => {
            botSay('Is there anything else I can help with?', {
                delay: 1400,
                chips: [
                    { label: 'Find Colleges', emoji: '🏫', action: (ctx) => reloadWelcome({ ...ctx, user, role }) },
                    { label: 'Check Cutoffs', emoji: '📊', action: startCutoffFlow },
                ],
            });
        }, 1800);
        return;
    }

    // ── 4. Predictor — score ──────────────────────────────────────────────
    if (flow === 'predictor_score') {
        const score = parseFloat(text);
        if (isNaN(score)) {
            botSay(`Please enter a valid number for your ${flowData.field}.`, { delay: 400, inputMode: 'text' });
            return;
        }

        botSay(`Analyzing top colleges for your ${flowData.examLabel} score of ${score}... ⏳`, { delay: 500 });
        setFlow('predictor_results');

        const { data } = await searchCollegesByStreamAndState('Engineering', null); // Default to Eng for now or use user's target
        const results = (data || []).map(c => ({
            ...c,
            prediction: categorizePrediction(c, flowData.examId, score)
        })).filter(r => r.prediction.label !== 'Open').slice(0, 10);

        if (results.length === 0) {
            botSay(`I couldn't find any colleges with cutoff data for ${flowData.examLabel} yet.`, {
                delay: 1000,
                chips: [
                    { label: 'Try another exam', action: startPredictorFlow },
                    { label: '← Main Menu', action: (ctx) => reloadWelcome({ ...ctx, user, role }) },
                ]
            });
            return;
        }

        botSay(`Based on your score, here are some predictions:`, {
            delay: 1200,
            type: 'predictions',
            predictions: results
        });

        setTimeout(() => {
            botSay("Want to see the full list with Safe/Moderate/Risky categories?", {
                delay: 1800,
                chips: [
                    { label: 'View Full Predictor', action: () => window.location.href = '/rank-predictor' },
                    { label: '← Main Menu', action: (ctx) => reloadWelcome({ ...ctx, user, role }) },
                ]
            });
        }, 2200);
        return;
    }

    // ── 5. NLP-lite fallback — try to extract intent from free text ─────────
    const intent = detectIntent(text);

    if (intent.isCounsellorIntent) {
        startCounsellorFlow({ botSay, setFlow, setFlowData });
        return;
    }
    if (intent.isPricingIntent) {
        botSay("Here's how our plans compare:", { delay: 400, type: 'pricing' });
        return;
    }
    if (intent.isCutoffIntent) {
        startCutoffFlow({ botSay, setFlow });
        return;
    }
    if ((intent.stream || intent.state) && intent.isFindIntent) {
        const stream = intent.stream || 'Engineering';
        const state = intent.state || null;
        botSay(`Got it! Looking for ${stream} colleges${state ? ` in ${state}` : ''}...`, { delay: 400 });
        await runCollegeSearch({ stream, state: state || 'Any State', botSay, setFlow, setFlowData });
        return;
    }

    // Final fallback
    botSay(`I'm not sure I understand, but I can help you with these:`, {
        delay: 400,
        chips: getWelcomeFlow(user, role).chips,
    });
}
