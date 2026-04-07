import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, planType } = body;

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
        const options = {
            plan_id: razorpayPlanId,
            total_count: 120, // Example: limits it to 10 years, can be changed.
            customer_notify: 1 as const,
            notes: {
                user_id: userId,
                plan_type: planType
            }
        };

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
