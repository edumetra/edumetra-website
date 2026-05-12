create or replace function public.sync_user_phone_on_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_phone text;
begin
  v_phone := new.raw_user_meta_data->>'phone';
  
  if v_phone is not null then
    if length(v_phone) = 10 then
      v_phone := '+91' || v_phone;
    elsif v_phone NOT LIKE '+%' then
      v_phone := '+' || v_phone;
    end if;
  end if;

  update auth.users
  set 
    phone = coalesce(v_phone, phone),
    phone_confirmed_at = now(),
    email_confirmed_at = now() -- Auto confirm email to allow instant login!
  where id = new.id;

  return new;
end;
$$;
