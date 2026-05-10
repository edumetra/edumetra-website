// Vercel Serverless Function — runs on the same domain as the public website
// Eliminates cross-origin CORS issues entirely since both are on edumetraglobal.com
// Secrets (Razorpay, Supabase service role) are kept server-side in Vercel env vars.

const Razorpay = require('razorpay');
const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
    // CORS headers (belt-and-suspenders, same-origin so shouldn't be needed)
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

        if (!userId || !planType) {
            return res.status(400).json({ error: 'Missing userId or planType' });
        }

        // Validate planType and resolve Razorpay Plan ID from server-side env
        let razorpayPlanId = '';
        if (planType === 'pro') {
            razorpayPlanId = process.env.RAZORPAY_PRO_PLAN_ID || '';
        } else if (planType === 'premium') {
            razorpayPlanId = process.env.RAZORPAY_PREMIUM_PLAN_ID || '';
        } else {
            return res.status(400).json({ error: 'Invalid planType' });
        }

        if (!razorpayPlanId) {
            console.error(`[create-subscription] Missing RAZORPAY_${planType.toUpperCase()}_PLAN_ID env var`);
            return res.status(500).json({ error: 'Subscription plans not configured. Please contact support.' });
        }

        // Initialise Razorpay with server-side secret (never exposed to browser)
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || '',
            key_secret: process.env.RAZORPAY_KEY_SECRET || '',
        });

        const options = {
            plan_id: razorpayPlanId,
            total_count: 120,          // 10 years max
            customer_notify: 1,
            notes: {
                user_id: userId,
                plan_type: planType,
                coupon_code: couponCode || null,
            },
        };

        // Handle coupon / Razorpay offer
        if (couponCode) {
            const supabase = createClient(
                process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
                process.env.SUPABASE_SERVICE_ROLE_KEY || ''
            );

            const { data: coupon } = await supabase
                .from('coupons')
                .select('id, code, discount_percentage, razorpay_offer_id, expires_at, max_uses, used_count, is_active')
                .eq('code', couponCode.toUpperCase())
                .eq('is_active', true)
                .single();

            if (!coupon) {
                return res.status(400).json({ error: 'Invalid or inactive coupon code' });
            }
            if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
                return res.status(400).json({ error: 'Coupon has expired' });
            }
            if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
                return res.status(400).json({ error: 'Coupon usage limit reached' });
            }
            if (coupon.razorpay_offer_id) {
                options.offer_id = coupon.razorpay_offer_id;
            }

            // Optimistically increment usage count
            await supabase
                .from('coupons')
                .update({ used_count: (coupon.used_count || 0) + 1 })
                .eq('id', coupon.id);
        }

        const subscription = await razorpay.subscriptions.create(options);

        if (!subscription || !subscription.id) {
            throw new Error('Razorpay did not return a subscription ID');
        }

        // Store the subscription ID in the database so the user can cancel it later
        const supabase = createClient(
            process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        );

        await supabase
            .from('user_profiles')
            .update({ 
                razorpay_subscription_id: subscription.id,
                subscription_status: 'active',
                account_type: planType // Optimistically set account type
            })
            .eq('id', userId);

        return res.status(200).json({
            success: true,
            subscriptionId: subscription.id,
        });

    } catch (err) {
        console.error('[create-subscription] Error:', err);
        return res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
};
