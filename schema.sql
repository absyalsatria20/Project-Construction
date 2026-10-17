-- CPMS Supabase Database Schema
-- Safe for initial setup. Does not delete existing data.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 0. Accounts
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL DEFAULT 'admin',
    password TEXT NOT NULL DEFAULT 'admin123',
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO accounts (id, username, password)
VALUES ('primary', 'admin', 'admin123')
ON CONFLICT (id) DO NOTHING;

-- 1. Vendors
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT DEFAULT '',
    pic TEXT DEFAULT '-',
    phone TEXT DEFAULT '-',
    bank TEXT DEFAULT '-',
    account_number TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Cashflow Categories
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT DEFAULT '',
    color TEXT DEFAULT '',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Cashflow Subcategories
CREATE TABLE IF NOT EXISTS subcategories (
    id TEXT PRIMARY KEY,
    category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Petty Cash Categories
CREATE TABLE IF NOT EXISTS petty_cash_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT DEFAULT '',
    color TEXT DEFAULT '',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Materials
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_name TEXT NOT NULL,
    unit TEXT NOT NULL,
    quantity_requested NUMERIC NOT NULL,
    request_date TEXT,
    quantity_received NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL,
    receipts JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE RESTRICT,
    invoice_number TEXT NOT NULL,
    invoice_date TEXT NOT NULL,
    description TEXT DEFAULT '',
    total_invoice NUMERIC NOT NULL,
    termin INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    payment_date TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    payment_note TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Cashflows
CREATE TABLE IF NOT EXISTS cashflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_date TEXT NOT NULL,
    transaction_type TEXT NOT NULL,
    category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    subcategory_id TEXT REFERENCES subcategories(id) ON DELETE SET NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    note TEXT DEFAULT '',
    row_index INTEGER,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Cashflow Green House Categories
CREATE TABLE IF NOT EXISTS cashflow_green_house_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT DEFAULT '',
    color TEXT DEFAULT '',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Cashflow Green House Transactions
CREATE TABLE IF NOT EXISTS cashflow_green_house (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_date DATE NOT NULL,
    category_id TEXT REFERENCES cashflow_green_house_categories(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    debit NUMERIC NOT NULL DEFAULT 0 CHECK (debit >= 0),
    credit NUMERIC NOT NULL DEFAULT 0 CHECK (credit >= 0),
    row_index INTEGER,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT cashflow_green_house_one_side_only CHECK ((debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0))
);

-- 11. Petty Cash Transactions
CREATE TABLE IF NOT EXISTS petty_cashes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_date DATE NOT NULL,
    transaction_type TEXT NOT NULL,
    category_id TEXT REFERENCES petty_cash_categories(id) ON DELETE SET NULL,
    subcategory_id TEXT,
    vendor_id UUID,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    note TEXT DEFAULT '',
    row_index INTEGER,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Default Cashflow Categories
INSERT INTO categories (id, name, icon, color, active) VALUES
('c1', 'Biaya Material', 'Hammer', '#3b82f6', true),
('c2', 'Biaya SDM', 'Users', '#10b981', true),
('c3', 'Biaya Operasional', 'Cpu', '#f59e0b', true),
('c4', 'Adm Bank', 'CreditCard', '#6b7280', true)
ON CONFLICT (id) DO NOTHING;

-- Default Cashflow Subcategories
INSERT INTO subcategories (id, category_id, name, active) VALUES
('sc1', 'c1', 'Semen', true),
('sc2', 'c1', 'Besi', true),
('sc3', 'c1', 'Pasir', true),
('sc4', 'c1', 'Batu Split', true),
('sc5', 'c1', 'Lainnya', true),
('sc6', 'c2', 'Upah Tukang', true),
('sc7', 'c2', 'Gaji Staff', true),
('sc8', 'c3', 'BBM', true),
('sc9', 'c3', 'Sewa Alat', true)
ON CONFLICT (id) DO NOTHING;

-- Default Petty Cash Categories
INSERT INTO petty_cash_categories (id, name, icon, color, active) VALUES
('pc1', 'Operasional', 'Settings', '#10b981', true),
('pc2', 'Konsumsi', 'Coffee', '#f59e0b', true),
('pc3', 'Transportasi', 'Truck', '#3b82f6', true),
('pc4', 'Lain-lain', 'Box', '#6b7280', true)
ON CONFLICT (id) DO NOTHING;

-- Automatically maintain updated_at for offline conflict detection
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
CREATE TRIGGER update_accounts_updated_at
BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_vendors_updated_at ON vendors;
CREATE TRIGGER update_vendors_updated_at
BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_subcategories_updated_at ON subcategories;
CREATE TRIGGER update_subcategories_updated_at
BEFORE UPDATE ON subcategories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_petty_cash_categories_updated_at ON petty_cash_categories;
CREATE TRIGGER update_petty_cash_categories_updated_at
BEFORE UPDATE ON petty_cash_categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_cashflow_green_house_categories_updated_at ON cashflow_green_house_categories;
CREATE TRIGGER update_cashflow_green_house_categories_updated_at
BEFORE UPDATE ON cashflow_green_house_categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_cashflow_green_house_updated_at ON cashflow_green_house;
CREATE TRIGGER update_cashflow_green_house_updated_at
BEFORE UPDATE ON cashflow_green_house FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_materials_updated_at ON materials;
CREATE TRIGGER update_materials_updated_at
BEFORE UPDATE ON materials FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON payments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_cashflows_updated_at ON cashflows;
CREATE TRIGGER update_cashflows_updated_at
BEFORE UPDATE ON cashflows FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_petty_cashes_updated_at ON petty_cashes;
CREATE TRIGGER update_petty_cashes_updated_at
BEFORE UPDATE ON petty_cashes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Indexes used by application relations and list queries
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_petty_cashes_category_id ON petty_cashes(category_id);
CREATE INDEX IF NOT EXISTS idx_petty_cashes_subcategory_id ON petty_cashes(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_petty_cashes_vendor_id ON petty_cashes(vendor_id);
CREATE INDEX IF NOT EXISTS idx_petty_cashes_row_index ON petty_cashes(row_index);
CREATE INDEX IF NOT EXISTS idx_invoices_vendor_id ON invoices(vendor_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_cashflows_category_id ON cashflows(category_id);
CREATE INDEX IF NOT EXISTS idx_cashflows_subcategory_id ON cashflows(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_cashflows_vendor_id ON cashflows(vendor_id);
CREATE INDEX IF NOT EXISTS idx_cashflows_row_index ON cashflows(row_index);
CREATE INDEX IF NOT EXISTS idx_cashflow_green_house_category_id ON cashflow_green_house(category_id);
CREATE INDEX IF NOT EXISTS idx_cashflow_green_house_row_index ON cashflow_green_house(row_index);

-- Enable Realtime for tables used by the application.
-- Run these statements once in Supabase if tables are not already in supabase_realtime.
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.accounts;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.vendors;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.subcategories;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.petty_cash_categories;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.materials;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.cashflows;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.cashflow_green_house_categories;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.cashflow_green_house;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.petty_cashes;

NOTIFY pgrst, 'reload schema';
