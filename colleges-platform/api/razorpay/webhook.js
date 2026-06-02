import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { sendCapiEvent } from '../helpers/capi.js';

// Disable Vercel's automatic body parsing to receive the raw body needed for signature verification
export const config = {
    api: {
        bodyParser: false,
    },
};

async function getRawBody(req) {
    const chunks = [];
    for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks).toString('utf-8');
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const rawBody = await getRawBody(req);
        const signature = req.headers['x-razorpay-signature'];
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!secret || !signature) {
            console.error('[Webhook Error]: Missing signature or webhook secret.');
            return res.status(400).json({ error: 'Missing signature or webhook secret' });
        }

        // 1. Verify Signature
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(rawBody)
            .digest('hex');

        if (expectedSignature !== signature) {
            console.error('[Webhook Error]: Invalid signature verification.');
            return res.status(400).json({ error: 'Invalid signature verification' });
        }

        const event = JSON.parse(rawBody);
        console.log(`[Webhook Success]: Event received: ${event.event}`);

        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 2. Handle payment.captured
        if (event.event === 'payment.captured') {
            const paymentEntity = event.payload.payment.entity;
            const userId = paymentEntity.notes?.user_id;
            const planType = paymentEntity.notes?.plan_type || 'premium';
            const orderId = paymentEntity.order_id;

            if (!userId) {
                console.warn('[Webhook Warning]: No user_id in notes - ignoring.');
                return res.status(200).json({ message: 'No user_id in notes - ignoring' });
            }

            // Fetch payment record
            const { data: paymentRecord } = await supabase
                .from('payments')
                .select('*')
                .eq('razorpay_order_id', orderId)
                .single();

            if (!paymentRecord) {
                console.warn('[Webhook Warning]: No corresponding payment record found in DB.');
                return res.status(200).json({ message: 'No payment record found - ignoring' });
            }

            // Update payment record to paid
            const { data: updatedPayment } = await supabase
                .from('payments')
                .update({
                    razorpay_payment_id: paymentEntity.id,
                    status: 'paid'
                })
                .eq('id', paymentRecord.id)
                .select()
                .single();

            // Fetch user info for profile update
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('full_name, phone_number')
                .eq('id', userId)
                .single();

            const { data: authUser } = await supabase.auth.admin.getUserById(userId);

            // Check if invoice already exists
            const { data: existingInvoice } = await supabase
                .from('invoices')
                .select('id')
                .eq('payment_id', paymentRecord.id)
                .single();

            if (!existingInvoice) {
                // Generate invoice number
                const { data: invoiceNumber } = await supabase.rpc('generate_invoice_number');

                // Create invoice record
                await supabase
                    .from('invoices')
                    .insert({
                        invoice_number: invoiceNumber || `EDU-WEB-${Date.now()}`,
                        payment_id: paymentRecord.id,
                        user_id: userId,
                        user_email: authUser?.user?.email || 'user@example.com',
                        user_name: profile?.full_name || 'Valued Student',
                        plan_type: planType,
                        amount_paise: paymentRecord.amount_paise,
                        discount_paise: paymentRecord.discount_paise || 0,
                        total_paise: paymentRecord.amount_paise - (paymentRecord.discount_paise || 0),
                        billing_period: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
                        razorpay_payment_id: paymentEntity.id
                    });
            }

            // Upgrade User Profile
            await supabase
                .from('user_profiles')
                .update({ 
                    account_type: planType,
                    subscription_status: 'active'
                })
                .eq('id', userId);

            // Track Purchase event via Meta CAPI (Server-Side Webhook Backup)
            try {
                const email = authUser?.user?.email || 'user@example.com';
                const phone = profile?.phone_number || authUser?.user?.phone || authUser?.user?.user_metadata?.phone;
                const totalPaid = (paymentRecord.amount_paise - (paymentRecord.discount_paise || 0)) / 100;
                
                const protocol = req.headers['x-forwarded-proto'] || 'https';
                const host = req.headers.host || 'colleges.edumetra.com';
                const eventSourceUrl = `${protocol}://${host}/checkout`;

                await sendCapiEvent(
                    'Purchase',
                    {
                        email,
                        phone,
                        clientIp: null,
                        userAgent: null,
                        eventSourceUrl
                    },
                    {
                        value: totalPaid,
                        currency: 'INR',
                        content_name: `${planType.toUpperCase()} Payment`
                    },
                    paymentEntity.id
                );
            } catch (capiErr) {
                console.error('[FB CAPI Purchase Webhook Error]:', capiErr);
            }

            return res.status(200).json({ success: true, message: `Upgraded user ${userId}` });
        }

        // 3. Handle payment.failed
        if (event.event === 'payment.failed') {
            const paymentEntity = event.payload.payment.entity;
            const orderId = paymentEntity.order_id;

            if (orderId) {
                await supabase
                    .from('payments')
                    .update({
                        status: 'failed',
                        failure_reason: paymentEntity.error_description || 'Payment failed'
                    })
                    .eq('razorpay_order_id', orderId);
            }

            return res.status(200).json({ success: true, message: 'payment.failed recorded' });
        }

        return res.status(200).json({ message: 'Event acknowledged' });

    } catch (err) {
        console.error('[Webhook System Error]:', err);
        return res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
}
