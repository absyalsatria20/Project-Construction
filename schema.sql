-- SQL Schema for CPMS Database Setup

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Vendors Table
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT DEFAULT '',
    pic TEXT DEFAULT '-',
    phone TEXT DEFAULT '-',
    bank TEXT DEFAULT '-',
    account_number TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT DEFAULT '',
    color TEXT DEFAULT '',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Subcategories Table
CREATE TABLE IF NOT EXISTS subcategories (
    id TEXT PRIMARY KEY,
    category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Materials Table
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_name TEXT NOT NULL,
    unit TEXT NOT NULL,
    quantity_requested NUMERIC NOT NULL,
    quantity_received NUMERIC NOT NULL,
    receive_date TEXT,
    status TEXT NOT NULL,
    verification BOOLEAN DEFAULT false,
    note TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE RESTRICT,
    invoice_number TEXT NOT NULL,
    invoice_date TEXT NOT NULL,
    description TEXT DEFAULT '',
    total_invoice NUMERIC NOT NULL,
    termin INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    payment_date TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    payment_note TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Cashflows Table
CREATE TABLE IF NOT EXISTS cashflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_date TEXT NOT NULL,
    transaction_type TEXT NOT NULL, -- 'Dana Masuk' or 'Pengeluaran'
    category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    subcategory_id TEXT REFERENCES subcategories(id) ON DELETE SET NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    note TEXT DEFAULT '',
    row_index INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert Initial Mock Categories (matches LocalStorage defaults)
INSERT INTO categories (id, name, icon, color, active) VALUES
('c1', 'Biaya Material', 'Hammer', '#3b82f6', true),
('c2', 'Biaya SDM', 'Users', '#10b981', true),
('c3', 'Biaya Operasional', 'Cpu', '#f59e0b', true),
('c4', 'Adm Bank', 'CreditCard', '#6b7280', true)
ON CONFLICT (id) DO NOTHING;

-- Insert Initial Mock Subcategories (matches LocalStorage defaults)
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
