"use client";

import { useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Paperclip, Loader2 } from "lucide-react";

const BUCKET = "article-images"; // Reusing the same public bucket

type Props = {
    onUploadSuccess: (url: string, filename: string) => void;
    disabled?: boolean;
};

export default function ArticleAttachmentUpload({ onUploadSuccess, disabled }: Props) {
    const supabase = createClient();
    const fileRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const ext = file.name.split(".").pop() ?? "pdf";
        const path = `attachments/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(path, file, { cacheControl: "3600", upsert: false });
        
        if (uploadErr) {
            alert("Failed to upload attachment: " + uploadErr.message);
            setUploading(false);
            if (fileRef.current) fileRef.current.value = "";
            return;
        }

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        onUploadSuccess(data.publicUrl, file.name);
        setUploading(false);
        if (fileRef.current) fileRef.current.value = "";
    };

    return (
        <div className="inline-block">
            <input 
                ref={fileRef} 
                type="file" 
                accept=".pdf,.doc,.docx,.xls,.xlsx,.zip" 
                className="hidden" 
                onChange={handleFile} 
                disabled={disabled || uploading} 
            />
            <button
                type="button"
                disabled={disabled || uploading}
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium rounded-md transition-colors disabled:opacity-50"
                title="Upload PDF or Document and insert link into article"
            >
                {uploading ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</>
                ) : (
                    <><Paperclip className="w-3.5 h-3.5" /> Insert PDF/Doc</>
                )}
            </button>
        </div>
    );
}
