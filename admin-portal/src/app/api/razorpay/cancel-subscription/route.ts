import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        );

        // Fetch the user's current subscription ID from the database
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('user_profiles')
            .select('razorpay_subscription_id')
            .eq('id', userId)
            .single();

        if (profileError || !profile || !profile.razorpay_subscription_id) {
            return NextResponse.json({ error: 'No active Razorpay subscription found for this user.' }, { status: 404 });
        }

        const subId = profile.razorpay_subscription_id;

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || '',
            key_secret: process.env.RAZORPAY_KEY_SECRET || '',
        });

        // Cancel the subscription on Razorpay
        // We set cancel_at_cycle_end to false to cancel immediately, or true to cancel at end of billing cycle.
        // Usually, immediate cancellation or end-of-cycle cancellation is preferred. We will just cancel immediately here to halt future billing.
        const response = await razorpay.subscriptions.cancel(subId, false);

        if (!response) {
            throw new Error('Failed to cancel Razorpay subscription via API');
        }

        // Technically, Razorpay will fire the `subscription.cancelled` webhook which will update the user's status to 'free'.
        // However, we can also proactively update it here for immediate UI reflection.
        await supabaseAdmin
            .from('user_profiles')
            .update({
                subscription_status: 'cancelled',
                account_type: 'free'
            })
            .eq('id', userId);

        return NextResponse.json({
            success: true,
            message: 'Subscription cancelled successfully.'
        });

    } catch (error: any) {
        console.error('[Razorpay Subscription Cancellation] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
