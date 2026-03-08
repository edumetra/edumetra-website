import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: "/Users/sudharshan24k/Desktop/FreeLancing/dipak/admin-portal/.env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase.from('college_details').select('premium_locked_features').limit(1);
    console.log("DATA:", JSON.stringify(data, null, 2));
    console.log("Error:", error);

    // Check columns via a query to one row and using the REST endpoint's behavior
    // Supabase REST doesn't easily expose schema without standard PostgREST calls or RPCs,
    // but if we query non-existent columns it throws an error.
    const checkFields = ['visible_in_free', 'visible_in_signed_up', 'visible_in_pro', 'visible_in_premium'];
    const { error: err2 } = await supabase.from('college_details').select(checkFields.join(',')).limit(1);
    console.log("Error when querying new fields:", err2);
}

check();
