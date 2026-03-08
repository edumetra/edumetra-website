require("dotenv").config({ path: "/Users/sudharshan24k/Desktop/FreeLancing/dipak/admin-portal/.env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase.from('college_details').select('premium_locked_features').limit(1);
    console.log(JSON.stringify(data, null, 2));
    console.log("Error:", error);
}

check();
