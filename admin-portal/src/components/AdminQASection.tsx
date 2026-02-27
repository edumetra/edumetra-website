"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { HelpCircle, User, CheckCircle, Trash2, Send } from "lucide-react";

type Question = {
    id: string;
    question: string;
    answer: string | null;
    user_name: string | null;
    answered_by: string | null;
    created_at: string;
    answered_at: string | null;
};

export default function AdminQASection({ collegeId }: { collegeId: string }) {
    const supabase = createClient();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [answeringId, setAnsweringId] = useState<string | null>(null);
    const [answerText, setAnswerText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchQuestions = async () => {
        setLoading(true);
        const { data } = await supabase
            .from("college_qa" as any)
            .select("*")
            .eq("college_id", collegeId)
            .order("created_at", { ascending: false });

        setQuestions(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchQuestions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collegeId]);

    const handleAnswer = async (id: string) => {
        if (!answerText.trim() || submitting) return;
        setSubmitting(true);

        const { error } = await (supabase
            .from("college_qa") as any)
            .update({
                answer: answerText.trim(),
                answered_by: "Admin",
                answered_at: new Date().toISOString()
            })
            .eq("id", id);

        if (!error) {
            setAnswerText("");
            setAnsweringId(null);
            fetchQuestions();
        } else {
            alert("Failed to submit answer. " + error.message);
        }
        setSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this question?")) return;

        const { error } = await supabase
            .from("college_qa" as any)
            .delete()
            .eq("id", id);

        if (!error) {
            setQuestions(prev => prev.filter(q => q.id !== id));
        } else {
            alert("Failed to delete question. " + error.message);
        }
    };

    if (loading) {
        return <div className="animate-pulse bg-slate-900 border border-slate-800 rounded-xl h-48 w-full p-6" />;
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-400" />
                Manage Questions & Answers
            </h2>

            {questions.length === 0 ? (
                <div className="text-center py-12 border border-slate-800 border-dashed rounded-xl bg-slate-950/50">
                    <HelpCircle className="w-8 h-8 mx-auto mb-3 text-slate-600" />
                    <p className="text-slate-400 font-medium text-sm">No questions asked for this college yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {questions.map((q) => (
                        <div key={q.id} className="bg-slate-950/50 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
                            {/* Header / Question Info */}
                            <div className="flex justify-between items-start gap-4 mb-3">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-slate-800 rounded-lg shrink-0">
                                        <User className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">{q.user_name || "Anonymous User"}</p>
                                        <p className="text-xs text-slate-500">{new Date(q.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(q.id)}
                                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
                                    title="Delete Question"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <p className="text-slate-300 font-medium mb-4">{q.question}</p>

                            {/* Answer Section */}
                            {q.answer ? (
                                <div className="ml-11 bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                            <span className="text-xs font-bold text-emerald-400">Answered by {q.answered_by}</span>
                                        </div>
                                        <button
                                            onClick={() => { setAnsweringId(q.id); setAnswerText(q.answer || ""); }}
                                            className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                                        >
                                            Edit Answer
                                        </button>
                                    </div>
                                    <p className="text-sm text-slate-400 leading-relaxed font-mono">{q.answer}</p>
                                </div>
                            ) : (
                                <div className="ml-11">
                                    {answeringId === q.id ? (
                                        <div className="bg-slate-900 border border-slate-700 rounded-lg p-1 focus-within:border-blue-500/50 transition-colors">
                                            <textarea
                                                rows={3}
                                                value={answerText}
                                                onChange={e => setAnswerText(e.target.value)}
                                                placeholder="Write your official answer here..."
                                                className="w-full bg-transparent px-3 py-2 text-sm text-white focus:outline-none resize-none placeholder-slate-600"
                                            />
                                            <div className="flex justify-end gap-2 p-2 border-t border-slate-800/60 mt-1">
                                                <button
                                                    onClick={() => { setAnsweringId(null); setAnswerText(""); }}
                                                    className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleAnswer(q.id)}
                                                    disabled={!answerText.trim() || submitting}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white text-xs font-bold rounded shadow-lg transition-colors"
                                                >
                                                    <Send className="w-3.5 h-3.5" /> {submitting ? "Posting..." : "Post Answer"}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => { setAnsweringId(q.id); setAnswerText(""); }}
                                            className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg text-xs font-bold transition-colors w-fit"
                                        >
                                            <HelpCircle className="w-3.5 h-3.5" /> Needs Answer
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
