"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { FileText, Plus, Edit2, Trash2, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";

type Article = {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    image_url: string;
    published: boolean;
    author: string;
    created_at: string;
    updated_at: string;
};

export default function ArticlesPage() {
    const supabase = createClient();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        author: '',
        image_url: '',
        published: false
    });

    const fetchArticles = async () => {
        setLoading(true);
        setError(null);
        const { data, error: fetchErr } = await supabase
            .from("articles")
            .select("*")
            .order("created_at", { ascending: false });

        if (fetchErr) setError("Failed to load articles.");
        else setArticles(data || []);
        setLoading(false);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchArticles(); }, []);

    const handleOpenModal = (article?: Article) => {
        setError(null);
        if (article) {
            setEditingArticle(article);
            setFormData({
                title: article.title,
                slug: article.slug,
                excerpt: article.excerpt || '',
                content: article.content,
                author: article.author || '',
                image_url: article.image_url || '',
                published: article.published
            });
        } else {
            setEditingArticle(null);
            setFormData({
                title: '', slug: '', excerpt: '', content: '', author: '', image_url: '', published: false
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading("saving");
        setError(null);

        const payload = {
            ...formData,
            // strict slugify
            slug: formData.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        };

        if (editingArticle) {
            const { data, error: updateErr } = await (supabase
                .from("articles") as any)
                .update(payload)
                .eq("id", editingArticle.id)
                .select()
                .single();
            if (updateErr) setError(updateErr.message);
            else {
                setArticles(prev => prev.map(a => a.id === data.id ? data : a));
                setIsModalOpen(false);
            }
        } else {
            const { data, error: insertErr } = await (supabase
                .from("articles") as any)
                .insert([payload])
                .select()
                .single();
            if (insertErr) setError(insertErr.message);
            else {
                setArticles(prev => [data, ...prev]);
                setIsModalOpen(false);
            }
        }
        setActionLoading(null);
    };

    const handleDelete = async (id: string, title: string) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
        setActionLoading(id);
        const { error: delErr } = await supabase.from("articles").delete().eq("id", id);
        if (!delErr) {
            setArticles(prev => prev.filter(a => a.id !== id));
        } else {
            alert(delErr.message);
        }
        setActionLoading(null);
    };

    const handleTogglePublish = async (id: string, currentStatus: boolean) => {
        setActionLoading(id);
        const { error } = await (supabase.from("articles") as any).update({ published: !currentStatus }).eq("id", id);
        if (!error) {
            setArticles(prev => prev.map(a => a.id === id ? { ...a, published: !currentStatus } : a));
        }
        setActionLoading(null);
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Articles & Guides</h1>
                    <p className="text-slate-400 text-sm">Manage SEO-friendly blog content for the public Colleges Platform.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold transition-colors w-fit"
                >
                    <Plus className="w-5 h-5" /> New Article
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: "Total Articles", value: articles.length, color: "text-white", bg: "bg-slate-800 border-slate-700" },
                    { label: "Published", value: articles.filter(a => a.published).length, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
                    { label: "Drafts", value: articles.filter(a => !a.published).length, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
                ].map(s => (
                    <div key={s.label} className={`p-4 rounded-xl border ${s.bg}`}>
                        <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">{s.label}</div>
                    </div>
                ))}
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
                                {["Title", "Author", "Status", "Date", "Actions"].map(h => (
                                    <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {loading ? (
                                <tr><td colSpan={5} className="py-12 text-center text-slate-500">Loading articles...</td></tr>
                            ) : articles.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center">
                                        <FileText className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                                        <p className="text-slate-400 font-medium">No articles yet</p>
                                    </td>
                                </tr>
                            ) : articles.map(a => (
                                <tr key={a.id} className="hover:bg-slate-800/40 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="text-sm font-semibold text-slate-200 line-clamp-1">{a.title}</div>
                                        <div className="text-xs text-slate-500">/{a.slug}</div>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-slate-400">{a.author || "—"}</td>
                                    <td className="px-5 py-4">
                                        <button
                                            onClick={() => handleTogglePublish(a.id, a.published)}
                                            disabled={actionLoading === a.id}
                                            className="focus:outline-none"
                                        >
                                            {a.published ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
                                                    <Eye className="w-3 h-3" /> Published
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors">
                                                    <EyeOff className="w-3 h-3" /> Draft
                                                </span>
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                                        {new Date(a.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleOpenModal(a)}
                                                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                                                title="Edit Article"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(a.id, a.title)}
                                                disabled={actionLoading === a.id}
                                                className="p-2 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 border border-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                                                title="Delete Article"
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
                                {editingArticle ? 'Edit Article' : 'New Article'}
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
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Title *</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.title}
                                        onChange={e => {
                                            const newTitle = e.target.value;
                                            setFormData(prev => ({
                                                ...prev,
                                                title: newTitle,
                                                slug: prev.slug || newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
                                            }));
                                        }}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-red-500"
                                        placeholder="Top 10 Engineering Colleges in 2024"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Slug (URL) *</label>
                                    <div className="flex bg-slate-950 border border-slate-700 rounded-lg overflow-hidden focus-within:border-red-500">
                                        <span className="bg-slate-800 text-slate-500 px-3 py-2.5 text-sm border-r border-slate-700">/articles/</span>
                                        <input
                                            required
                                            type="text"
                                            value={formData.slug}
                                            onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                            className="w-full bg-transparent px-3 py-2.5 text-white focus:outline-none text-sm"
                                            placeholder="top-10-engineering"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Author</label>
                                    <input
                                        type="text"
                                        value={formData.author}
                                        onChange={e => setFormData({ ...formData, author: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                                        placeholder="Edumetra Team"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Feature Image URL</label>
                                    <input
                                        type="url"
                                        value={formData.image_url}
                                        onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500 text-sm"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    {formData.image_url && (
                                        <div className="mt-3 aspect-video bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                                            <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="flex items-center gap-3 bg-slate-950 border border-slate-800 p-4 rounded-xl cursor-pointer hover:border-slate-600 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={formData.published}
                                            onChange={e => setFormData({ ...formData, published: e.target.checked })}
                                            className="w-5 h-5 accent-emerald-500 rounded border-slate-700 rounded focus:ring-emerald-500 focus:ring-2 bg-slate-950"
                                        />
                                        <div>
                                            <div className="font-semibold text-white">Publish Immediately</div>
                                            <div className="text-xs text-slate-500">Make this article visible on the public website.</div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-4 flex flex-col">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Short Excerpt (SEO & List Page)</label>
                                    <textarea
                                        rows={3}
                                        value={formData.excerpt}
                                        onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-red-500 text-sm resize-none"
                                        placeholder="A brief summary of what this guide covers..."
                                    />
                                </div>

                                <div className="flex-1 flex flex-col">
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Rich Content *</label>
                                    <div className="flex-1 pb-10">
                                        <RichTextEditor
                                            value={formData.content}
                                            onChange={(val) => setFormData({ ...formData, content: val })}
                                            placeholder="Write your article content here..."
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
                                    className="px-6 py-2.5 rounded-lg font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors ml-auto flex items-center gap-2"
                                >
                                    {actionLoading === "saving" ? "Saving..." : (editingArticle ? "Save Changes" : "Create Article")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
