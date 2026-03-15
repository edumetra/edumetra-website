"use client";

import { useState, useEffect, useRef, useCallback, use } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft, Building2, MapPin, GraduationCap, IndianRupee,
    BookOpen, Globe, FileText, Upload, X, ImageIcon,
    AlertCircle, Loader2, Star, GripVertical, CheckCircle2,
    Trash2, Eye, Users, ShieldCheck, Plus,
} from "lucide-react";

const BUCKET = "college-images";

type ExistingImage = {
    id: string;      // unique key
    url: string;     // public URL already in DB
    isExisting: true;
};

type NewImage = {
    id: string;
    file: File;
    preview: string;
    url: string | null;
    uploading: boolean;
    error: string | null;
    isExisting: false;
};

type CollegeImage = ExistingImage | NewImage;

export default function EditCollegePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        location_city: "",
        location_state: "",
        type: "Private",
        visibility: "draft",
        rank: "",
        rating: "",
        fees: "",
        avg_package: "",
        highest_package: "",
        placement_rate: "",
        exams: "",
        courses: "",
        description: "",
        established_year: "",
        website_url: "",
        // New college_details fields
        minority_status: "false",
        intake_capacity: "",
        reservation_percentages: [] as { category: string; percentage: string }[],
        category_fees: [] as { category: string; fee: string }[],
        faq: [] as { question: string; answer: string }[],
    });

    const [fieldErrors, setFieldErrors] = useState<Partial<typeof formData>>({});
    const [images, setImages] = useState<CollegeImage[]>([]);
    const [draggingOver, setDraggingOver] = useState(false);
    const [dragSrcId, setDragSrcId] = useState<string | null>(null);

    // ─── Load college data ───────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error: fetchErr } = await (supabase.from("colleges") as any)
                .select("*").eq("id", id).single();
            if (fetchErr || !data) { setError("College not found"); setLoading(false); return; }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: details } = await (supabase.from("college_details") as any)
                .select("*").eq("college_id", id).single();

            let placementStats: Record<string, string> = {};
            let resPercentages: Record<string, number> = {};
            let catFees: Record<string, string> = {};
            let fetchedFaq: { question: string; answer: string }[] = [];

            if (details) {
                if (details.placement_stats) {
                    try { placementStats = typeof details.placement_stats === "string" ? JSON.parse(details.placement_stats) : details.placement_stats; }
                    catch { /* ignore */ }
                }
                if (details.reservation_percentages) {
                    try { resPercentages = typeof details.reservation_percentages === "string" ? JSON.parse(details.reservation_percentages) : details.reservation_percentages; }
                    catch { /* ignore */ }
                }
                if (details.category_fees) {
                    try { catFees = typeof details.category_fees === "string" ? JSON.parse(details.category_fees) : details.category_fees; }
                    catch { /* ignore */ }
                }
                if (details.faq) {
                    try { fetchedFaq = typeof details.faq === "string" ? JSON.parse(details.faq) : details.faq; }
                    catch { /* ignore */ }
                }
            }

            setFormData({
                name: data.name || "",
                location_city: data.location_city || "",
                location_state: data.location_state || "",
                type: data.type || "Private",
                visibility: data.visibility ?? (data.is_published ? "public" : "draft"),
                rank: data.rank?.toString() || "",
                rating: data.rating?.toString() || "",
                fees: data.fees || "",
                avg_package: data.avg_package || "",
                highest_package: placementStats.highest_package || "",
                placement_rate: placementStats.placement_rate || "",
                exams: data.exams || "",
                courses: Array.isArray(data.courses) ? data.courses.join(", ") : data.courses || "",
                description: data.description || "",
                established_year: data.established_year?.toString() || "",
                website_url: data.website_url || "",
                minority_status: details?.minority_status ? "true" : "false",
                intake_capacity: details?.intake_capacity?.toString() || "",
                reservation_percentages: Object.entries(resPercentages).map(([category, percentage]) => ({ category, percentage: percentage.toString() })),
                category_fees: Object.entries(catFees).map(([category, fee]) => ({ category, fee: fee.toString() })),
                faq: Array.isArray(fetchedFaq) ? fetchedFaq : [],
            });

            // Build image list: cover image first, then gallery
            const existing: ExistingImage[] = [];
            if (data.image) existing.push({ id: `existing-cover`, url: data.image, isExisting: true });
            const gallery: string[] = Array.isArray(data.gallery_images) ? data.gallery_images : [];
            gallery.forEach((url: string, i: number) => {
                existing.push({ id: `existing-gallery-${i}`, url, isExisting: true });
            });
            setImages(existing);
            setLoading(false);
        };
        load();
    }, [id]); // eslint-disable-line

    // ─── Image upload ────────────────────────────────────────────────
    const uploadFile = useCallback(async (img: NewImage) => {
        const ext = img.file.name.split(".").pop();
        const path = `colleges/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

        setImages((prev) => prev.map((i) => i.id === img.id ? { ...i, uploading: true, error: null } : i));

        const formData = new FormData();
        formData.append("file", img.file);
        formData.append("bucket", BUCKET);
        formData.append("path", path);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Upload failed");
            }

            const data = await res.json();
            setImages((prev) => prev.map((i) => i.id === img.id ? { ...i, uploading: false, url: data.publicUrl } : i));
        } catch (err: any) {
            setImages((prev) => prev.map((i) => i.id === img.id ? { ...i, uploading: false, error: err.message } : i));
        }
    }, []);

    const addFiles = useCallback((files: FileList | null) => {
        if (!files) return;
        const newImgs: NewImage[] = Array.from(files)
            .filter((f) => f.type.startsWith("image/"))
            .map((file) => ({
                id: `new-${Date.now()}-${Math.random()}`,
                file,
                preview: URL.createObjectURL(file),
                url: null,
                uploading: false,
                error: null,
                isExisting: false,
            }));
        setImages((prev) => [...prev, ...newImgs]);
        newImgs.forEach((img) => uploadFile(img));
    }, [uploadFile]);

    const removeImage = (imgId: string) => {
        setImages((prev) => {
            const img = prev.find((i) => i.id === imgId);
            if (img && !img.isExisting) URL.revokeObjectURL((img as NewImage).preview);
            return prev.filter((i) => i.id !== imgId);
        });
    };

    const retryUpload = (imgId: string) => {
        const img = images.find((i) => i.id === imgId);
        if (img && !img.isExisting) uploadFile(img as NewImage);
    };

    // Drag-to-reorder
    const handleDragStart = (imgId: string) => setDragSrcId(imgId);
    const handleDragOver = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        if (!dragSrcId || dragSrcId === targetId) return;
        setImages((prev) => {
            const src = prev.findIndex((i) => i.id === dragSrcId);
            const dst = prev.findIndex((i) => i.id === targetId);
            if (src < 0 || dst < 0) return prev;
            const copy = [...prev];
            [copy[src], copy[dst]] = [copy[dst], copy[src]];
            return copy;
        });
    };

    // ─── Validation ──────────────────────────────────────────────────
    const validate = () => {
        const errs: Partial<typeof formData> = {};
        if (!formData.name.trim()) errs.name = "College name is required";
        if (!formData.location_city.trim()) errs.location_city = "City is required";
        if (!formData.location_state.trim()) errs.location_state = "State is required";
        if (formData.rating && (parseFloat(formData.rating) < 0 || parseFloat(formData.rating) > 5)) errs.rating = "Rating must be 0–5";
        if (formData.intake_capacity && isNaN(parseInt(formData.intake_capacity))) errs.intake_capacity = "Must be a valid number";
        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // ─── Submit ──────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const stillUploading = images.some((i) => !i.isExisting && !(i as NewImage).url && !(i as NewImage).error);
        if (images.some((i) => !i.isExisting && (i as NewImage).uploading)) {
            setError("Please wait — images are still uploading."); return;
        }
        if (images.some((i) => !i.isExisting && (i as NewImage).error)) {
            setError("Some images failed to upload. Retry or remove them."); return;
        }
        void stillUploading;

        setSaving(true);
        setError(null);

        const allUrls = images.map((i) => {
            if (i.isExisting) return i.url;
            return (i as NewImage).url;
        }).filter(Boolean) as string[];

        const mainImage = allUrls[0] ?? null;
        const galleryImages = allUrls.slice(1);
        const coursesArray = formData.courses.split(",").map((c) => c.trim()).filter(Boolean);
        const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: updateErr } = await (supabase.from("colleges") as any).update({
                name: formData.name,
                slug,
                location_city: formData.location_city,
                location_state: formData.location_state,
                type: formData.type,
                visibility: formData.visibility,
                rank: parseInt(formData.rank) || null,
                rating: parseFloat(formData.rating) || null,
                fees: formData.fees || null,
                avg_package: formData.avg_package || null,
                exams: formData.exams || null,
                courses: coursesArray,
                image: mainImage,
                gallery_images: galleryImages.length ? galleryImages : null,
                description: formData.description || null,
                established_year: parseInt(formData.established_year) || null,
                website_url: formData.website_url || null,
                is_published: formData.visibility === "public",
            }).eq("id", id);

            if (updateErr) throw updateErr;

            // Prepare JSONB fields
            const resData = formData.reservation_percentages.reduce((acc, curr) => {
                if (curr.category && curr.percentage) acc[curr.category] = parseFloat(curr.percentage);
                return acc;
            }, {} as Record<string, number>);

            const feeData = formData.category_fees.reduce((acc, curr) => {
                if (curr.category && curr.fee) acc[curr.category] = curr.fee;
                return acc;
            }, {} as Record<string, string>);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase.from("college_details") as any).upsert({
                college_id: id,
                placement_stats: JSON.stringify({
                    highest_package: formData.highest_package,
                    placement_rate: formData.placement_rate,
                    average_package: formData.avg_package,
                }),
                minority_status: formData.minority_status === "true",
                intake_capacity: parseInt(formData.intake_capacity) || 0,
                reservation_percentages: Object.keys(resData).length ? JSON.stringify(resData) : null,
                category_fees: Object.keys(feeData).length ? JSON.stringify(feeData) : null,
                faq: formData.faq.length ? JSON.stringify(formData.faq) : null,
            }, { onConflict: "college_id" });

            setSaveSuccess(true);
            setTimeout(() => router.push(`/colleges/${id}`), 900);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((p) => ({ ...p, [name]: value }));
        if (fieldErrors[name as keyof typeof fieldErrors]) setFieldErrors((p) => ({ ...p, [name]: undefined }));
    };

    const inputCls = (field?: string) =>
        `w-full bg-slate-800 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all font-medium text-slate-200 placeholder:text-slate-500 ${field && fieldErrors[field as keyof typeof fieldErrors]
            ? "border-red-500/50 focus:ring-red-500/30"
            : "border-slate-700 focus:ring-red-500/40 focus:border-red-500/40 hover:border-slate-600"
        }`;
    const labelCls = "block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2";
    const sectionCls = "bg-slate-900 border border-slate-800 rounded-2xl p-8";

    const uploadingCount = images.filter((i) => !i.isExisting && (i as NewImage).uploading).length;
    const readyNewCount = images.filter((i) => !i.isExisting && (i as NewImage).url).length;

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
        </div>
    );

    if (error && loading === false && !formData.name) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-red-400 text-center">
                <AlertCircle className="w-10 h-10 mx-auto mb-2" />
                <p>{error}</p>
                <Link href="/colleges" className="mt-4 text-sm text-slate-400 hover:text-white underline block">← Back to Colleges</Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 py-10 px-4">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-start mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">Edit College</h1>
                        <p className="text-slate-500 mt-1 text-sm truncate max-w-md">{formData.name || "Loading..."}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Link href={`/colleges/${id}`}
                            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl transition-colors">
                            <Eye className="w-3.5 h-3.5" /> View
                        </Link>
                        <Link href="/colleges"
                            className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white bg-slate-800 border border-slate-700 px-4 py-2.5 rounded-xl transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Cancel
                        </Link>
                    </div>
                </div>

                {/* Visibility */}
                <div className="mb-6 p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                    <label className={labelCls}>Visibility</label>
                    <div className="flex gap-3 flex-wrap">
                        {(["draft", "public", "hidden"] as const).map((v) => (
                            <button key={v} type="button" onClick={() => setFormData((p) => ({ ...p, visibility: v }))}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${formData.visibility === v
                                    ? v === "public" ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                                        : v === "hidden" ? "bg-slate-700 border-slate-600 text-slate-300"
                                            : "bg-amber-500/15 border-amber-500/40 text-amber-400"
                                    : "bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300"
                                    }`}>
                                <span className={`w-2 h-2 rounded-full ${v === "public" ? "bg-emerald-400" : v === "hidden" ? "bg-slate-500" : "bg-amber-400"}`} />
                                {v.charAt(0).toUpperCase() + v.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {error && !loading && (
                    <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-6">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />{error}
                        <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
                    </div>
                )}
                {saveSuccess && (
                    <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm mb-6">
                        <CheckCircle2 className="w-4 h-4 shrink-0" /> Saved! Redirecting to college profile...
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* ── IMAGES ── */}
                    <section className={sectionCls}>
                        <div className="flex items-center gap-3 mb-5 border-b border-slate-800 pb-4">
                            <div className="p-2 bg-red-500/10 rounded-lg text-red-400"><ImageIcon className="w-5 h-5" /></div>
                            <div>
                                <h2 className="text-lg font-bold text-white">College Images</h2>
                                <p className="text-xs text-slate-500">First image = cover. Drag to reorder. Click ✕ to remove.</p>
                            </div>
                            <div className="ml-auto text-xs">
                                {uploadingCount > 0 && (
                                    <span className="flex items-center gap-1 text-amber-400 font-semibold">
                                        <Loader2 className="w-3 h-3 animate-spin" />Uploading {uploadingCount}...
                                    </span>
                                )}
                                {uploadingCount === 0 && readyNewCount > 0 && (
                                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                                        <CheckCircle2 className="w-3 h-3" />{readyNewCount} new ready
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Current images grid */}
                        {images.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                                {images.map((img, idx) => {
                                    const previewUrl = img.isExisting ? img.url : (img as NewImage).preview;
                                    const isUploading = !img.isExisting && (img as NewImage).uploading;
                                    const hasError = !img.isExisting && !!(img as NewImage).error;
                                    const isReady = img.isExisting || !!(img as NewImage).url;
                                    return (
                                        <div
                                            key={img.id}
                                            draggable
                                            onDragStart={() => handleDragStart(img.id)}
                                            onDragOver={(e) => handleDragOver(e, img.id)}
                                            onDragEnd={() => setDragSrcId(null)}
                                            className={`relative group rounded-xl overflow-hidden border-2 transition-all cursor-grab active:cursor-grabbing ${idx === 0 ? "border-red-500/50 ring-2 ring-red-500/20" : "border-slate-700"}`}
                                        >
                                            {idx === 0 && (
                                                <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                                    <Star className="w-2.5 h-2.5" /> Cover
                                                </div>
                                            )}
                                            <div className="absolute top-2 right-8 z-10 opacity-0 group-hover:opacity-100 transition-opacity text-white">
                                                <GripVertical className="w-4 h-4 drop-shadow" />
                                            </div>
                                            <button type="button" onClick={() => removeImage(img.id)}
                                                className="absolute top-2 right-2 z-10 w-6 h-6 bg-slate-900/80 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors">
                                                <X className="w-3 h-3" />
                                            </button>
                                            <img src={previewUrl} alt="" className="w-full aspect-video object-cover" />

                                            {isUploading && (
                                                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                                                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                                                </div>
                                            )}
                                            {hasError && (
                                                <div className="absolute inset-0 bg-red-900/70 flex flex-col items-center justify-center p-2">
                                                    <AlertCircle className="w-5 h-5 text-red-300 mb-1" />
                                                    <p className="text-[10px] text-red-200 text-center">{(img as NewImage).error}</p>
                                                    <button type="button" onClick={() => retryUpload(img.id)} className="mt-1 text-[10px] underline text-red-200 font-bold">Retry</button>
                                                </div>
                                            )}
                                            {isReady && !isUploading && !hasError && (
                                                <div className="absolute bottom-2 left-2 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                            {img.isExisting && (
                                                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500/40" title="Existing image" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Drop zone */}
                        <div
                            onDragOver={(e) => { e.preventDefault(); setDraggingOver(true); }}
                            onDragLeave={() => setDraggingOver(false)}
                            onDrop={(e) => { e.preventDefault(); setDraggingOver(false); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files); }}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${draggingOver ? "border-red-500/60 bg-red-500/10" : "border-slate-700 hover:border-slate-500 hover:bg-slate-800/40"}`}
                        >
                            <Upload className={`w-6 h-6 mx-auto mb-2 ${draggingOver ? "text-red-400" : "text-slate-600"}`} />
                            <p className="text-xs font-semibold text-slate-500">
                                {images.length > 0 ? "Add more images" : "Upload images — click or drag & drop"}
                            </p>
                            <p className="text-xs text-slate-700 mt-0.5">JPG, PNG, WebP</p>
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />

                        {images.length === 0 && (
                            <p className="text-xs text-slate-600 text-center mt-2 flex items-center justify-center gap-1">
                                <Trash2 className="w-3 h-3" /> All existing images removed — upload new ones above
                            </p>
                        )}
                    </section>

                    {/* ── BASIC INFO ── */}
                    <section className={sectionCls}>
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                            <div className="p-2 bg-red-500/10 rounded-lg text-red-400"><Building2 className="w-5 h-5" /></div>
                            <h2 className="text-lg font-bold text-white">Basic Information</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className={labelCls}>College Name *</label>
                                <input type="text" name="name" required placeholder="e.g. Indian Institute of Technology, Bombay"
                                    value={formData.name} onChange={handleChange} className={inputCls("name")} />
                                {fieldErrors.name && <p className="text-red-400 text-xs mt-1">{fieldErrors.name}</p>}
                            </div>
                            <div>
                                <label className={labelCls}>Institution Type</label>
                                <select name="type" value={formData.type} onChange={handleChange} className={inputCls()}>
                                    <option value="Private">Private</option>
                                    <option value="Public/Government">Public / Government</option>
                                    <option value="Deemed">Deemed University</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Established Year</label>
                                <input type="number" name="established_year" placeholder="e.g. 1958"
                                    value={formData.established_year} onChange={handleChange} className={inputCls("established_year")} />
                                {fieldErrors.established_year && <p className="text-red-400 text-xs mt-1">{fieldErrors.established_year}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelCls}>Website URL</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input type="url" name="website_url" placeholder="https://www.iitb.ac.in"
                                        value={formData.website_url} onChange={handleChange} className={`${inputCls()} pl-10`} />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelCls}>Description</label>
                                <textarea name="description" rows={4} placeholder="Write a compelling description..."
                                    value={formData.description} onChange={handleChange} className={inputCls()} />
                            </div>
                        </div>
                    </section>

                    {/* ── LOCATION & RANKING ── */}
                    <section className={sectionCls}>
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                            <div className="p-2 bg-red-500/10 rounded-lg text-red-400"><MapPin className="w-5 h-5" /></div>
                            <h2 className="text-lg font-bold text-white">Location & Ranking</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelCls}>City *</label>
                                <input type="text" name="location_city" required placeholder="e.g. Mumbai"
                                    value={formData.location_city} onChange={handleChange} className={inputCls("location_city")} />
                                {fieldErrors.location_city && <p className="text-red-400 text-xs mt-1">{fieldErrors.location_city}</p>}
                            </div>
                            <div>
                                <label className={labelCls}>State *</label>
                                <input type="text" name="location_state" required placeholder="e.g. Maharashtra"
                                    value={formData.location_state} onChange={handleChange} className={inputCls("location_state")} />
                                {fieldErrors.location_state && <p className="text-red-400 text-xs mt-1">{fieldErrors.location_state}</p>}
                            </div>
                            <div>
                                <label className={labelCls}>National Rank</label>
                                <input type="number" name="rank" placeholder="e.g. 1"
                                    value={formData.rank} onChange={handleChange} className={inputCls()} />
                            </div>
                            <div>
                                <label className={labelCls}>Rating (0–5)</label>
                                <input type="number" name="rating" step="0.1" min="0" max="5" placeholder="e.g. 4.5"
                                    value={formData.rating} onChange={handleChange} className={inputCls("rating")} />
                                {fieldErrors.rating && <p className="text-red-400 text-xs mt-1">{fieldErrors.rating}</p>}
                            </div>
                        </div>
                    </section>

                    {/* ── ACADEMICS & PLACEMENT ── */}
                    <section className={sectionCls}>
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                            <div className="p-2 bg-red-500/10 rounded-lg text-red-400"><GraduationCap className="w-5 h-5" /></div>
                            <h2 className="text-lg font-bold text-white">Academics & Placement</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelCls}>Annual Fees</label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input type="text" name="fees" placeholder="e.g. ₹2.5 Lakhs/yr"
                                        value={formData.fees} onChange={handleChange} className={`${inputCls()} pl-10`} />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Exams Accepted</label>
                                <div className="relative">
                                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input type="text" name="exams" placeholder="JEE Main, GATE, CAT"
                                        value={formData.exams} onChange={handleChange} className={`${inputCls()} pl-10`} />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Average Package</label>
                                <input type="text" name="avg_package" placeholder="e.g. ₹15 LPA"
                                    value={formData.avg_package} onChange={handleChange} className={inputCls()} />
                            </div>
                            <div>
                                <label className={labelCls}>Highest Package</label>
                                <input type="text" name="highest_package" placeholder="e.g. ₹55 LPA"
                                    value={formData.highest_package} onChange={handleChange} className={inputCls()} />
                            </div>
                            <div>
                                <label className={labelCls}>Placement Rate</label>
                                <input type="text" name="placement_rate" placeholder="e.g. 92%"
                                    value={formData.placement_rate} onChange={handleChange} className={inputCls()} />
                            </div>
                        </div>
                    </section>

                    {/* ── CAPACITY & CATEGORIES ── */}
                    <section className={sectionCls}>
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                            <div className="p-2 bg-red-500/10 rounded-lg text-red-400"><Users className="w-5 h-5" /></div>
                            <h2 className="text-lg font-bold text-white">Capacity & Admission Details</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelCls}>Total Intake Capacity</label>
                                <input type="number" name="intake_capacity" placeholder="e.g. 120"
                                    value={formData.intake_capacity} onChange={handleChange} className={inputCls("intake_capacity")} />
                                {fieldErrors.intake_capacity && <p className="text-red-400 text-xs mt-1">{fieldErrors.intake_capacity}</p>}
                            </div>
                            <div>
                                <label className={labelCls}>Minority Status</label>
                                <select name="minority_status" value={formData.minority_status} onChange={handleChange} className={inputCls()}>
                                    <option value="false">Non-Minority</option>
                                    <option value="true">Minority Institution</option>
                                </select>
                            </div>
                        </div>

                        {/* Reservation Percentages */}
                        <div className="mt-8">
                            <label className={labelCls}>Reservation Percentages</label>
                            {formData.reservation_percentages.map((res, i) => (
                                <div key={`res-${i}`} className="flex gap-3 mb-3 items-center">
                                    <input type="text" placeholder="Category (e.g. SC/ST)" value={res.category}
                                        onChange={(e) => setFormData(p => {
                                            const arr = [...p.reservation_percentages];
                                            arr[i].category = e.target.value;
                                            return { ...p, reservation_percentages: arr };
                                        })}
                                        className={inputCls()} />
                                    <input type="number" placeholder="Percentage (%)" value={res.percentage}
                                        onChange={(e) => setFormData(p => {
                                            const arr = [...p.reservation_percentages];
                                            arr[i].percentage = e.target.value;
                                            return { ...p, reservation_percentages: arr };
                                        })}
                                        className={inputCls()} />
                                    <button type="button" onClick={() => setFormData(p => ({
                                        ...p, reservation_percentages: p.reservation_percentages.filter((_, idx) => idx !== i)
                                    }))} className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={() => setFormData(p => ({
                                ...p, reservation_percentages: [...p.reservation_percentages, { category: "", percentage: "" }]
                            }))} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 font-semibold mt-2">
                                <Plus className="w-4 h-4" /> Add Reservation Category
                            </button>
                        </div>

                        {/* Category-wise Fees */}
                        <div className="mt-8 pt-8 border-t border-slate-800">
                            <label className={labelCls}>Category-wise Fee Structure</label>
                            {formData.category_fees.map((fee, i) => (
                                <div key={`fee-${i}`} className="flex gap-3 mb-3 items-center">
                                    <input type="text" placeholder="Category (e.g. OBC)" value={fee.category}
                                        onChange={(e) => setFormData(p => {
                                            const arr = [...p.category_fees];
                                            arr[i].category = e.target.value;
                                            return { ...p, category_fees: arr };
                                        })}
                                        className={`${inputCls()} flex-1`} />
                                    <div className="relative flex-1">
                                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input type="text" placeholder="Annual Fee (e.g. ₹50,000)" value={fee.fee}
                                            onChange={(e) => setFormData(p => {
                                                const arr = [...p.category_fees];
                                                arr[i].fee = e.target.value;
                                                return { ...p, category_fees: arr };
                                            })}
                                            className={`${inputCls()} pl-10`} />
                                    </div>
                                    <button type="button" onClick={() => setFormData(p => ({
                                        ...p, category_fees: p.category_fees.filter((_, idx) => idx !== i)
                                    }))} className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={() => setFormData(p => ({
                                ...p, category_fees: [...p.category_fees, { category: "", fee: "" }]
                            }))} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 font-semibold mt-2">
                                <Plus className="w-4 h-4" /> Add Category Fee
                            </button>
                        </div>

                        {/* Custom FAQs */}
                        <div className="mt-8 pt-8 border-t border-slate-800">
                            <label className={labelCls}>Custom Frequently Asked Questions</label>
                            <p className="text-xs text-slate-500 mb-4">Note: 3 standard FAQs are always shown on the college page. Add college-specific FAQs here.</p>
                            {formData.faq.map((item, i) => (
                                <div key={`faq-${i}`} className="flex flex-col gap-2 mb-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800 relative">
                                    <input type="text" placeholder="Question" value={item.question}
                                        onChange={(e) => setFormData(p => {
                                            const arr = [...p.faq];
                                            arr[i].question = e.target.value;
                                            return { ...p, faq: arr };
                                        })}
                                        className={inputCls()} />
                                    <textarea placeholder="Answer" value={item.answer} rows={2}
                                        onChange={(e) => setFormData(p => {
                                            const arr = [...p.faq];
                                            arr[i].answer = e.target.value;
                                            return { ...p, faq: arr };
                                        })}
                                        className={inputCls()} />
                                    <button type="button" onClick={() => setFormData(p => ({
                                        ...p, faq: p.faq.filter((_, idx) => idx !== i)
                                    }))} className="absolute top-2 right-2 p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={() => setFormData(p => ({
                                ...p, faq: [...p.faq, { question: "", answer: "" }]
                            }))} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 font-semibold">
                                <Plus className="w-4 h-4" /> Add Custom FAQ
                            </button>
                        </div>
                    </section>

                    {/* ── COURSES ── */}
                    <section className={sectionCls}>
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                            <div className="p-2 bg-red-500/10 rounded-lg text-red-400"><FileText className="w-5 h-5" /></div>
                            <h2 className="text-lg font-bold text-white">Courses Offered</h2>
                        </div>
                        <div>
                            <label className={labelCls}>Courses (comma-separated)</label>
                            <textarea name="courses" rows={3}
                                placeholder="B.Tech Computer Science, MBA Finance, B.Arch, M.Tech..."
                                value={formData.courses} onChange={handleChange} className={inputCls()} />
                            {formData.courses && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {formData.courses.split(",").map((c) => c.trim()).filter(Boolean).map((c, i) => (
                                        <span key={i} className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-lg">{c}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Sticky save bar */}
                    <div className="sticky bottom-0 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 px-6 py-4 -mx-4 flex items-center justify-between gap-4 z-20">
                        <div className="text-xs text-slate-500">
                            {images.length > 0 && `${images.length} image${images.length !== 1 ? "s" : ""} · ${images.filter((i) => i.isExisting).length} existing`}
                            {uploadingCount > 0 && ` · uploading ${uploadingCount}...`}
                        </div>
                        <div className="flex gap-3">
                            <Link href={`/colleges/${id}`} className="px-5 py-2.5 rounded-xl font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm">
                                Cancel
                            </Link>
                            <button type="submit" disabled={saving || uploadingCount > 0}
                                className="flex items-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white px-8 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-900/30">
                                {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> :
                                    uploadingCount > 0 ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading...</> :
                                        "Save Changes"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
