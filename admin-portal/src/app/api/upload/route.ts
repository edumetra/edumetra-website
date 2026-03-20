import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const bucket = formData.get("bucket") as string | null;
        const path = formData.get("path") as string | null;

        if (!file || !bucket || !path) {
            return NextResponse.json(
                { error: "Missing required fields (file, bucket, path)" },
                { status: 400 }
            );
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error("Upload API Error: Supabase URL or Key is missing from environment variables.");
            return NextResponse.json(
                { error: "Server configuration error: Supabase URL or Key is missing." },
                { status: 500 }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, file, {
                cacheControl: "3600",
                upsert: false,
                contentType: file.type,
            });

        if (error) {
            console.error("Supabase upload error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);

        return NextResponse.json({
            success: true,
            path: data.path,
            publicUrl: urlData.publicUrl,
        });
    } catch (error: any) {
        console.error("Upload API error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
