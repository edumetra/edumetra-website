"use client";

import { useState, useRef, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Upload, X, Loader2, AlertCircle, CheckCircle2, ImageIcon } from "lucide-react";

const BUCKET = "article-images";

type Props = {
    value: string;           // current URL (from DB or just uploaded)
    onChange: (url: string) => void;
    disabled?: boolean;
};

export default function ArticleImageUpload({ value, onChange, disabled }: Props) {
    const supabase = createClient();
    const fileRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragging, setDragging] = useState(false);

    const upload = useCallback(async (file: File) => {
        if (!file.type.startsWith("image/")) { setError("Please select an image file."); return; }
        setUploading(true);
        setError(null);

        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `articles/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(path, file, { cacheControl: "3600", upsert: false });
        if (uploadErr) {
            setError(uploadErr.message);
            setUploading(false);
            return;
        }
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        onChange(data.publicUrl);
        setUploading(false);
    }, [supabase, onChange]);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) upload(file);
        if (fileRef.current) fileRef.current.value = "";
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) upload(file);
    };

    const handleClear = () => {
        onChange("");
        setError(null);
    };

    return (
        <div className="space-y-3">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={disabled} />

            {value ? (
                /* Preview */
                <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
                    <img src={value} alt="Feature image" className="w-full aspect-video object-cover" />
                    <div className="absolute top-2 right-2 flex gap-2">
                        <div className="flex items-center gap-1 bg-emerald-900/80 backdrop-blur-sm text-emerald-400 text-xs font-semibold px-2 py-1 rounded-lg">
                            <CheckCircle2 className="w-3 h-3" /> Uploaded
                        </div>
                        <button type="button" onClick={handleClear} disabled={disabled}
                            className="w-7 h-7 bg-slate-900/80 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <button type="button" onClick={() => fileRef.current?.click()} disabled={disabled || uploading}
                        className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors">
                        <Upload className="w-3 h-3" /> Replace
                    </button>
                </div>
            ) : (
                /* Drop zone */
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => !disabled && fileRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragging ? "border-red-500/60 bg-red-500/10" : "border-slate-700 hover:border-slate-500 hover:bg-slate-800/40"} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                    {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-8 h-8 text-red-400 animate-spin" />
                            <p className="text-sm text-slate-400 font-semibold">Uploading image...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                                <ImageIcon className={`w-6 h-6 ${dragging ? "text-red-400" : "text-slate-600"}`} />
                            </div>
                            <p className="text-sm font-semibold text-slate-400">
                                {dragging ? "Drop to upload" : "Click or drag & drop feature image"}
                            </p>
                            <p className="text-xs text-slate-700">JPG, PNG, WebP — recommended 1200×630px</p>
                        </div>
                    )}
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 text-red-400 text-xs font-semibold bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
                </div>
            )}
        </div>
    );
}
