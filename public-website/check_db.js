import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '/Users/sudharshan24k/Desktop/FreeLancing/dipak/public-website/.env' });

const anonUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(anonUrl, anonKey);

async function testInserts() {
    console.log('=== Testing database inserts with ANON key ===');
    console.log('Using URL:', anonUrl);

    // 1. Test counselling_requests
    console.log('\n--- 1. Testing insert into counselling_requests ---');
    const { data: cData, error: cErr } = await supabase
        .from('counselling_requests')
        .insert([{
            name: 'Test Counselling Anon',
            phone: '9876543210',
            email: 'test_counsel_anon@gmail.com',
            neet_marks: 350,
            city: 'Test City'
        }])
        .select();
    if (cErr) console.error('❌ counselling_requests INSERT FAILED:', cErr.message, cErr.code);
    else console.log('✅ counselling_requests INSERT SUCCESS:', cData);

    // 2. Test webinar_interests
    console.log('\n--- 2. Testing insert into webinar_interests ---');
    const { data: wData, error: wErr } = await supabase
        .from('webinar_interests')
        .insert([{
            name: 'Test Webinar Anon',
            email: 'test_webinar_anon@gmail.com',
            phone: '9876543210',
            category: 'NEET Preparation',
            source: 'webinar-page'
        }])
        .select();
    if (wErr) console.error('❌ webinar_interests INSERT FAILED:', wErr.message, wErr.code);
    else console.log('✅ webinar_interests INSERT SUCCESS:', wData);

    // 3. Test newsletter_subscriptions
    console.log('\n--- 3. Testing insert into newsletter_subscriptions ---');
    const { data: nData, error: nErr } = await supabase
        .from('newsletter_subscriptions')
        .insert([{
            email: 'test_newsletter_anon@gmail.com',
            phone: '9876543210'
        }])
        .select();
    if (nErr) console.error('❌ newsletter_subscriptions INSERT FAILED:', nErr.message, nErr.code);
    else console.log('✅ newsletter_subscriptions INSERT SUCCESS:', nData);

    // 4. Test event_registrations (guest)
    console.log('\n--- 4. Testing insert into event_registrations (guest) ---');
    const { data: rData, error: rErr } = await supabase
        .from('event_registrations')
        .insert([{
            event_id: '02e6af4d-aae3-49b5-8cc8-37198991cbc4',
            user_id: null,
            registration_type: 'guest',
            status: 'registered',
            guest_name: 'Test Guest Anon',
            guest_email: 'test_guest_anon@gmail.com',
            guest_phone: '9876543210'
        }])
        .select();
    if (rErr) console.error('❌ event_registrations (guest) INSERT FAILED:', rErr.message, rErr.code);
    else console.log('✅ event_registrations (guest) INSERT SUCCESS:', rData);
}

testInserts();
