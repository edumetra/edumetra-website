import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // 1. Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(204).end();

    try {
        // 2. Parse Body Safely
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { userId, planType, couponCode } = body || {};

        console.log('[API] Create Subscription Request:', { userId, planType });

        if (!userId || !planType) {
            return res.status(400).json({ error: 'Missing userId or planType in request body' });
        }

        // 3. Get Keys with multiple fallbacks
        const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET || process.env.VITE_RAZORPAY_KEY_SECRET;
        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY;

        if (!keyId || !keySecret) {
            throw new Error('Razorpay API keys are not configured in Vercel environment variables.');
        }

        // 4. Resolve Plan ID
        let razorpayPlanId = '';
        if (planType === 'pro') razorpayPlanId = process.env.RAZORPAY_PRO_PLAN_ID;
        else if (planType === 'premium') razorpayPlanId = process.env.RAZORPAY_PREMIUM_PLAN_ID;

        if (!razorpayPlanId) {
            throw new Error(`Plan ID for ${planType} is missing in environment variables.`);
        }

        // 5. Initialize SDKs
        const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
        const supabase = createClient(supabaseUrl || '', supabaseServiceKey || '');

        // 6. Create Subscription
        const subscriptionOptions = {
            plan_id: razorpayPlanId,
            total_count: 12,
            customer_notify: 1,
            notes: {
                user_id: userId,
                plan_type: planType,
                coupon_code: couponCode || null
            }
        };

        // Handle Coupon
        if (couponCode) {
            const { data: coupon } = await supabase
                .from('coupons')
                .select('razorpay_offer_id')
                .eq('code', couponCode.toUpperCase())
                .eq('is_active', true)
                .single();
            
            if (coupon?.razorpay_offer_id) {
                subscriptionOptions.offer_id = coupon.razorpay_offer_id;
            }
        }

        const subscription = await rzp.subscriptions.create(subscriptionOptions);

        // 7. Update Database
        await supabase
            .from('user_profiles')
            .update({ 
                razorpay_subscription_id: subscription.id,
                subscription_status: 'active',
                account_type: planType 
            })
            .eq('id', userId);

        return res.status(200).json({
            success: true,
            subscriptionId: subscription.id
        });

    } catch (err) {
        console.error('[API ERROR]:', err);
        return res.status(500).json({ 
            error: err.message || 'Internal Server Error',
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
}
