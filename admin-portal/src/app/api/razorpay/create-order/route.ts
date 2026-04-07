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

        // Initialize Supabase Admin Client to bypass RLS (optional, for validation)
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        );

        // Optionally fetch user profile to ensure they exist (commented out by default)
        // const { data: profile } = await supabaseAdmin.from('user_profiles').select('id, email').eq('id', userId).single();
        // if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Calculate amount based on plan
        let amountInPaise = 0;
        if (planType === 'pro') {
            amountInPaise = 799 * 100; // ₹799
        } else if (planType === 'premium') {
            amountInPaise = 299 * 100; // ₹299
        } else {
            return NextResponse.json({ error: 'Invalid planType' }, { status: 400 });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || '',
            key_secret: process.env.RAZORPAY_KEY_SECRET || '',
        });

        const options = {
            amount: amountInPaise,
            currency: 'INR',
            receipt: `receipt_${userId}_${Date.now()}`.substring(0, 40),
            notes: {
                user_id: userId,
                plan_type: planType
            }
        };

        const order = await razorpay.orders.create(options);

        if (!order || !order.id) {
            throw new Error('Failed to create Razorpay order');
        }

        return NextResponse.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
        });

    } catch (error: any) {
        console.error('[Razorpay Order Creation] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
