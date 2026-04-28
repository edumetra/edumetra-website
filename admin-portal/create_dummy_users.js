const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local or .env
let envFile = '';
try {
  envFile = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
} catch (e) {
  try {
    envFile = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
  } catch (e) {
    console.error('Could not read .env or .env.local');
    process.exit(1);
  }
}

const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    env[key.trim()] = values.join('=').trim();
  }
});

const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL'];
const SUPABASE_SERVICE_ROLE_KEY = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createUsers() {
  console.log('Creating Dummy Free User...');
  const { data: freeUser, error: freeError } = await supabase.auth.admin.createUser({
    email: 'dummy_free@edumetra.com',
    password: 'password123',
    email_confirm: true,
    user_metadata: { full_name: 'Dummy Free User' }
  });

  if (freeError) {
    console.error('Error creating free user:', freeError.message);
  } else {
    console.log('Free User Created:', freeUser.user.id);
    // Update profile
    const { error: profileError } = await supabase.from('user_profiles').upsert({
      id: freeUser.user.id,
      email: 'dummy_free@edumetra.com',
      full_name: 'Dummy Free User',
      account_type: 'free',
      subscription_status: 'inactive'
    });
    if (profileError) console.error('Error updating free profile:', profileError.message);
    else console.log('Free profile updated.');
  }

  console.log('\nCreating Dummy Pro User...');
  const { data: proUser, error: proError } = await supabase.auth.admin.createUser({
    email: 'dummy_pro@edumetra.com',
    password: 'password123',
    email_confirm: true,
    user_metadata: { full_name: 'Dummy Pro User' }
  });

  if (proError) {
    console.error('Error creating pro user:', proError.message);
  } else {
    console.log('Pro User Created:', proUser.user.id);
    // Update profile
    const { error: profileError } = await supabase.from('user_profiles').upsert({
      id: proUser.user.id,
      email: 'dummy_pro@edumetra.com',
      full_name: 'Dummy Pro User',
      account_type: 'pro',
      subscription_status: 'active'
    });
    if (profileError) console.error('Error updating pro profile:', profileError.message);
    else console.log('Pro profile updated.');
  }
}

createUsers().then(() => console.log('Done.')).catch(console.error);
