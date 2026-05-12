import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.auth.signInWithPassword({
    phone: '7598942659',
    password: 'password'
  });
  console.log('With phone field:', error ? error.status : 'Success', error ? error.message : '');

  const { data: d2, error: e2 } = await supabase.auth.signInWithPassword({
    email: '7598942659',
    password: 'password'
  });
  console.log('With email field:', e2 ? e2.status : 'Success', e2 ? e2.message : '');
}
test();
