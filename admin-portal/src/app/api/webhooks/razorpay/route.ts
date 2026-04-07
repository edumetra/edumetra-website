import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    // Initialize Supabase Admin Client to bypass RLS
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

        // Verify Signature
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(rawBody)
            .digest('hex');

        if (expectedSignature !== signature) {
            console.error('[Razorpay Webhook] Invalid signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        // Parse the event payload
        const event = JSON.parse(rawBody);
        console.log(`[Razorpay Webhook] Received Event: ${event.event}`);

        // Process specific Razorpay events
        if (event.event === 'payment.captured' || event.event === 'subscription.charged') {
            const paymentEntity = event.event === 'subscription.charged' ? event.payload.subscription.entity : event.payload.payment.entity;

            // 1. Validate user_id
            const userId = paymentEntity.notes?.user_id;
            if (!userId) {
                console.warn(`[Razorpay Webhook] Payment captured/Subscription charged but no user_id found in notes. ID: ${paymentEntity.id}`);

                // Log skip event to audit_logs
                await supabaseAdmin.from('audit_logs').insert({
                    admin_email: 'SYSTEM',
                    action_type: 'OTHER',
                    entity_type: 'subscription',
                    details: {
                        event: event.event,
                        status: 'skipped_missing_userid',
                        razorpay_id: paymentEntity.id
                    }
                });

                return NextResponse.json({ message: 'No user_id in notes - ignoring' }, { status: 200 });
            }

            // 2. Perform Upgrade
            const newTier = paymentEntity.notes?.plan_type || 'premium';
            const expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);

            console.log(`[Razorpay Webhook] Upgrading User ${userId} to ${newTier}`);

            const { data: profile, error: updateError } = await supabaseAdmin
                .from('user_profiles')
                .update({
                    account_type: newTier,
                    premium_until: expiryDate.toISOString(),
                    razorpay_customer_id: paymentEntity.customer_id || null,
                    razorpay_subscription_id: event.event === 'subscription.charged' ? paymentEntity.id : null,
                    subscription_status: event.event === 'subscription.charged' ? 'active' : null
                })
                .match({ id: userId })
                .select()
                .single();

            if (updateError) {
                console.error(`[Razorpay Webhook] Supabase Update Failed:`, updateError);
                return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
            }

            // 3. Log Success to Audit Logs
            await supabaseAdmin.from('audit_logs').insert({
                admin_email: 'SYSTEM',
                action_type: 'UPDATE',
                entity_type: 'user_profile',
                entity_id: userId,
                details: {
                    event: event.event,
                    tier: newTier,
                    expiry: expiryDate.toISOString(),
                    payment_id: paymentEntity.id,
                    profile_snapshot: profile
                }
            });

            return NextResponse.json({ success: true, message: `Upgraded user ${userId}` }, { status: 200 });
        } else if (event.event === 'subscription.cancelled' || event.event === 'subscription.halted') {
            const subscriptionEntity = event.payload.subscription.entity;
            const subId = subscriptionEntity.id;
            const status = event.event === 'subscription.cancelled' ? 'cancelled' : 'halted';

            console.log(`[Razorpay Webhook] Subscription ${subId} changed to ${status}`);

            const { data: profile, error: updateError } = await supabaseAdmin
                .from('user_profiles')
                .update({
                    account_type: 'free',
                    subscription_status: status
                })
                .match({ razorpay_subscription_id: subId })
                .select()
                .single();

            if (updateError && updateError.code !== 'PGRST116') {
                console.error(`[Razorpay Webhook] Supabase Downgrade Failed:`, updateError);
            }

            if (profile) {
                // Log downgrade to Audit Logs
                await supabaseAdmin.from('audit_logs').insert({
                    admin_email: 'SYSTEM',
                    action_type: 'UPDATE',
                    entity_type: 'user_profile',
                    entity_id: profile.id,
                    details: {
                        event: event.event,
                        tier: 'free',
                        payment_id: subId,
                        profile_snapshot: profile
                    }
                });
            }

            return NextResponse.json({ success: true, message: `Downgraded subscription ${subId}` }, { status: 200 });
        }

        // Acknowledge other events
        return NextResponse.json({ message: 'Event acknowledged' }, { status: 200 });

    } catch (err: any) {
        console.error(`[Razorpay Webhook] Server Error:`, err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
