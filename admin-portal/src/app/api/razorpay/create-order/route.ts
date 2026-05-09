import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * POST /api/razorpay/create-order
 *
 * Creates a Razorpay order and saves a pending payment record to DB.
 * Supports optional coupon discounts validated server-side.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, planType, couponCode } = body;

        if (!userId || !planType) {
            return NextResponse.json({ error: 'Missing userId or planType' }, { status: 400 });
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        );

        // ── Calculate base amount ─────────────────────────────────────────────
        let baseAmountPaise = 0;
        if (planType === 'pro') {
            baseAmountPaise = 30000 * 100; // ₹30,000
        } else if (planType === 'premium') {
            baseAmountPaise = 3000 * 100;  // ₹3,000
        } else {
            return NextResponse.json({ error: 'Invalid planType' }, { status: 400 });
        }

        // ── Validate coupon & apply discount ──────────────────────────────────
        let discountPaise = 0;
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

            discountPaise = Math.floor(baseAmountPaise * (coupon.discount_percentage / 100));
            validatedCouponCode = coupon.code;
        }

        const finalAmountPaise = baseAmountPaise - discountPaise;

        if (finalAmountPaise < 100) {
            return NextResponse.json({ error: 'Final amount too low for payment' }, { status: 400 });
        }

        // ── Create Razorpay order ─────────────────────────────────────────────
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || '',
            key_secret: process.env.RAZORPAY_KEY_SECRET || '',
        });

        const receipt = `rcpt_${userId.slice(0, 8)}_${Date.now()}`.substring(0, 40);

        const order = await razorpay.orders.create({
            amount: finalAmountPaise,
            currency: 'INR',
            receipt,
            notes: {
                user_id:     userId,
                plan_type:   planType,
                coupon_code: validatedCouponCode || '',
            }
        });

        if (!order || !order.id) {
            throw new Error('Failed to create Razorpay order');
        }

        // ── Save payment record in DB (status: created) ───────────────────────
        const { error: insertError } = await supabaseAdmin
            .from('payments')
            .insert({
                user_id:           userId,
                razorpay_order_id: order.id,
                plan_type:         planType,
                amount_paise:      baseAmountPaise,
                currency:          'INR',
                coupon_code:       validatedCouponCode,
                discount_paise:    discountPaise,
                status:            'created',
            });

        if (insertError) {
            console.error('[Create Order] Failed to save payment record:', insertError);
            // Don't block the user — order is still valid
        }

        return NextResponse.json({
            success:       true,
            orderId:       order.id,
            amount:        order.amount,
            currency:      order.currency,
            discountPaise,
            finalAmount:   finalAmountPaise,
        });

    } catch (error: any) {
        console.error('[Create Order] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
