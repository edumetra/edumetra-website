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
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'Missing userId' });

        const supabase = createClient(
            process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        );

        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('razorpay_subscription_id')
            .eq('id', userId)
            .single();

        if (profileError || !profile || !profile.razorpay_subscription_id) {
            return res.status(404).json({ error: 'No active subscription found to cancel.' });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || '',
            key_secret: process.env.RAZORPAY_KEY_SECRET || '',
        });

        await razorpay.subscriptions.cancel(profile.razorpay_subscription_id, false);

        await supabase
            .from('user_profiles')
            .update({
                subscription_status: 'cancelled',
                account_type: 'free',
                razorpay_subscription_id: null
            })
            .eq('id', userId);

        return res.status(200).json({ success: true, message: 'Subscription cancelled successfully.' });

    } catch (err) {
        console.error('[cancel-subscription] Error:', err);
        return res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
};
