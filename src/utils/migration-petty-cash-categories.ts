export const MIGRATION_SQL = `
-- 1. Create petty_cash_categories table
CREATE TABLE IF NOT EXISTS public.petty_cash_categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  icon text,
  color text,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT petty_cash_categories_pkey PRIMARY KEY (id)
);

-- Enable RLS and setup policies
ALTER TABLE public.petty_cash_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.petty_cash_categories FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.petty_cash_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.petty_cash_categories FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.petty_cash_categories FOR DELETE USING (true);

-- Insert initial dummy data
INSERT INTO public.petty_cash_categories (name, icon, color, active) VALUES
('Operasional', 'Settings', '#10b981', true),
('Konsumsi', 'Coffee', '#f59e0b', true),
('Transportasi', 'Truck', '#3b82f6', true),
('Lain-lain', 'Box', '#6b7280', true)
ON CONFLICT DO NOTHING;

-- 2. Add category_id to petty_cashes table
ALTER TABLE public.petty_cashes ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.petty_cash_categories(id) ON DELETE SET NULL;
`;
