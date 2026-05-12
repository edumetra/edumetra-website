-- ============================================================
-- STEP 13: OTP Verifications
-- Table for storing temporary OTPs for phone verification
-- ============================================================

create table if not exists public.otp_verifications (
    id uuid primary key default gen_random_uuid(),
    phone text not null,
    otp text not null,
    verified boolean default false,
    expires_at timestamptz not null,
    created_at timestamptz default now()
);

-- Enable RLS
alter table public.otp_verifications enable row level security;

-- Policy: Anyone can insert (to request an OTP)
drop policy if exists "Anyone can request OTP" on public.otp_verifications;
drop policy if exists "Anyone can read their own OTP" on public.otp_verifications;
drop policy if exists "Anyone can verify OTP" on public.otp_verifications;

create policy "Anyone can request OTP"
on public.otp_verifications for insert
with check (true);

-- No public select or update allowed.
-- Verification will be handled by a security definer function below.

-- Function to safely verify OTP without exposing data to public select
create or replace function public.verify_otp(p_phone text, p_otp text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
    v_id uuid;
begin
    select id into v_id
    from public.otp_verifications
    where phone = p_phone
      and otp = p_otp
      and verified = false
      and expires_at > now()
    order by created_at desc
    limit 1;

    if v_id is not null then
        update public.otp_verifications
        set verified = true
        where id = v_id;
        return true;
    end if;

    return false;
end;
$$;

-- Add index for faster lookups
create index if not exists idx_otp_phone on public.otp_verifications(phone);
