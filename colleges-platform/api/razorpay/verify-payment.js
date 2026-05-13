import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { 
            razorpay_payment_id, 
            razorpay_order_id, 
            razorpay_signature,
            userId,
            planType 
        } = req.body;

        if (!razorpay_payment_id || !razorpay_signature || !userId || !razorpay_order_id) {
            return res.status(400).json({ error: 'Missing required payment verification fields' });
        }

        const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET || process.env.VITE_RAZORPAY_KEY_SECRET;
        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY;

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 1. Fetch Payment Record
        const { data: payment, error: paymentError } = await supabase
            .from('payments')
            .select('*')
            .eq('razorpay_order_id', razorpay_order_id)
            .single();

        if (paymentError || !payment) {
            throw new Error('Payment record not found.');
        }

        // 2. Update Payment to Paid
        await supabase
            .from('payments')
            .update({
                razorpay_payment_id,
                razorpay_signature,
                status: 'paid'
            })
            .eq('id', payment.id);

        // 3. Get User Info for Invoice
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('full_name')
            .eq('id', userId)
            .single();

        const { data: authUser } = await supabase.auth.admin.getUserById(userId);

        // 4. Generate Invoice Number via RPC
        const { data: invoiceNumber } = await supabase.rpc('generate_invoice_number');

        // 5. Create Invoice Record
        const { data: invoice, error: invoiceErr } = await supabase
            .from('invoices')
            .insert({
                invoice_number: invoiceNumber || `EDU-${Date.now()}`,
                payment_id: payment.id,
                user_id: userId,
                user_email: authUser?.user?.email || 'user@example.com',
                user_name: profile?.full_name || 'Valued Student',
                plan_type: planType,
                amount_paise: payment.amount_paise,
                discount_paise: payment.discount_paise || 0,
                total_paise: payment.amount_paise - (payment.discount_paise || 0),
                billing_period: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
                razorpay_payment_id: razorpay_payment_id
            })
            .select()
            .single();

        if (invoiceErr) throw invoiceErr;

        // 6. Update User Profile (Direct Payment - No Subscription)
        const { error: profileUpdateErr } = await supabase
            .from('user_profiles')
            .update({ 
                account_type: planType,
                subscription_status: 'active'
            })
            .eq('id', userId);

        if (profileUpdateErr) {
            console.error('[Profile Update Warning]:', profileUpdateErr);
            // Non-fatal, but logged
        }

        return res.status(200).json({
            success: true,
            invoice
        });

    } catch (err) {
        console.error('[Verify Error]:', err);
        return res.status(500).json({ error: err.message || 'Verification failed' });
    }
}
