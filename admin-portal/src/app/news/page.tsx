"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { FileText, Plus, Edit2, Trash2, Calendar, Tag, Image as ImageIcon } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import ArticleImageUpload from "@/components/ArticleImageUpload";
import ArticleAttachmentUpload from "@/components/ArticleAttachmentUpload";

type NewsItem = {
    id: string;
    title: string;
    content: string;
    image_url: string | null;
    tags: string[] | null;
    published_at: string;
    created_at: string;
    updated_at: string;
    is_subscriber_only: boolean;
};

export default function NewsPage() {
    const supabase = createClient();
    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
    
    // Form State
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        image_url: '',
        tagsString: '',
        is_subscriber_only: false
    });
    const [useAutoDate, setUseAutoDate] = useState(true);
    const [customDate, setCustomDate] = useState('');

    const fetchNews = async () => {
        setLoading(true);
        setError(null);
        const { data, error: fetchErr } = await supabase
            .from("news_updates")
            .select("*")
            .order("published_at", { ascending: false });

        if (fetchErr) setError("Failed to load news updates.");
        else setNewsItems(data || []);
        setLoading(false);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchNews(); }, []);

    const formatDatetimeLocal = (dateString: string) => {
        const d = new Date(dateString);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
    };

    const handleOpenModal = (news?: NewsItem) => {
        setError(null);
        if (news) {
            setEditingNews(news);
            setFormData({
                title: news.title,
                content: news.content,
                image_url: news.image_url || '',
                tagsString: news.tags ? news.tags.join(', ') : '',
                is_subscriber_only: news.is_subscriber_only || false
            });
            setUseAutoDate(false); // When editing, default to keeping existing date unless changed
            setCustomDate(formatDatetimeLocal(news.published_at));
        } else {
            setEditingNews(null);
            setFormData({ title: '', content: '', image_url: '', tagsString: '', is_subscriber_only: false });
            setUseAutoDate(true);
            setCustomDate(formatDatetimeLocal(new Date().toISOString()));
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading("saving");
        setError(null);

        // Process tags
        const tags = formData.tagsString
            .split(',')
            .map(t => t.trim())
            .filter(t => t.length > 0);

        // Determine pub date
        const pubDate = useAutoDate ? new Date().toISOString() : new Date(customDate).toISOString();

        const payload = {
            title: formData.title,
            content: formData.content,
            image_url: formData.image_url || null,
            tags: tags.length > 0 ? tags : null,
            published_at: pubDate,
            is_subscriber_only: formData.is_subscriber_only
        };

        if (editingNews) {
            const { data, error: updateErr } = await (supabase
                .from("news_updates") as any)
                .update(payload)
                .eq("id", editingNews.id)
                .select()
                .single();
                
            if (updateErr) setError(updateErr.message);
            else {
                setNewsItems(prev => prev.map(n => n.id === data.id ? data : n).sort((a,b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()));
                setIsModalOpen(false);
            }
        } else {
            const { data, error: insertErr } = await (supabase
                .from("news_updates") as any)
                .insert([payload])
                .select()
                .single();
                
            if (insertErr) setError(insertErr.message);
            else {
                setNewsItems(prev => [data, ...prev].sort((a,b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()));
                setIsModalOpen(false);
            }
        }
        setActionLoading(null);
    };

    const handleDelete = async (id: string, title: string) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
        setActionLoading(id);
        const { error: delErr } = await supabase.from("news_updates").delete().eq("id", id);
        if (!delErr) {
            setNewsItems(prev => prev.filter(n => n.id !== id));
        } else {
            alert(delErr.message);
        }
        setActionLoading(null);
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">News & Updates</h1>
                    <p className="text-slate-400 text-sm">Manage dynamic announcements for the Colleges Platform homepage.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors w-fit shadow-lg shadow-blue-900/20"
                >
                    <Plus className="w-5 h-5" /> Add News
                </button>
            </div>

            {error && !isModalOpen && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm">
                    ⚠️ {error}
                </div>
            )}

            {/* Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-800">
                        <thead className="bg-slate-950/50">
                            <tr>
                                {["Title & Image", "Tags", "Published Date", "Actions"].map(h => (
                                    <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {loading ? (
                                <tr><td colSpan={4} className="py-12 text-center text-slate-500">Loading news...</td></tr>
                            ) : newsItems.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center">
                                        <FileText className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                                        <p className="text-slate-400 font-medium">No news updates yet</p>
                                    </td>
                                </tr>
                            ) : newsItems.map(news => (
                                <tr key={news.id} className="hover:bg-slate-800/40 transition-colors">
                                    <td className="px-5 py-4 min-w-[300px]">
                                        <div className="flex gap-4 items-center">
                                            {news.image_url ? (
                                                <img src={news.image_url} alt="" className="w-16 h-12 object-cover rounded shadow border border-slate-700" />
                                            ) : (
                                                <div className="w-16 h-12 bg-slate-800 rounded border border-slate-700 flex items-center justify-center">
                                                    <ImageIcon className="w-5 h-5 text-slate-600" />
                                                </div>
                                            )}
                                            <div>
                                                <div className="text-sm font-semibold text-slate-200 line-clamp-2">{news.title}</div>
                                                {news.is_subscriber_only && (
                                                    <span className="inline-block mt-1 text-[10px] uppercase font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                                                        Subscribers Only
                                                    </span>
                                                )}
                                                {!news.is_subscriber_only && (
                                                    <span className="inline-block mt-1 text-[10px] uppercase font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                                                        Free for All
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                                            {news.tags && news.tags.length > 0 ? news.tags.map(tag => (
                                                <span key={tag} className="text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                                                    {tag}
                                                </span>
                                            )) : <span className="text-slate-500 text-xs">—</span>}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-slate-400 whitespace-nowrap">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4 text-slate-500" />
                                            {new Date(news.published_at).toLocaleString('en-US', {
                                                month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleOpenModal(news)}
                                                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                                                title="Edit News"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(news.id, news.title)}
                                                disabled={actionLoading === news.id}
                                                className="p-2 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 border border-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                                                title="Delete News"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Editor Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex justify-center items-start pt-10 px-4 overflow-y-auto pb-20">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden mt-10">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">
                                {editingNews ? 'Edit News Update' : 'New Announcement'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white pb-1 w-8 h-8 rounded hover:bg-slate-800 flex items-center justify-center font-bold text-xl">
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {error && (
                                <div className="col-span-1 md:col-span-2 bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Headline / Title *</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                                        placeholder="JEE Advanced Results Announced..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Feature Image</label>
                                    <ArticleImageUpload
                                        value={formData.image_url}
                                        onChange={(url) => setFormData({ ...formData, image_url: url })}
                                        disabled={actionLoading === "saving"}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Tags (Comma separated)</label>
                                    <div className="relative">
                                        <Tag className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                                        <input
                                            type="text"
                                            value={formData.tagsString}
                                            onChange={e => setFormData({ ...formData, tagsString: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
                                            placeholder="Exams, Admissions, Alerts"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">Used for filtering on the News & Updates page.</p>
                                </div>
                                
                                <div className="pt-2">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Access Level *</label>
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer p-3 border border-slate-700 rounded-lg bg-slate-950/50 hover:bg-slate-800 flex-1 transition-colors">
                                            <input
                                                type="radio"
                                                name="access_level"
                                                checked={!formData.is_subscriber_only}
                                                onChange={() => setFormData({ ...formData, is_subscriber_only: false })}
                                                className="w-4 h-4 accent-blue-500"
                                            />
                                            <span className="text-sm font-medium text-slate-200">Free for All</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer p-3 border border-slate-700 rounded-lg bg-slate-950/50 hover:bg-slate-800 flex-1 transition-colors">
                                            <input
                                                type="radio"
                                                name="access_level"
                                                checked={formData.is_subscriber_only}
                                                onChange={() => setFormData({ ...formData, is_subscriber_only: true })}
                                                className="w-4 h-4 accent-amber-500"
                                            />
                                            <span className="text-sm font-medium text-slate-200">Subscribers Only</span>
                                        </label>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">
                                        Free for all: Viewable by any signed-up user.<br/>
                                        Subscribers only: Requires an active premium subscription.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 flex flex-col">
                                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={useAutoDate}
                                            onChange={e => setUseAutoDate(e.target.checked)}
                                            className="w-4 h-4 accent-blue-500 rounded border-slate-700 bg-slate-950"
                                        />
                                        <span className="font-medium text-slate-300 text-sm">Use current date and time automatically</span>
                                    </label>
                                    
                                    {!useAutoDate && (
                                        <div className="mt-4 pt-4 border-t border-slate-800">
                                            <label className="block text-sm font-medium text-slate-400 mb-1">Custom Publish Date</label>
                                            <input
                                                type="datetime-local"
                                                required={!useAutoDate}
                                                value={customDate}
                                                onChange={e => setCustomDate(e.target.value)}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 text-sm [color-scheme:dark]"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col h-full min-h-[300px]">
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-sm font-medium text-slate-300">Article Content *</label>
                                        <ArticleAttachmentUpload 
                                            onUploadSuccess={(url, filename) => {
                                                const attachmentHtml = `<p><br/><a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: underline; font-weight: 500;">📎 Download: ${filename}</a><br/></p>`;
                                                setFormData(prev => ({ ...prev, content: prev.content + attachmentHtml }));
                                            }} 
                                            disabled={actionLoading === "saving"} 
                                        />
                                    </div>
                                    <div className="flex-1 pb-10">
                                        <RichTextEditor
                                            value={formData.content}
                                            onChange={(val) => setFormData({ ...formData, content: val })}
                                            placeholder="Write the full news announcement here..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2 pt-4 flex gap-3 -mx-6 px-6 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading === "saving"}
                                    className="px-6 py-2.5 rounded-lg font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors ml-auto flex items-center gap-2"
                                >
                                    {actionLoading === "saving" ? "Saving..." : (editingNews ? "Save Changes" : "Publish News")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
