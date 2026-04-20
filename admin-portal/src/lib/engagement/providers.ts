import { randomUUID } from "crypto";

// ============================================================
// Provider abstraction for multi-channel engagement sending
//
// HOW TO WIRE UP YOUR PROVIDERS:
//
//   Email  → Set ENGAGEMENT_EMAIL_PROVIDER to 'resend' or 'sendgrid'
//             then fill ENGAGEMENT_EMAIL_API_KEY
//             Resend docs:    https://resend.com/docs/api-reference/emails/send-email
//             SendGrid docs:  https://docs.sendgrid.com/api-reference/mail-send/mail-send
//
//   WhatsApp → Set WHATSAPP_API_URL and WHATSAPP_API_TOKEN
//              Twilio:   https://www.twilio.com/docs/whatsapp/api
//              WATI:     https://docs.wati.io/reference/post_api-v1-sendtemplatemessage
//              Interakt: https://developers.interakt.ai/reference/send-messages
//
//   SMS/OTP → Set OTP_SMS_API_URL and OTP_SMS_API_KEY
//             MSG91:     https://docs.msg91.com/reference/send-sms
//             Fast2SMS:  https://www.fast2sms.com/docs
//
//   RCS     → Set RCS_API_URL and RCS_API_KEY
//             Google RCS: https://developers.google.com/business-communications/rcs-business-messaging
//
// Once providers are confirmed, update the payload shapes below to match
// the exact API contract of each provider.
// ============================================================

export type ProviderSendInput = {
    channel: "email" | "sms" | "rcs" | "whatsapp";
    to: string;           // email address for email, phone number (E.164) for others
    body: string;         // message body / HTML
    subject?: string;     // email subject line only
    idempotencyKey: string;
};

type ProviderSendResult = {
    provider: string;
    providerMessageId: string;
    status: "queued" | "sent";
};

// ── Utility: safe JSON parse from HTTP response ────────────────
const parseJsonSafe = async (response: Response) => {
    const text = await response.text();
    try { return JSON.parse(text); }
    catch { return { raw: text }; }
};

// ── Utility: POST to any provider ────────────────────────────
const postToProvider = async (
    url: string,
    headers: Record<string, string>,
    payload: Record<string, unknown>
) => {
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(payload),
    });

    const data = await parseJsonSafe(response);
    if (!response.ok) {
        throw new Error(`Provider error (${response.status}): ${JSON.stringify(data)}`);
    }
    return data;
};

// ── EMAIL ──────────────────────────────────────────────────────
// Supports Resend (default) and SendGrid.
// Switch via ENGAGEMENT_EMAIL_PROVIDER env var: 'resend' | 'sendgrid'
// From address: set ENGAGEMENT_EMAIL_FROM (e.g. "Edumetra <noreply@edumetra.com>")
const sendEmail = async (input: ProviderSendInput): Promise<ProviderSendResult> => {
    const provider = process.env.ENGAGEMENT_EMAIL_PROVIDER ?? "resend";
    const apiKey   = process.env.ENGAGEMENT_EMAIL_API_KEY;
    const from     = process.env.ENGAGEMENT_EMAIL_FROM ?? "noreply@example.com";

    if (!apiKey) throw new Error("Missing ENGAGEMENT_EMAIL_API_KEY");

    let url: string;
    let payload: Record<string, unknown>;

    if (provider === "resend") {
        // Resend API: https://resend.com/docs/api-reference/emails/send-email
        url = "https://api.resend.com/emails";
        payload = {
            from,
            to: [input.to],
            subject: input.subject ?? "Important update from Edumetra",
            html: input.body,          // body should be HTML for email
            idempotency_key: input.idempotencyKey,
        };
    } else if (provider === "sendgrid") {
        // SendGrid API: https://api.sendgrid.com/v3/mail/send
        url = "https://api.sendgrid.com/v3/mail/send";
        payload = {
            personalizations: [{ to: [{ email: input.to }] }],
            from: { email: from },
            subject: input.subject ?? "Important update from Edumetra",
            content: [{ type: "text/html", value: input.body }],
        };
    } else {
        throw new Error(`Unknown email provider: ${provider}`);
    }

    const data = await postToProvider(url, { Authorization: `Bearer ${apiKey}` }, payload);

    return {
        provider: `email_${provider}`,
        providerMessageId: data.id ?? data.message_id ?? randomUUID(),
        status: "queued",
    };
};

// ── WHATSAPP ───────────────────────────────────────────────────
// Generic WhatsApp send. Supports Twilio, WATI, Interakt.
// Phone number must be in E.164 format: +91XXXXXXXXXX
// NOTE: WhatsApp Business requires pre-approved message templates for
// outbound (non-reply) messages. The body here should be a template name
// or approved message. Update payload shape once provider is confirmed.
const sendWhatsapp = async (input: ProviderSendInput): Promise<ProviderSendResult> => {
    const url   = process.env.WHATSAPP_API_URL;
    const token = process.env.WHATSAPP_API_TOKEN;

    if (!url || !token) throw new Error("Missing WHATSAPP_API_URL or WHATSAPP_API_TOKEN");

    // Generic shape — update to match your provider's exact contract:
    //   Twilio:   { From: "whatsapp:+country_from", To: "whatsapp:+to", Body: "..." }
    //   WATI:     { template_name: "...", broadcast_name: "...", parameters: [{...}] }
    //   Interakt: { fullPhoneNumber: "...", callbackData: "...", type: "Template", template: {...} }
    const payload: Record<string, unknown> = {
        to: input.to,            // ← update key name to match provider
        message: input.body,     // ← update key name to match provider
        idempotency_key: input.idempotencyKey,
    };

    const data = await postToProvider(url, { Authorization: `Bearer ${token}` }, payload);

    return {
        provider: "whatsapp",
        providerMessageId: data.message_id ?? data.id ?? randomUUID(),
        status: "queued",
    };
};

// ── SMS (OTP SMS provider) ─────────────────────────────────────
// Phone number must be in E.164 format: +91XXXXXXXXXX
// MSG91 example payload: { mobiles: "91XXXXXXXXXX", message: "...", sender: "EDMETR", route: "4" }
// Fast2SMS example: { route: "q", message: "...", numbers: "XXXXXXXXXX" }
// Update payload shape once provider is confirmed.
const sendOtpSms = async (input: ProviderSendInput): Promise<ProviderSendResult> => {
    const url = process.env.OTP_SMS_API_URL;
    const key = process.env.OTP_SMS_API_KEY;

    if (!url || !key) throw new Error("Missing OTP_SMS_API_URL or OTP_SMS_API_KEY");

    // Generic shape — update key names to match your provider's contract:
    const payload: Record<string, unknown> = {
        phone: input.to,         // ← update key name (msg91: "mobiles", fast2sms: "numbers")
        message: input.body,     // ← update key name
        idempotency_key: input.idempotencyKey,
    };

    const data = await postToProvider(url, { Authorization: `Bearer ${key}` }, payload);

    return {
        provider: "otp_sms",
        providerMessageId: data.message_id ?? data.id ?? randomUUID(),
        status: "queued",
    };
};

// ── RCS ────────────────────────────────────────────────────────
// Rich Communication Services — like SMS but with cards/buttons.
// Falls back to SMS automatically on this channel if RCS is unsupported by device.
// Google RCS Business Messaging: https://developers.google.com/business-communications/rcs-business-messaging
// Phone number must be in E.164 format.
const sendRcs = async (input: ProviderSendInput): Promise<ProviderSendResult> => {
    const url = process.env.RCS_API_URL;
    const key = process.env.RCS_API_KEY;

    if (!url || !key) throw new Error("Missing RCS_API_URL or RCS_API_KEY");

    // Generic shape — update to match your RCS provider's exact payload:
    const payload: Record<string, unknown> = {
        phone: input.to,          // ← update key name
        content: input.body,      // ← update key name; for rich cards wrap in message object
        idempotency_key: input.idempotencyKey,
    };

    const data = await postToProvider(url, { Authorization: `Bearer ${key}` }, payload);

    return {
        provider: "rcs",
        providerMessageId: data.message_id ?? data.id ?? randomUUID(),
        status: "queued",
    };
};

// ── Channel router ─────────────────────────────────────────────
export const sendViaProvider = async (input: ProviderSendInput): Promise<ProviderSendResult> => {
    switch (input.channel) {
        case "email":    return sendEmail(input);
        case "whatsapp": return sendWhatsapp(input);
        case "rcs":      return sendRcs(input);
        case "sms":      return sendOtpSms(input);
        default:         throw new Error(`Unknown channel: ${input.channel}`);
    }
};
