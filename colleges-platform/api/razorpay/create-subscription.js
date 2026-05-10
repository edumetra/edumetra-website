// Vercel Serverless Function — ESM Format
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { userId, planType, couponCode } = req.body;
        if (!userId || !planType) return res.status(400).json({ error: 'Missing userId or planType' });

        let razorpayPlanId = '';
        if (planType === 'pro') {
            razorpayPlanId = process.env.RAZORPAY_PRO_PLAN_ID;
        } else if (planType === 'premium') {
            razorpayPlanId = process.env.RAZORPAY_PREMIUM_PLAN_ID;
        }

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
            total_count: 12,
            customer_notify: 1,
            notes: { user_id: userId, plan_type: planType, coupon_code: couponCode || null },
        };

        if (couponCode) {
            const { data: coupon } = await supabase.from('coupons').select('*').eq('code', couponCode.toUpperCase()).eq('is_active', true).single();
            if (coupon && coupon.razorpay_offer_id) options.offer_id = coupon.razorpay_offer_id;
        }

        const subscription = await razorpay.subscriptions.create(options);

        await supabase.from('user_profiles').update({ 
            razorpay_subscription_id: subscription.id,
            subscription_status: 'active',
            account_type: planType
        }).eq('id', userId);

        return res.status(200).json({ success: true, subscriptionId: subscription.id });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
