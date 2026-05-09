import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * GET /api/razorpay/get-invoice?invoiceId=<uuid>
 *   OR
 * GET /api/razorpay/get-invoice?paymentId=<razorpay_payment_id>
 *
 * Fetches a single invoice. Used by the public website to display / download.
 * Validates that the requesting user owns the invoice.
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const invoiceId = searchParams.get('invoiceId');
        const paymentId = searchParams.get('paymentId');
        const userId    = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        if (!invoiceId && !paymentId) {
            return NextResponse.json({ error: 'invoiceId or paymentId is required' }, { status: 400 });
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        );

        let query = supabaseAdmin
            .from('invoices')
            .select('*, payments(razorpay_order_id, razorpay_payment_id, status, created_at)')
            .eq('user_id', userId);

        if (invoiceId) {
            query = query.eq('id', invoiceId);
        } else if (paymentId) {
            query = query.eq('razorpay_payment_id', paymentId);
        }

        const { data: invoice, error } = await query.single();

        if (error || !invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, invoice });

    } catch (err: any) {
        console.error('[Get Invoice] Server Error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * GET /api/razorpay/get-invoice?userId=<id>&all=true
 * Returns all invoices for a user (for dashboard invoice history)
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        );

        const { data: invoices, error } = await supabaseAdmin
            .from('invoices')
            .select('*')
            .eq('user_id', userId)
            .order('issued_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, invoices: invoices || [] });

    } catch (err: any) {
        console.error('[Get Invoices] Server Error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
