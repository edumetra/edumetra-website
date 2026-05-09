import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * POST /api/razorpay/verify-payment
 *
 * Called from the public website after Razorpay payment handler fires.
 * 1. Verifies the Razorpay signature
 * 2. Marks the payment as 'paid' in DB
 * 3. Upgrades the user's account tier
 * 4. Generates a unique invoice and saves it to DB
 * 5. Returns the invoice details to the frontend
 */
export async function POST(req: NextRequest) {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    try {
        const body = await req.json();
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            userId,
            planType,
            couponCode,
            discountPaise = 0,
        } = body;

        // ── 1. Validate required fields ───────────────────────────────────────
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId || !planType) {
            return NextResponse.json(
                { error: 'Missing required payment verification fields' },
                { status: 400 }
            );
        }

        // ── 2. Verify Razorpay signature ──────────────────────────────────────
        const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
        const expectedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            console.error('[Verify Payment] Invalid signature for order:', razorpay_order_id);
            return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
        }

        // ── 3. Fetch the payment record (created when order was made) ─────────
        const { data: payment, error: paymentFetchError } = await supabaseAdmin
            .from('payments')
            .select('*')
            .eq('razorpay_order_id', razorpay_order_id)
            .single();

        if (paymentFetchError || !payment) {
            console.error('[Verify Payment] Payment record not found:', razorpay_order_id);
            return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
        }

        // Guard against double-processing
        if (payment.status === 'paid') {
            // Return existing invoice if already processed
            const { data: existingInvoice } = await supabaseAdmin
                .from('invoices')
                .select('*')
                .eq('payment_id', payment.id)
                .single();
            return NextResponse.json({ success: true, invoice: existingInvoice });
        }

        // ── 4. Mark payment as paid ───────────────────────────────────────────
        const { error: updatePaymentError } = await supabaseAdmin
            .from('payments')
            .update({
                razorpay_payment_id,
                razorpay_signature,
                status: 'paid',
                coupon_code: couponCode || null,
                discount_paise: discountPaise,
            })
            .eq('id', payment.id);

        if (updatePaymentError) {
            console.error('[Verify Payment] Failed to update payment status:', updatePaymentError);
            return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
        }

        // ── 5. Fetch user profile for invoice details ─────────────────────────
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);

        if (userError || !userData?.user) {
            console.warn('[Verify Payment] User details not found in auth.users:', userId);
        }

        const userEmail = userData?.user?.email || '';
        const userName = userData?.user?.user_metadata?.full_name || '';

        // ── 6. Generate unique invoice number ─────────────────────────────────
        const { data: invoiceNumberData, error: invoiceNumError } = await supabaseAdmin
            .rpc('generate_invoice_number');

        if (invoiceNumError) {
            console.error('[Verify Payment] Failed to generate invoice number:', invoiceNumError);
        }

        const invoiceNumber = invoiceNumberData || `EDU-${new Date().getFullYear()}-${Date.now()}`;

        const finalAmountPaise = payment.amount_paise - discountPaise;
        const billingPeriod = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

        // ── 7. Insert invoice record ──────────────────────────────────────────
        const { data: invoice, error: invoiceError } = await supabaseAdmin
            .from('invoices')
            .insert({
                invoice_number:     invoiceNumber,
                payment_id:         payment.id,
                user_id:            userId,
                user_email:         userEmail,
                user_name:          userName,
                plan_type:          planType,
                amount_paise:       payment.amount_paise,
                discount_paise:     discountPaise,
                tax_paise:          0,   // add GST logic here if required
                total_paise:        finalAmountPaise,
                billing_period:     billingPeriod,
                razorpay_payment_id: razorpay_payment_id,
            })
            .select()
            .single();

        if (invoiceError) {
            console.error('[Verify Payment] Failed to create invoice:', invoiceError);
            // Don't fail the whole flow — payment is already recorded
        }

        // ── 8. Upgrade user account tier ──────────────────────────────────────
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month access

        await supabaseAdmin
            .from('user_profiles')
            .update({
                account_type:            planType,
                premium_until:           expiryDate.toISOString(),
                subscription_status:     'active',
            })
            .eq('id', userId);

        // ── 9. Log to audit_logs ──────────────────────────────────────────────
        await supabaseAdmin.from('audit_logs').insert({
            admin_email:  'SYSTEM',
            action_type:  'UPDATE',
            entity_type:  'payment',
            entity_id:    userId,
            details: {
                event:              'payment.verified',
                plan:               planType,
                payment_id:         razorpay_payment_id,
                order_id:           razorpay_order_id,
                invoice_number:     invoiceNumber,
                amount_inr:         (finalAmountPaise / 100).toFixed(2),
            }
        });

        // ── 10. Increment coupon usage ─────────────────────────────────────────
        if (couponCode) {
            await supabaseAdmin
                .from('coupons')
                .update({ used_count: supabaseAdmin.rpc('increment_coupon_usage', { p_code: couponCode }) })
                .eq('code', couponCode.toUpperCase());
        }

        return NextResponse.json({ success: true, invoice });

    } catch (err: any) {
        console.error('[Verify Payment] Server Error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
