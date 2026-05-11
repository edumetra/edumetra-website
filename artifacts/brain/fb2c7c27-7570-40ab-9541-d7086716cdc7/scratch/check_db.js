
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fymmcqtyxkeecxdtabcn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5bW1jcXR5eGtlZWN4ZHRhYmNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MzM4MzAsImV4cCI6MjA4NzUwOTgzMH0.LbviKoZbepaPGmZm1CQzy4mM_no15ligUZTbRTd-DDU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Checking event_registrations...');
    const { data, error } = await supabase
        .from('event_registrations')
        .select('*')
        .limit(1);
    
    if (error) {
        console.error('Error fetching event_registrations:', error);
    } else {
        console.log('Sample row from event_registrations:', data[0]);
    }

    console.log('Checking events...');
    const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .limit(1);
    
    if (eventsError) {
        console.error('Error fetching events:', eventsError);
    } else {
        console.log('Sample row from events:', events[0]);
    }
}

checkSchema();
