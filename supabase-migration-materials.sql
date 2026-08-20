-- 1. Tambahkan kolom baru
ALTER TABLE materials ADD COLUMN IF NOT EXISTS request_date TEXT;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS receipts JSONB DEFAULT '[]'::jsonb;

-- 2. Pindahkan data lama ke dalam bentuk riwayat (receipts JSON)
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

-- 3. Set request_date dari receive_date yang sudah ada (untuk data lama)
UPDATE materials SET request_date = receive_date WHERE request_date IS NULL;

-- 4. Hapus kolom-kolom lama yang sudah tidak digunakan
ALTER TABLE materials DROP COLUMN IF EXISTS receive_date;
ALTER TABLE materials DROP COLUMN IF EXISTS verification;
ALTER TABLE materials DROP COLUMN IF EXISTS note;

-- Update schema cache supabase (penting agar PostgREST API membaca kolom baru)
NOTIFY pgrst, 'reload schema';
