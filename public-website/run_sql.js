const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://fymmcqtyxkeecxdtabcn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5bW1jcXR5eGtlZWN4ZHRhYmNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTkzMzgzMCwiZXhwIjoyMDg3NTA5ODMwfQ.QxHW8VbE5SvWIDWHCW_pq5tTTDCpvjcsUDRYNXS3y0M"
);

async function run() {
  const sql = `
  create or replace function public.check_phone_registration(p_phone text)
  returns text
  language plpgsql
  security definer
  set search_path = public, auth
  as $$
  declare
    v_confirmed_at timestamptz;
    v_phone_clean text;
    v_found boolean;
  begin
    v_phone_clean := regexp_replace(p_phone, '\\D', '', 'g');
    if length(v_phone_clean) = 10 then
      v_phone_clean := '91' || v_phone_clean;
    end if;
    
    select (phone_confirmed_at is not null), true 
    into v_confirmed_at, v_found
    from auth.users 
    where phone = '+' || v_phone_clean 
       OR phone = v_phone_clean
       OR raw_user_meta_data->>'phone' = v_phone_clean
       OR raw_user_meta_data->>'phone' = substr(v_phone_clean, 3)
    limit 1;

    if v_confirmed_at is true then
      return 'verified';
    elsif v_found is true then
      return 'unverified';
    else
      return 'available';
    end if;
  end;
  $$;
  `;

  // We have to use the REST API to run generic SQL or call a known admin RPC.
  // Actually, Supabase doesn't support running raw SQL from JS client directly unless via an existing RPC like exec_sql.
  // Let's check if exec_sql exists, or we just modify the api/otp/send.js to be fault tolerant instead.
}

run();
