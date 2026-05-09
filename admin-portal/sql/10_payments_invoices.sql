-- ============================================================
-- STEP 10: Payments & Invoices
-- Run this in Supabase SQL editor
-- ============================================================

-- Payments table — one row per Razorpay payment attempt
CREATE TABLE IF NOT EXISTS public.payments (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    razorpay_order_id    TEXT NOT NULL UNIQUE,
    razorpay_payment_id  TEXT UNIQUE,
    razorpay_signature   TEXT,
    plan_type            TEXT NOT NULL CHECK (plan_type IN ('premium', 'pro')),
    amount_paise         INTEGER NOT NULL,          -- amount in paise (₹ × 100)
    amount_inr           NUMERIC(10,2) GENERATED ALWAYS AS (amount_paise::NUMERIC / 100) STORED,
    currency             TEXT NOT NULL DEFAULT 'INR',
    coupon_code          TEXT,
    discount_paise       INTEGER NOT NULL DEFAULT 0,
    status               TEXT NOT NULL DEFAULT 'created'
                            CHECK (status IN ('created', 'paid', 'failed', 'refunded')),
    failure_reason       TEXT,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invoices table — one row per successful payment
CREATE TABLE IF NOT EXISTS public.invoices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number  TEXT NOT NULL UNIQUE,            -- e.g. EDU-2025-000042
    payment_id      UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email      TEXT NOT NULL,
    user_name       TEXT,
    plan_type       TEXT NOT NULL,
    amount_paise    INTEGER NOT NULL,
    amount_inr      NUMERIC(10,2) GENERATED ALWAYS AS (amount_paise::NUMERIC / 100) STORED,
    discount_paise  INTEGER NOT NULL DEFAULT 0,
    discount_inr    NUMERIC(10,2) GENERATED ALWAYS AS (discount_paise::NUMERIC / 100) STORED,
    tax_paise       INTEGER NOT NULL DEFAULT 0,      -- GST if applicable
    tax_inr         NUMERIC(10,2) GENERATED ALWAYS AS (tax_paise::NUMERIC / 100) STORED,
    total_paise     INTEGER NOT NULL,
    total_inr       NUMERIC(10,2) GENERATED ALWAYS AS (total_paise::NUMERIC / 100) STORED,
    billing_period  TEXT,                            -- e.g. "May 2025"
    razorpay_payment_id TEXT,
    issued_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS payments_user_id_idx    ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS payments_status_idx     ON public.payments(status);
CREATE INDEX IF NOT EXISTS invoices_user_id_idx    ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS invoices_payment_id_idx ON public.invoices(payment_id);

-- ── Auto-update updated_at ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_payments_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS payments_updated_at ON public.payments;
CREATE TRIGGER payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.update_payments_updated_at();

-- ── Atomic Invoice Counter Table ──────────────────────────────────────────────
-- Using a dedicated counter table with FOR UPDATE to prevent race conditions.
-- COUNT(*) approaches are NOT safe under concurrent payments.
CREATE TABLE IF NOT EXISTS public.invoice_counters (
    year       INTEGER PRIMARY KEY,
    last_seq   INTEGER NOT NULL DEFAULT 0
);

-- ── Invoice Number Generator (race-condition safe) ────────────────────────────
-- Atomically increments per-year counter and returns EDU-YYYY-NNNNNN.
-- Uses SELECT ... FOR UPDATE to lock the counter row during the transaction,
-- preventing duplicate invoice numbers under concurrent requests.
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
    v_year    INTEGER := EXTRACT(YEAR FROM NOW())::INTEGER;
    v_seq     INTEGER;
BEGIN
    -- Upsert year row; lock it exclusively for the duration of this call
    INSERT INTO public.invoice_counters (year, last_seq)
    VALUES (v_year, 1)
    ON CONFLICT (year) DO UPDATE
        SET last_seq = invoice_counters.last_seq + 1
    RETURNING last_seq INTO v_seq;

    RETURN 'EDU-' || v_year || '-' || LPAD(v_seq::TEXT, 6, '0');
END;
$$;

-- ── RLS Policies ─────────────────────────────────────────────────────────────
ALTER TABLE public.payments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_counters ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
DROP POLICY IF EXISTS "users_view_own_payments" ON public.payments;
CREATE POLICY "users_view_own_payments"
    ON public.payments FOR SELECT
    USING (auth.uid() = user_id);

-- Users can view their own invoices
DROP POLICY IF EXISTS "users_view_own_invoices" ON public.invoices;
CREATE POLICY "users_view_own_invoices"
    ON public.invoices FOR SELECT
    USING (auth.uid() = user_id);

-- Counter table: no direct user access (service role only)
-- (Service role bypasses RLS by default — no policy needed for invoice_counters)
