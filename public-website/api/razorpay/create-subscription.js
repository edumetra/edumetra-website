// Vercel Serverless Function — ESM Format
// Runs on the same domain to eliminate CORS issues.
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userId, planType, couponCode } = req.body;
        console.log(`[create-subscription] Request for User: ${userId}, Plan: ${planType}`);

        if (!userId || !planType) {
            return res.status(400).json({ error: 'Missing userId or planType' });
        }

        // 1. Resolve Razorpay Plan ID
        let razorpayPlanId = '';
        if (planType === 'pro') {
            razorpayPlanId = process.env.RAZORPAY_PRO_PLAN_ID;
        } else if (planType === 'premium') {
            razorpayPlanId = process.env.RAZORPAY_PREMIUM_PLAN_ID;
        }

        if (!razorpayPlanId) {
            console.error(`[create-subscription] Missing Plan ID for ${planType}`);
            return res.status(500).json({ error: `Plan ID for ${planType} not configured in Vercel environment variables.` });
        }

        // 2. Initialize Clients
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || '',
            key_secret: process.env.RAZORPAY_KEY_SECRET || '',
        });

        const supabase = createClient(
            process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        );

        const options = {
            plan_id: razorpayPlanId,
            total_count: 12, // 12 months as requested
            customer_notify: 1,
            notes: {
                user_id: userId,
                plan_type: planType,
                coupon_code: couponCode || null,
            },
        };

        // 3. Handle Coupon
        if (couponCode) {
            console.log(`[create-subscription] Validating coupon: ${couponCode}`);
            const { data: coupon, error: couponErr } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', couponCode.toUpperCase())
                .eq('is_active', true)
                .single();

            if (couponErr) {
                console.warn('[create-subscription] Coupon fetch error:', couponErr.message);
            } else if (coupon && coupon.razorpay_offer_id) {
                options.offer_id = coupon.razorpay_offer_id;
                console.log(`[create-subscription] Applied Razorpay Offer: ${coupon.razorpay_offer_id}`);
            }
        }

        // 4. Create Subscription on Razorpay
        console.log('[create-subscription] Calling Razorpay API...');
        const subscription = await razorpay.subscriptions.create(options);

        if (!subscription || !subscription.id) {
            throw new Error('Razorpay did not return a valid subscription object.');
        }

        console.log(`[create-subscription] Success: ${subscription.id}`);

        // 5. Update User Profile in Supabase
        const { error: dbError } = await supabase
            .from('user_profiles')
            .update({ 
                razorpay_subscription_id: subscription.id,
                subscription_status: 'active',
                account_type: planType
            })
            .eq('id', userId);

        if (dbError) {
            console.error('[create-subscription] Database update failed:', dbError.message);
            // We don't throw here because the subscription was successfully created on Razorpay
        }

        return res.status(200).json({
            success: true,
            subscriptionId: subscription.id,
        });

    } catch (err) {
        console.error('[create-subscription] FATAL ERROR:', err);
        return res.status(500).json({ 
            error: err.message || 'Internal Server Error',
            details: 'Check Vercel Function logs for more info.'
        });
    }
};
