"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { X, Send, Trash2, Loader2, CheckCircle2, MessageSquare } from "lucide-react";

type Review = {
    id: string;
    user_name: string | null;
    title: string | null;
    review_text: string | null;
    rating: number;
    admin_reply?: string | null;
    admin_reply_at?: string | null;
    colleges?: { name: string } | null;
};

type Props = {
    review: Review;
    onClose: () => void;
    onSaved: (id: string, reply: string | null) => void;
};

export default function ReviewReplyModal({ review, onClose, onSaved }: Props) {
    const supabase = createClient();
    const [reply, setReply] = useState(review.admin_reply ?? "");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        if (!reply.trim()) return;
        setSaving(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from("reviews") as any).update({
            admin_reply: reply.trim(),
            admin_reply_at: new Date().toISOString(),
        }).eq("id", review.id);
        if (!error) {
            onSaved(review.id, reply.trim());
            setSaved(true);
            setTimeout(() => { setSaved(false); onClose(); }, 900);
        }
        setSaving(false);
    };

    const handleClear = async () => {
        if (!confirm("Remove this admin reply? Users will no longer see a response.")) return;
        setSaving(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from("reviews") as any).update({
            admin_reply: null,
            admin_reply_at: null,
        }).eq("id", review.id);
        if (!error) {
            onSaved(review.id, null);
            onClose();
        }
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-white font-bold text-lg">
                        <MessageSquare className="w-5 h-5 text-red-400" />
                        {review.admin_reply ? "Edit Admin Reply" : "Write Admin Reply"}
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Original review context */}
                    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-sm space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-semibold text-xs uppercase tracking-wider">
                                {review.colleges?.name ?? "Unknown College"}
                            </span>
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <span key={i} className={i <= review.rating ? "text-amber-400" : "text-slate-700"}>★</span>
                                ))}
                            </div>
                        </div>
                        {review.title && <p className="font-semibold text-white">{review.title}</p>}
                        <p className="text-slate-400 leading-relaxed line-clamp-3">{review.review_text ?? "—"}</p>
                        <p className="text-slate-600 text-xs">— {review.user_name ?? "Anonymous"}</p>
                    </div>

                    {/* Reply box */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Your Public Response
                        </label>
                        <textarea
                            rows={5}
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            placeholder="Write a professional response that will appear publicly under this review..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/40 resize-none transition-all"
                        />
                        <p className="text-xs text-slate-600 mt-1.5">{reply.length} characters · This reply is publicly visible to users.</p>
                    </div>

                    {saved && (
                        <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                            <CheckCircle2 className="w-4 h-4" /> Saved!
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-1">
                        {review.admin_reply && (
                            <button onClick={handleClear} disabled={saving}
                                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-colors disabled:opacity-50">
                                <Trash2 className="w-3.5 h-3.5" /> Remove Reply
                            </button>
                        )}
                        <button onClick={onClose} className="px-5 py-2 text-slate-400 hover:text-white text-sm font-semibold transition-colors ml-auto">
                            Cancel
                        </button>
                        <button onClick={handleSave} disabled={saving || !reply.trim()}
                            className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            {saving ? "Saving..." : "Publish Reply"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
