import { createAdminClient } from "@/utils/supabase/admin";
import { renderTemplate, resolveTemplate } from "@/lib/engagement/templates";
import { sendViaProvider } from "@/lib/engagement/providers";

// Engagement tables use jsonb columns which clash with the generated Json type.
// We use an untyped client to avoid spurious type errors on metadata/payload fields.
// All other type safety (channel enums, status enums) is enforced at the TS layer above.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => createAdminClient() as any;

type Channel = "email" | "sms" | "rcs" | "whatsapp";

type EnrollmentInput = {
    userId: string;
    campaignSlug?: string;
    metadata?: Record<string, unknown>;
};

const parseQuietHours = (hour: number, start: number, end: number) => {
    if (start === end) return false;
    if (start < end) return hour >= start && hour < end;
    return hour >= start || hour < end;
};

const isTransientError = (message?: string | null) => {
    if (!message) return false;
    const m = message.toLowerCase();
    return m.includes("timeout") || m.includes("429") || m.includes("temporary");
};

const chooseVariant = (userId: string) => {
    const code = userId.charCodeAt(0) || 0;
    return code % 10 === 0 ? "HOLDOUT" : code % 2 === 0 ? "A" : "B";
};

export const enrollUser = async ({ userId, campaignSlug = "signup_activation_5day", metadata = {} }: EnrollmentInput) => {
    const supabase = db();

    const { data: campaign, error: campaignError } = await supabase
        .from("engagement_campaigns")
        .select("id,is_active")
        .eq("slug", campaignSlug)
        .single();

    if (campaignError || !campaign?.is_active) {
        throw new Error("Campaign not found or inactive");
    }

    const variant = chooseVariant(userId);
    const holdoutGroup = variant === "HOLDOUT";

    const { data, error } = await supabase
        .from("engagement_enrollments")
        .upsert(
            {
                user_id: userId,
                campaign_id: campaign.id,
                status: "active",
                current_step_order: 1,
                next_run_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                holdout_group: holdoutGroup,
                variant: holdoutGroup ? "A" : variant,
                metadata,
            },
            { onConflict: "user_id,campaign_id" }
        )
        .select("id,user_id,campaign_id,holdout_group,variant,status")
        .single();

    if (error) throw new Error(error.message);
    return data;
};

const resolveChannel = async (userId: string, primary: Channel, fallback: Channel | null): Promise<Channel | null> => {
    const supabase = db();
    const { data, error } = await supabase.rpc("resolve_user_channel", {
        p_user_id: userId,
        p_primary_channel: primary,
        p_fallback_channel: fallback,
    });

    if (error) throw new Error(error.message);
    return data;
};

const exceededDailyCap = async (userId: string, maxTouches: number) => {
    const supabase = db();
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);

    const { count, error } = await supabase
        .from("engagement_messages")
        .select("id", { head: true, count: "exact" })
        .eq("user_id", userId)
        .in("status", ["queued", "sent", "delivered", "read"])
        .gte("sent_at", since.toISOString());

    if (error) throw new Error(error.message);
    return (count ?? 0) >= maxTouches;
};

const getUserContact = async (userId: string, channel: Channel): Promise<string | null> => {
    const supabase = db();

    if (channel === "email") {
        // Email lives on auth.users, NOT user_profiles
        const { data, error } = await supabase.auth.admin.getUserById(userId);
        if (error || !data?.user?.email) return null;
        return data.user.email;
    }

    // Phone for SMS / RCS / WhatsApp lives on user_profiles
    const { data, error } = await supabase
        .from("user_profiles")
        .select("phone_number")
        .eq("id", userId)
        .single();

    if (error) return null;
    return data?.phone_number ?? null;
};

export const runDispatcher = async () => {
    const supabase = db();
    const nowIso = new Date().toISOString();

    const { data: enrollments, error } = await supabase
        .from("engagement_enrollments")
        .select("id,user_id,campaign_id,current_step_order,holdout_group,variant,metadata")
        .eq("status", "active")
        .lte("next_run_at", nowIso)
        .limit(100);

    if (error) throw new Error(error.message);

    const processed: Array<Record<string, string>> = [];

    for (const enrollment of enrollments ?? []) {
        const { data: step } = await supabase
            .from("engagement_steps")
            .select("id,step_order,day_offset,channel,fallback_channel,template_key,max_attempts")
            .eq("campaign_id", enrollment.campaign_id)
            .eq("step_order", enrollment.current_step_order)
            .eq("is_active", true)
            .single();

        if (!step) {
            await supabase
                .from("engagement_enrollments")
                .update({ status: "completed", completed_at: nowIso, updated_at: nowIso })
                .eq("id", enrollment.id);
            processed.push({ enrollmentId: enrollment.id, status: "completed" });
            continue;
        }

        if (enrollment.holdout_group) {
            await supabase
                .from("engagement_enrollments")
                .update({
                    current_step_order: enrollment.current_step_order + 1,
                    next_run_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                    updated_at: nowIso,
                })
                .eq("id", enrollment.id);

            processed.push({ enrollmentId: enrollment.id, status: "holdout_skipped" });
            continue;
        }

        const { data: prefs } = await supabase
            .from("user_channel_preferences")
            .select("quiet_hours_start,quiet_hours_end,max_touches_per_day,timezone,unsubscribed_at")
            .eq("user_id", enrollment.user_id)
            .maybeSingle();

        if (prefs?.unsubscribed_at) {
            await supabase
                .from("engagement_enrollments")
                .update({ status: "exited", exited_at: nowIso, exit_reason: "unsubscribed", updated_at: nowIso })
                .eq("id", enrollment.id);
            processed.push({ enrollmentId: enrollment.id, status: "unsubscribed" });
            continue;
        }

        const userNow = new Date().toLocaleString("en-US", { timeZone: prefs?.timezone ?? "Asia/Kolkata", hour: "2-digit", hour12: false });
        const hour = Number(userNow.split(", ").pop()?.split(":")[0] ?? 12);
        const inQuietHours = parseQuietHours(hour, prefs?.quiet_hours_start ?? 22, prefs?.quiet_hours_end ?? 8);
        if (inQuietHours) {
            const later = new Date(Date.now() + 60 * 60 * 1000).toISOString();
            await supabase.from("engagement_enrollments").update({ next_run_at: later, updated_at: nowIso }).eq("id", enrollment.id);
            processed.push({ enrollmentId: enrollment.id, status: "quiet_hours_deferred" });
            continue;
        }

        const dailyCapReached = await exceededDailyCap(enrollment.user_id, prefs?.max_touches_per_day ?? 1);
        if (dailyCapReached) {
            await supabase
                .from("engagement_enrollments")
                .update({ next_run_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), updated_at: nowIso })
                .eq("id", enrollment.id);
            processed.push({ enrollmentId: enrollment.id, status: "daily_cap_deferred" });
            continue;
        }

        const finalChannel = await resolveChannel(enrollment.user_id, step.channel as Channel, (step.fallback_channel as Channel | null) ?? null);
        if (!finalChannel) {
            await supabase
                .from("engagement_enrollments")
                .update({ status: "exited", exited_at: nowIso, exit_reason: "no_eligible_channel", updated_at: nowIso })
                .eq("id", enrollment.id);
            processed.push({ enrollmentId: enrollment.id, status: "no_channel" });
            continue;
        }

        const recipient = await getUserContact(enrollment.user_id, finalChannel);
        if (!recipient) {
            await supabase
                .from("engagement_enrollments")
                .update({ status: "exited", exited_at: nowIso, exit_reason: "missing_contact", updated_at: nowIso })
                .eq("id", enrollment.id);
            processed.push({ enrollmentId: enrollment.id, status: "missing_contact" });
            continue;
        }

        const template = resolveTemplate(step.template_key, enrollment.variant);
        const renderedBody = renderTemplate(template.body, {
            name: (enrollment.metadata as Record<string, string>)?.name ?? "there",
            pending_action: (enrollment.metadata as Record<string, string>)?.pending_action ?? "your first key action",
        });
        const renderedSubject = template.subject
            ? renderTemplate(template.subject, { name: (enrollment.metadata as Record<string, string>)?.name ?? "there" })
            : undefined;

        // Count prior attempts for this enrollment+step to build a unique idempotency key
        const { count: priorAttempts } = await supabase
            .from("engagement_messages")
            .select("id", { head: true, count: "exact" })
            .eq("enrollment_id", enrollment.id)
            .eq("step_id", step.id);

        const attemptNo = (priorAttempts ?? 0) + 1;
        const idempotencyKey = `${enrollment.id}:${step.id}:${attemptNo}`;
        let provider = "unknown";
        let providerMessageId: string | undefined;
        let status: "queued" | "failed" = "queued";
        let errorMessage: string | undefined;

        try {
            const providerResult = await sendViaProvider({
                channel: finalChannel,
                to: recipient,
                body: renderedBody,
                subject: renderedSubject,
                idempotencyKey,
            });
            provider = providerResult.provider;
            providerMessageId = providerResult.providerMessageId;
        } catch (sendErr) {
            status = "failed";
            errorMessage = sendErr instanceof Error ? sendErr.message : "unknown_send_error";
        }

        const { data: message } = await supabase
            .from("engagement_messages")
            .insert({
                enrollment_id: enrollment.id,
                step_id: step.id,
                user_id: enrollment.user_id,
                channel: finalChannel,
                provider,
                status,
                template_key: step.template_key,
                idempotency_key: idempotencyKey,
                provider_message_id: providerMessageId,
                attempt_no: attemptNo,
                payload: {
                    to: recipient,
                    subject: renderedSubject,
                    body: renderedBody,
                },
                sent_at: status === "queued" ? nowIso : null,
                error_message: errorMessage,
            })
            .select("id")
            .single();

        if (status === "failed" && isTransientError(errorMessage)) {
            const retryAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
            await supabase.from("engagement_enrollments").update({ next_run_at: retryAt, updated_at: nowIso }).eq("id", enrollment.id);
            processed.push({ enrollmentId: enrollment.id, status: "retry_scheduled" });
            continue;
        }

        if (status === "failed") {
            await supabase
                .from("engagement_enrollments")
                .update({ current_step_order: enrollment.current_step_order + 1, next_run_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), updated_at: nowIso })
                .eq("id", enrollment.id);
            processed.push({ enrollmentId: enrollment.id, status: "failed_advanced" });
            continue;
        }

        await supabase
            .from("provider_delivery_events")
            .insert({
                message_id: message?.id ?? null,
                provider,
                provider_message_id: providerMessageId,
                event_type: "queued",
                raw_payload: {},
            });

        await supabase
            .from("engagement_enrollments")
            .update({
                current_step_order: enrollment.current_step_order + 1,
                next_run_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                updated_at: nowIso,
            })
            .eq("id", enrollment.id);

        processed.push({ enrollmentId: enrollment.id, status: "queued" });
    }

    return processed;
};

export const trackConversion = async (userId: string, conversionEvent: string, revenue?: number) => {
    const supabase = db();

    const { data: enrollment } = await supabase
        .from("engagement_enrollments")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (!enrollment) return { updated: false };

    await supabase.from("engagement_conversions").insert({
        enrollment_id: enrollment.id,
        user_id: userId,
        conversion_event: conversionEvent,
        revenue: revenue ?? null,
    });

    await supabase
        .from("engagement_enrollments")
        .update({
            status: "completed",
            completed_at: new Date().toISOString(),
            exit_reason: "converted",
            updated_at: new Date().toISOString(),
        })
        .eq("id", enrollment.id);

    return { updated: true };
};
