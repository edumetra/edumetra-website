import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        // Don't leak the actual values, just check if they exist
        URL_VALUE_LENGTH: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
        KEY_VALUE_LENGTH: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
        ANON_KEY_VALUE_LENGTH: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
    });
}
