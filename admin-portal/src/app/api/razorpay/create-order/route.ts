import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';
import {
    assertRazorpayConfigured,
    calculateOrderAmounts,
    getRazorpayCredentials,
} from '@/lib/razorpay';

export const dynamic = 'force-dynamic';

/**
 * POST /api/razorpay/create-order
 *
 * Creates a Razorpay order and saves a pending payment record to DB.
 * Amount includes 18% GST (matches public-website / colleges-platform checkout).
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, planType, couponCode } = body;

        if (!userId || !planType) {
            return NextResponse.json({ error: 'Missing userId or planType' }, { status: 400 });
        }

        assertRazorpayConfigured();
        const { keyId, keySecret, mode } = getRazorpayCredentials();

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        );

        let discountPercentage = 0;
        let validatedCouponCode: string | null = null;

        if (couponCode) {
            const { data: coupon, error: couponErr } = await supabaseAdmin
                .from('coupons')
                .select('*')
                .eq('code', couponCode.toUpperCase())
                .eq('is_active', true)
                .single();

            if (couponErr || !coupon) {
                return NextResponse.json({ error: 'Invalid or inactive coupon code' }, { status: 400 });
            }
            if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
                return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 });
            }
            if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
                return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 });
            }

            discountPercentage = coupon.discount_percentage;
            validatedCouponCode = coupon.code;
        }

        const amounts = calculateOrderAmounts(planType, discountPercentage);

        if (amounts.totalAmountPaise < 100) {
            return NextResponse.json({ error: 'Final amount too low for payment' }, { status: 400 });
        }

        const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
        const receipt = `rcpt_${userId.slice(0, 8)}_${Date.now()}`.substring(0, 40);

        const order = await razorpay.orders.create({
            amount: amounts.totalAmountPaise,
            currency: 'INR',
            receipt,
            notes: {
                user_id: userId,
                plan_type: planType,
                coupon_code: validatedCouponCode || '',
                taxable_amount: String(amounts.taxableAmount),
                gst_amount: String(amounts.gstAmount),
            },
        });

        if (!order?.id) {
            throw new Error('Failed to create Razorpay order');
        }

        const { error: insertError } = await supabaseAdmin.from('payments').insert({
            user_id: userId,
            razorpay_order_id: order.id,
            plan_type: planType,
            amount_paise: amounts.totalAmountPaise,
            currency: 'INR',
            coupon_code: validatedCouponCode,
            discount_paise: amounts.discountPaise,
            status: 'created',
        });

        if (insertError) {
            console.error('[Create Order] Failed to save payment record:', insertError);
        }

        if (mode === 'test') {
            console.warn('[Create Order] Using Razorpay TEST keys — payments are simulated only.');
        }

        return NextResponse.json({
            success: true,
            orderId: order.id,
            keyId,
            mode,
            amount: amounts.totalAmountPaise,
            currency: order.currency,
            taxableAmount: amounts.taxableAmount * 100,
            gstAmount: amounts.gstAmount * 100,
            discountPaise: amounts.discountPaise,
            finalAmount: amounts.totalAmountPaise,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        console.error('[Create Order] Error:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
