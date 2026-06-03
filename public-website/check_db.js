import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '/Users/sudharshan24k/Desktop/FreeLancing/dipak/admin-portal/.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    try {
        console.log('Fetching events...');
        const { data: events, error: errEvents } = await supabase
            .from('events')
            .select('id, slug, title');
        
        if (errEvents) {
            console.error('Error fetching events:', errEvents);
        } else {
            console.log('Events in DB:', events);
        }

        console.log('Fetching registrations...');
        const { data: regs, error: errRegs } = await supabase
            .from('event_registrations')
            .select('id, event_id, user_id, registration_type, guest_email, guest_name')
            .limit(20);
            
        if (errRegs) {
            console.error('Error fetching registrations:', errRegs);
        } else {
            console.log('Registrations in DB:', regs);
        }

        console.log('Fetching webinar_interests...');
        const { data: interests, error: errInterests } = await supabase
            .from('webinar_interests')
            .select('*')
            .limit(20);
            
        if (errInterests) {
            console.error('Error fetching webinar_interests:', errInterests);
        } else {
            console.log('Webinar Interests in DB:', interests);
        }

    } catch (e) {
        console.error('Unhandled error:', e);
    }
}

check();
