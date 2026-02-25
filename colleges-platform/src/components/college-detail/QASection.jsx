import { useState, useEffect } from 'react';
import { HelpCircle, Send, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSignup } from '../../contexts/SignupContext';

export function QASection({ collegeId }) {
    const { user, setShowModal } = useSignup();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newQuestion, setNewQuestion] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [answeringId, setAnsweringId] = useState(null);
    const [answerText, setAnswerText] = useState('');

    useEffect(() => { fetchQuestions(); }, [collegeId]);
    useEffect(() => {
        if (user) checkAdmin();
    }, [user]);

    const fetchQuestions = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('college_qa')
            .select('*')
            .eq('college_id', collegeId)
            .order('created_at', { ascending: false });
        setQuestions(data || []);
        setLoading(false);
    };

    const checkAdmin = async () => {
        const { data } = await supabase.from('admins').select('id').eq('id', user.id).single();
        setIsAdmin(!!data);
    };

    const handleAsk = async () => {
        if (!user) { setShowModal(true); return; }
        if (!newQuestion.trim() || submitting) return;
        setSubmitting(true);
        await supabase.from('college_qa').insert({
            college_id: collegeId,
            user_id: user.id,
            user_name: user.user_metadata?.full_name || 'Anonymous',
            question: newQuestion.trim(),
        });
        setNewQuestion('');
        await fetchQuestions();
        setSubmitting(false);
    };

    const handleAnswer = async (questionId) => {
        if (!answerText.trim()) return;
        await supabase.from('college_qa').update({
            answer: answerText.trim(),
            answered_by: user.user_metadata?.full_name || 'Admin',
            answered_at: new Date().toISOString(),
        }).eq('id', questionId);
        setAnsweringId(null);
        setAnswerText('');
        await fetchQuestions();
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Questions & Answers</h2>

            {/* Ask a question */}
            <div className="flex gap-3">
                <div className="flex-1 flex gap-2">
                    <input
                        value={newQuestion}
                        onChange={e => setNewQuestion(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAsk()}
                        placeholder={user ? "Ask a question about this college..." : "Sign in to ask a question"}
                        disabled={!user}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                        onClick={user ? handleAsk : () => setShowModal(true)}
                        disabled={submitting || (!user ? false : !newQuestion.trim())}
                        className="px-4 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white rounded-xl font-semibold text-sm transition-all flex items-center gap-2"
                    >
                        <Send className="w-4 h-4" />{submitting ? '...' : 'Ask'}
                    </button>
                </div>
            </div>

            {/* Q&A List */}
            {loading ? (
                [...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-900 rounded-xl animate-pulse" />)
            ) : questions.length === 0 ? (
                <div className="text-center py-12 text-slate-600">
                    <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No questions yet. Be the first to ask!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {questions.map(q => (
                        <div key={q.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
                            {/* Question */}
                            <div className="flex items-start gap-3 mb-3">
                                <div className="p-2 bg-red-500/10 rounded-xl shrink-0">
                                    <HelpCircle className="w-4 h-4 text-red-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-semibold text-sm">{q.question}</p>
                                    <p className="text-slate-600 text-xs mt-0.5">
                                        {q.user_name} · {new Date(q.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {/* Answer */}
                            {q.answer ? (
                                <div className="ml-11 bg-slate-800/60 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <User className="w-3 h-3 text-emerald-400" />
                                        <span className="text-emerald-400 text-xs font-bold">{q.answered_by || 'College Representative'}</span>
                                        {q.answered_at && <span className="text-slate-600 text-xs">· {new Date(q.answered_at).toLocaleDateString()}</span>}
                                    </div>
                                    <p className="text-slate-300 text-sm">{q.answer}</p>
                                </div>
                            ) : isAdmin ? (
                                <div className="ml-11 mt-2">
                                    {answeringId === q.id ? (
                                        <div className="flex gap-2">
                                            <textarea
                                                rows={2}
                                                value={answerText}
                                                onChange={e => setAnswerText(e.target.value)}
                                                placeholder="Write your answer..."
                                                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/40 resize-none"
                                            />
                                            <div className="flex flex-col gap-1">
                                                <button onClick={() => handleAnswer(q.id)} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors">Post</button>
                                                <button onClick={() => setAnsweringId(null)} className="px-3 py-1 bg-slate-700 text-slate-300 text-xs rounded-lg hover:bg-slate-600 transition-colors">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button onClick={() => { setAnsweringId(q.id); setAnswerText(''); }} className="text-xs text-slate-500 hover:text-emerald-400 font-medium transition-colors">
                                            + Answer this question
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <p className="ml-11 text-slate-600 text-xs italic">Awaiting response...</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
