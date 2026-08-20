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
  console.log("Migrating materials table...");
  const sql = `
    ALTER TABLE materials ADD COLUMN IF NOT EXISTS request_date TEXT;
    ALTER TABLE materials ADD COLUMN IF NOT EXISTS receipts JSONB DEFAULT '[]'::jsonb;
    
    UPDATE materials 
    SET receipts = json_build_array(
      json_build_object(
        'id', 'migrated_' || id,
        'receiveDate', receive_date,
        'quantityReceived', quantity_received,
        'verification', verification,
        'note', note
      )
    )
    WHERE quantity_received > 0 AND (receipts IS NULL OR jsonb_array_length(receipts) = 0);
    
    UPDATE materials SET request_date = receive_date WHERE request_date IS NULL;
    
    ALTER TABLE materials DROP COLUMN IF EXISTS receive_date;
    ALTER TABLE materials DROP COLUMN IF EXISTS verification;
    ALTER TABLE materials DROP COLUMN IF EXISTS note;
  `;
  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
  if (error) {
    console.error("RPC error or not found:", error.message);
  } else {
    console.log("Migration executed successfully!");
  }
}

run();
