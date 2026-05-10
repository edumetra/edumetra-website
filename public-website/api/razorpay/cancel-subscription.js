// Vercel Serverless Function to cancel a Razorpay subscription
// Same-origin approach to avoid CORS issues on www.edumetraglobal.com

const Razorpay = require('razorpay');
const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'Missing userId' });

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        );

        // 1. Get the subscription ID from the user's profile
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

        // 2. Cancel on Razorpay (false = cancel immediately)
        await razorpay.subscriptions.cancel(profile.razorpay_subscription_id, false);

        // 3. Update local DB status
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
