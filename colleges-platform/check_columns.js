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
    const { data, error } = await supabase.from('college_details').select('*').limit(1);
    console.log("COLUMNS IN DB:", data && data[0] ? Object.keys(data[0]) : "No rows");
    console.log("Fetch Error:", error);
}

check();
