import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

dotenv.config({ path: "/Users/sudharshan24k/Desktop/FreeLancing/dipak/admin-portal/.env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const sql = fs.readFileSync(path.join(process.cwd(), "migrations", "26_gallery_images.sql"), "utf-8");
    
    // Some projects add an exec_sql rpc. 
    let { data, error } = await supabase.rpc('exec_sql', { query: sql });
    console.log("exec_sql Data:", data);
    console.log("exec_sql Error:", error);

    // Also reload the schema cache
    let { data: rpcData, error: rpcErr } = await supabase.rpc('reload_schema_cache');
    console.log("reload_schema_cache:", rpcErr);
}

check();
