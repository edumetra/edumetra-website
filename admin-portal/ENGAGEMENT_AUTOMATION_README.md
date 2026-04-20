# Engagement Automation Setup

## 1) Run database migration
- Execute `engagement_automation_migration.sql` in Supabase SQL editor.

## 2) Configure environment variables
- `ENGAGEMENT_CRON_SECRET`
- `ENGAGEMENT_EMAIL_API_URL`
- `ENGAGEMENT_EMAIL_API_KEY`
- `ENGAGEMENT_EMAIL_WEBHOOK_SECRET`
- `OTP_SMS_API_URL`
- `OTP_SMS_API_KEY`
- `OTP_SMS_WEBHOOK_SECRET`
- `RCS_API_URL`
- `RCS_API_KEY`
- `RCS_WEBHOOK_SECRET`
- `WHATSAPP_API_URL`
- `WHATSAPP_API_TOKEN`
- `WHATSAPP_WEBHOOK_SECRET`

## 3) Trigger enrollment
- Product events endpoint: `POST /api/engagement/events`
- Direct enrollment endpoint: `POST /api/engagement/enroll`

## 4) Scheduler
- Run `POST /api/engagement/dispatch` every 5-15 minutes.
- Include header: `x-cron-secret: <ENGAGEMENT_CRON_SECRET>`.

## 5) Provider webhooks
- OTP SMS: `POST /api/webhooks/engagement/otp_sms`
- RCS: `POST /api/webhooks/engagement/rcs`
- WhatsApp: `POST /api/webhooks/engagement/whatsapp`
- Email: `POST /api/webhooks/engagement/email`
- Each route expects `x-signature` if webhook secret is configured.

## 6) Conversion tracking
- `POST /api/engagement/track-conversion`
- Marks active enrollment as completed and records conversion.

## 7) Analytics
- API: `GET /api/engagement/analytics`
- Dashboard includes engagement funnel section in analytics page.

## 8) Weekly rollout checklist
- Week 1: migration + event ingestion + first campaign templates.
- Week 2: dispatch cron + live provider integrations + webhook verification.
- Week 3: monitor failures, tune fallback/retry, enforce quiet-hours.
- Week 4: evaluate holdout lift, promote best-performing templates, expand segments.
