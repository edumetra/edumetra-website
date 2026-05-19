import { NextResponse } from 'next/server';
import { isProductionDeployment } from '@/lib/env';
import { requireAdminApiAuth } from '@/lib/auth-api';

export async function GET() {
    if (isProductionDeployment()) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const authError = await requireAdminApiAuth();
    if (authError) return authError;

    return NextResponse.json({
        NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        RAZORPAY_KEY_ID: !!process.env.RAZORPAY_KEY_ID,
        URL_VALUE_LENGTH: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
        KEY_VALUE_LENGTH: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
    });
}
