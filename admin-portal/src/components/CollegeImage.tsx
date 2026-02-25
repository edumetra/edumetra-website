"use client";

import { Building2 } from "lucide-react";
import { useState } from "react";

export default function CollegeImage({ src, alt }: { src?: string | null; alt?: string }) {
    const [error, setError] = useState(false);

    if (!src || error) {
        return (
            <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 shrink-0 hidden sm:flex items-center justify-center">
                <Building2 className="w-5 h-5 text-slate-500" />
            </div>
        );
    }

    return (
        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-700 hidden sm:block bg-slate-800">
            <img
                src={src}
                alt={alt || ""}
                className="w-full h-full object-cover"
                onError={() => setError(true)}
            />
        </div>
    );
}
