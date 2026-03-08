-- ============================================================
-- Migration 16: Audit Logs Schema
-- Run this in the Supabase SQL Dashboard → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    admin_email TEXT NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('CREATE', 'UPDATE', 'DELETE', 'BULK_UPDATE', 'OTHER')),
    entity_type TEXT NOT NULL,
    entity_id TEXT, -- Use TEXT to support UUIDs and potentially string identifiers like Slugs/Keys
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only Admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON audit_logs
FOR SELECT
USING (auth.uid() IN (SELECT id FROM admins));

-- Policy: Service Role can insert audit logs (our server actions will run via Admin API)
CREATE POLICY "Service Role can manage audit logs"
ON audit_logs
FOR ALL
USING (true)
WITH CHECK (true);

-- Indexing for fast chronological fetching
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action_type);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type);
