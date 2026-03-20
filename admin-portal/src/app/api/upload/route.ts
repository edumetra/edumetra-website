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

        if (!supabaseUrl || !supabaseKey || supabaseKey === "undefined" || supabaseKey === "null") {
            console.error("Upload API Error: Supabase configuration is missing or invalid.", {
                urlExists: !!supabaseUrl,
                keyExists: !!supabaseKey,
                keyType: typeof supabaseKey
            });
            return NextResponse.json(
                { error: `Server configuration error: Supabase ${!supabaseUrl ? 'URL' : 'Key'} is missing or invalid.` },
                { status: 500 }
            );
        }

        console.log(`Initializing Supabase client for upload. Key length: ${supabaseKey?.length || 0}`);
        const supabase = createClient(supabaseUrl, supabaseKey);

        console.log(`Converting file to Buffer. Name: ${file.name}, Type: ${file.type}, Size: ${file.size}`);
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log(`Uploading to bucket: ${bucket}, path: ${path}`);
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, buffer, {
                cacheControl: "3600",
                upsert: false,
                contentType: file.type,
            });

        if (error) {
            console.error("Supabase storage upload error:", error);
            return NextResponse.json({ 
                error: error.message,
                details: error
            }, { status: 500 });
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
