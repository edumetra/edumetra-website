import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-rtb-fingerprint-id, request-id');
    res.setHeader('Access-Control-Expose-Headers', 'x-rtb-fingerprint-id, request-id');

    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { userId, planType, couponCode } = body || {};

        if (!userId || !planType) {
            return res.status(400).json({ error: 'Missing userId or planType' });
        }

        const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET || process.env.VITE_RAZORPAY_KEY_SECRET;
        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY;

        const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Define Prices
        const PRICES = {
            premium: 3000,
            pro: 30000
        };

        let baseAmount = PRICES[planType] || 3000;
        let discount = 0;

        // Handle Coupon
        if (couponCode) {
            const { data: coupon } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', couponCode.toUpperCase())
                .eq('is_active', true)
                .single();
            
            if (coupon) {
                discount = Math.floor(baseAmount * (coupon.discount_percentage / 100));
            }
        }

        const taxableAmount = baseAmount - discount;
        const gstAmount = Math.floor(taxableAmount * 0.18);
        const totalAmount = taxableAmount + gstAmount;

        console.log('[DEBUG] Creating order for amount:', totalAmount, 'paise:', totalAmount * 100);
        
        let order;
        try {
            order = await rzp.orders.create({
                amount: totalAmount * 100, // in paise
                currency: 'INR',
                receipt: `receipt_${Date.now()}`,
                notes: {
                    user_id: userId,
                    plan_type: planType,
                    coupon_code: couponCode || null,
                    taxable_amount: taxableAmount,
                    gst_amount: gstAmount
                }
            });
        } catch (rzpErr) {
            console.error('[RAZORPAY ORDER ERROR]:', rzpErr);
            return res.status(400).json({ 
                error: 'Razorpay order creation failed', 
                details: rzpErr.description || rzpErr.message || JSON.stringify(rzpErr) 
            });
        }

        // Initialize Payment Record
        await supabase
            .from('payments')
            .insert({
                user_id: userId,
                razorpay_order_id: order.id,
                plan_type: planType,
                amount_paise: totalAmount * 100,
                discount_paise: discount * 100,
                coupon_code: couponCode || null,
                status: 'created'
            });

        return res.status(200).json({
            success: true,
            orderId: order.id,
            amount: totalAmount * 100,
            taxableAmount: taxableAmount * 100,
            gstAmount: gstAmount * 100
        });

    } catch (err) {
        console.error('[API ERROR]:', err);
        return res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
}
