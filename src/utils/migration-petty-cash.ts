import * as fs from 'fs';
import * as path from 'path';

// Parse .env.local
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

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
  console.error('Error: Supabase environment variables not found or invalid.');
  process.exit(1);
}

async function migrate() {
  console.log('Running Supabase migration: create petty_cashes table');

  // Supabase Rest API doesn't support executing arbitrary DDL directly via JS client.
  // Instead, we call a generic SQL function if defined, or we instruct the user to run SQL manually.
  
  // Since we cannot run raw SQL from supabase-js without a pre-existing RPC function, 
  // I will output the required SQL to the console so it can be run in the Supabase SQL editor.
  
  const sql = `
-- Create petty_cashes table
CREATE TABLE IF NOT EXISTS public.petty_cashes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_date DATE NOT NULL,
    transaction_type TEXT NOT NULL,
    category_id TEXT,
    subcategory_id TEXT,
    vendor_id UUID,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    note TEXT,
    row_index INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Turn on Realtime for petty_cashes
ALTER PUBLICATION supabase_realtime ADD TABLE public.petty_cashes;
  `;

  console.log('=====================================================================');
  console.log('Please execute the following SQL in your Supabase SQL Editor:');
  console.log('=====================================================================');
  console.log(sql);
  console.log('=====================================================================');
  
}

migrate();