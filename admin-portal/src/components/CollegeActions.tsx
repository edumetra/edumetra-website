"use client";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function CollegeActions({ id }: { id: number }) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this college?")) return;
        setLoading(true);
        await supabase.from("colleges").delete().eq("id", id);
        router.refresh();
        setLoading(false);
    };

    return (
        <div className="flex items-center gap-4 text-sm font-medium">
            <Link href={`/colleges/${id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                Edit
            </Link>
            <Link href={`/colleges/${id}/details`} className="text-indigo-600 hover:text-indigo-900">
                Details
            </Link>
            <button
                onClick={handleDelete}
                disabled={loading}
                className="text-red-600 hover:text-red-900 disabled:opacity-50"
            >
                {loading ? "Deleting..." : "Delete"}
            </button>
        </div>
    );
}
