import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, planType, couponCode } = body;

        if (!userId || !planType) {
            return NextResponse.json({ error: 'Missing userId or planType' }, { status: 400 });
        }

        // Fetch user from DB to verify user and maybe get existing customer_id
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        );

        let razorpayPlanId = '';
        if (planType === 'pro') {
            razorpayPlanId = process.env.RAZORPAY_PRO_PLAN_ID || '';
        } else if (planType === 'premium') {
            razorpayPlanId = process.env.RAZORPAY_PREMIUM_PLAN_ID || '';
        } else {
            return NextResponse.json({ error: 'Invalid planType' }, { status: 400 });
        }

        if (!razorpayPlanId) {
            console.error(`Missing Razorpay Plan ID for ${planType} in .env`);
            return NextResponse.json({ error: 'Subscription plans not fully configured server-side.' }, { status: 500 });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || '',
            key_secret: process.env.RAZORPAY_KEY_SECRET || '',
        });

        // Create the recurring subscription
        const options: any = {
            plan_id: razorpayPlanId,
            total_count: 120,
            customer_notify: 1 as const,
            notes: {
                user_id: userId,
                plan_type: planType,
                coupon_code: couponCode || null
            }
        };

        // 3. Handle Coupon / Offer
        if (couponCode) {
            const { data: coupon } = await supabaseAdmin
                .from('coupons')
                .select('*')
                .eq('code', couponCode.toUpperCase())
                .eq('is_active', true)
                .single();

            if (coupon) {
                // Check expiry
                if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
                    return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 });
                }
                // Check usage limits
                if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
                    return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 });
                }

                if (coupon.razorpay_offer_id) {
                    options.offer_id = coupon.razorpay_offer_id;
                }

                // Increment usage count (optimistic)
                await supabaseAdmin
                    .from('coupons')
                    .update({ used_count: (coupon.used_count || 0) + 1 })
                    .eq('id', coupon.id);
            } else {
                return NextResponse.json({ error: 'Invalid or inactive coupon code' }, { status: 400 });
            }
        }

        const subscription = await razorpay.subscriptions.create(options);

        if (!subscription || !subscription.id) {
            throw new Error('Failed to create Razorpay subscription');
        }

        return NextResponse.json({
            success: true,
            subscriptionId: subscription.id,
        });

    } catch (error: any) {
        console.error('[Razorpay Subscription Creation] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
