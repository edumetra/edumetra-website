-- ============================================================
-- Lead Scoring: pricing view tracking
-- Run this in the Supabase SQL editor
-- ============================================================

-- 1. Table to store lead scores
create table if not exists public.lead_scores (
    identifier     text primary key,          -- user_id or guest fingerprint
    user_id        uuid references auth.users(id) on delete set null,
    email          text,
    pricing_views  integer not null default 1,
    last_seen      timestamptz not null default now(),
    created_at     timestamptz not null default now()
);

-- Index for quick sorting by view count
create index if not exists idx_lead_scores_views on public.lead_scores (pricing_views desc);

-- 2. RPC to atomically upsert a view (safe for concurrent calls)
create or replace function public.upsert_lead_score(
    p_identifier text,
    p_user_id    uuid    default null,
    p_email      text    default null
)
returns void
language plpgsql
security definer
as $$
begin
    insert into public.lead_scores (identifier, user_id, email, pricing_views, last_seen)
    values (p_identifier, p_user_id, p_email, 1, now())
    on conflict (identifier) do update
        set pricing_views = lead_scores.pricing_views + 1,
            last_seen     = now(),
            user_id       = coalesce(excluded.user_id, lead_scores.user_id),
            email         = coalesce(excluded.email, lead_scores.email);
end;
$$;

-- 3. Row-level security (allow anon inserts via API route, restrict reads to admins)
alter table public.lead_scores enable row level security;

-- Service-role key (used in admin API routes) can do anything
create policy "service role full access"
    on public.lead_scores
    using (true)
    with check (true);
