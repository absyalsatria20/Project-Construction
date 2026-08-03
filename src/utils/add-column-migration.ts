import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  for (const line of envConfig.split('\n')) {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      process.env[key] = val;
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

async function run() {
  console.log("Checking if RPC is available to run SQL...");
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: 'ALTER TABLE cashflows ADD COLUMN IF NOT EXISTS row_index INTEGER;' });
  if (error) {
    console.error("RPC error or not found:", error.message);
  } else {
    console.log("SQL executed successfully via RPC!", data);
  }
}

run();
