import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    try {
        const rawBody = await req.text();
        const signature = req.headers.get('x-razorpay-signature');
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!secret || !signature) {
            console.error('[Razorpay Webhook] Missing signature or secret');
            return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
        }

        // ── Verify Signature ──────────────────────────────────────────────────
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(rawBody)
            .digest('hex');

        if (expectedSignature !== signature) {
            console.error('[Razorpay Webhook] Invalid signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        const event = JSON.parse(rawBody);
        console.log(`[Razorpay Webhook] Event: ${event.event}`);

        // ── payment.captured ──────────────────────────────────────────────────
        if (event.event === 'payment.captured') {
            const paymentEntity = event.payload.payment.entity;
            const userId    = paymentEntity.notes?.user_id;
            const planType  = paymentEntity.notes?.plan_type || 'premium';
            const orderId   = paymentEntity.order_id;

            if (!userId) {
                console.warn('[Webhook] payment.captured — no user_id in notes:', paymentEntity.id);
                return NextResponse.json({ message: 'No user_id in notes - ignoring' }, { status: 200 });
            }

            // Update payment record
            const { data: paymentRecord } = await supabaseAdmin
                .from('payments')
                .update({
                    razorpay_payment_id: paymentEntity.id,
                    status: 'paid',
                })
                .eq('razorpay_order_id', orderId)
                .select()
                .single();

            // Upgrade user
            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + 1);

            const { data: profile } = await supabaseAdmin
                .from('user_profiles')
                .update({
                    account_type:        planType,
                    premium_until:       expiryDate.toISOString(),
                    razorpay_customer_id: paymentEntity.customer_id || null,
                    subscription_status: 'active',
                })
                .eq('id', userId)
                .select()
                .single();

            // Generate invoice if payment record exists and no invoice yet
            if (paymentRecord) {
                const { data: existingInvoice } = await supabaseAdmin
                    .from('invoices')
                    .select('id')
                    .eq('payment_id', paymentRecord.id)
                    .single();

                if (!existingInvoice) {
                    const { data: invoiceNumber } = await supabaseAdmin
                        .rpc('generate_invoice_number');

                    const billingPeriod = new Date().toLocaleDateString('en-IN', {
                        month: 'long', year: 'numeric'
                    });

                    await supabaseAdmin.from('invoices').insert({
                        invoice_number:      invoiceNumber || `EDU-WEBHOOK-${Date.now()}`,
                        payment_id:          paymentRecord.id,
                        user_id:             userId,
                        user_email:          profile?.email || paymentEntity.email || '',
                        user_name:           profile?.full_name || '',
                        plan_type:           planType,
                        amount_paise:        paymentRecord.amount_paise,
                        discount_paise:      paymentRecord.discount_paise || 0,
                        tax_paise:           0,
                        total_paise:         paymentRecord.amount_paise - (paymentRecord.discount_paise || 0),
                        billing_period:      billingPeriod,
                        razorpay_payment_id: paymentEntity.id,
                    });
                }
            }

            // Audit log
            await supabaseAdmin.from('audit_logs').insert({
                admin_email: 'SYSTEM',
                action_type: 'UPDATE',
                entity_type: 'user_profile',
                entity_id:   userId,
                details: {
                    event:      event.event,
                    tier:       planType,
                    expiry:     expiryDate.toISOString(),
                    payment_id: paymentEntity.id,
                }
            });

            return NextResponse.json({ success: true, message: `Upgraded user ${userId}` }, { status: 200 });
        }

        // ── subscription.charged ──────────────────────────────────────────────
        if (event.event === 'subscription.charged') {
            const subscriptionEntity = event.payload.subscription.entity;
            const paymentEntity = event.payload.payment?.entity;
            const userId = subscriptionEntity.notes?.user_id;
            const planType = subscriptionEntity.notes?.plan_type || 'premium';

            if (!userId) {
                return NextResponse.json({ message: 'No user_id - ignoring' }, { status: 200 });
            }

            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + 1);

            const { data: profile } = await supabaseAdmin
                .from('user_profiles')
                .update({
                    account_type:             planType,
                    premium_until:            expiryDate.toISOString(),
                    razorpay_subscription_id: subscriptionEntity.id,
                    subscription_status:      'active',
                })
                .eq('id', userId)
                .select()
                .single();

            // Generate invoice for subscription renewal
            if (paymentEntity) {
                const { data: invoiceNumber } = await supabaseAdmin.rpc('generate_invoice_number');
                const billingPeriod = new Date().toLocaleDateString('en-IN', {
                    month: 'long', year: 'numeric'
                });
                const amountPaise = Number(paymentEntity.amount) || 0;

                // Upsert payment record
                const { data: paymentRecord } = await supabaseAdmin
                    .from('payments')
                    .upsert({
                        user_id:             userId,
                        razorpay_order_id:   paymentEntity.order_id || `sub_${subscriptionEntity.id}_${Date.now()}`,
                        razorpay_payment_id: paymentEntity.id,
                        plan_type:           planType,
                        amount_paise:        amountPaise,
                        currency:            'INR',
                        status:              'paid',
                    }, { onConflict: 'razorpay_order_id' })
                    .select()
                    .single();

                if (paymentRecord) {
                    await supabaseAdmin.from('invoices').insert({
                        invoice_number:      invoiceNumber || `EDU-SUB-${Date.now()}`,
                        payment_id:          paymentRecord.id,
                        user_id:             userId,
                        user_email:          profile?.email || '',
                        user_name:           profile?.full_name || '',
                        plan_type:           planType,
                        amount_paise:        amountPaise,
                        discount_paise:      0,
                        tax_paise:           0,
                        total_paise:         amountPaise,
                        billing_period:      billingPeriod,
                        razorpay_payment_id: paymentEntity.id,
                    });
                }
            }

            await supabaseAdmin.from('audit_logs').insert({
                admin_email: 'SYSTEM',
                action_type: 'UPDATE',
                entity_type: 'user_profile',
                entity_id:   userId,
                details: { event: event.event, tier: planType, expiry: expiryDate.toISOString() }
            });

            return NextResponse.json({ success: true }, { status: 200 });
        }

        // ── subscription.cancelled / halted ───────────────────────────────────
        if (event.event === 'subscription.cancelled' || event.event === 'subscription.halted') {
            const subscriptionEntity = event.payload.subscription.entity;
            const subId = subscriptionEntity.id;
            const status = event.event === 'subscription.cancelled' ? 'cancelled' : 'halted';

            const { data: profile } = await supabaseAdmin
                .from('user_profiles')
                .update({ account_type: 'free', subscription_status: status })
                .match({ razorpay_subscription_id: subId })
                .select()
                .single();

            if (profile) {
                await supabaseAdmin.from('audit_logs').insert({
                    admin_email: 'SYSTEM',
                    action_type: 'UPDATE',
                    entity_type: 'user_profile',
                    entity_id:   profile.id,
                    details:     { event: event.event, tier: 'free', subscription_id: subId }
                });
            }

            return NextResponse.json({ success: true, message: `Subscription ${subId} ${status}` }, { status: 200 });
        }

        // ── payment.failed ────────────────────────────────────────────────────
        if (event.event === 'payment.failed') {
            const paymentEntity = event.payload.payment.entity;
            const orderId = paymentEntity.order_id;

            if (orderId) {
                await supabaseAdmin
                    .from('payments')
                    .update({
                        status:         'failed',
                        failure_reason: paymentEntity.error_description || 'Payment failed',
                    })
                    .eq('razorpay_order_id', orderId);
            }

            return NextResponse.json({ message: 'payment.failed recorded' }, { status: 200 });
        }

        // Acknowledge other events
        return NextResponse.json({ message: 'Event acknowledged' }, { status: 200 });

    } catch (err: any) {
        console.error(`[Razorpay Webhook] Server Error:`, err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
