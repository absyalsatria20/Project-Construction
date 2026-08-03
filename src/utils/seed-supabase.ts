import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local manually for script
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
  console.error('Error: Masukkan URL dan Anon Key Supabase yang valid di .env.local terlebih dahulu.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initial Mock Data (matches AppContext.tsx)
const initialVendors = [
  { id: 'v1', name: 'PT Semen Perkasa', address: 'Jl. Merdeka No. 10, Jakarta', pic: 'Budi Santoso', phone: '081234567890', bank: 'BCA', accountNumber: '8001234567' },
  { id: 'v2', name: 'UD Jaya Besi', address: 'Jl. Raya Industri No. 45, Bekasi', pic: 'Hendra Wijaya', phone: '081987654321', bank: 'Mandiri', accountNumber: '1230004567890' },
  { id: 'v3', name: 'CV Pasir Abadi', address: 'Jl. Pasir Putih No. 12, Bogor', pic: 'Slamet', phone: '082111222333', bank: 'BRI', accountNumber: '001201999988776' }
];

const initialCategories = [
  { id: 'c1', name: 'Biaya Material', icon: 'Hammer', color: '#3b82f6', active: true },
  { id: 'c2', name: 'Biaya SDM', icon: 'Users', color: '#10b981', active: true },
  { id: 'c3', name: 'Biaya Operasional', icon: 'Cpu', color: '#f59e0b', active: true },
  { id: 'c4', name: 'Adm Bank', icon: 'CreditCard', color: '#6b7280', active: true }
];

const initialSubCategories = [
  { id: 'sc1', categoryId: 'c1', name: 'Semen', active: true },
  { id: 'sc2', categoryId: 'c1', name: 'Besi', active: true },
  { id: 'sc3', categoryId: 'c1', name: 'Pasir', active: true },
  { id: 'sc4', categoryId: 'c1', name: 'Batu Split', active: true },
  { id: 'sc5', categoryId: 'c1', name: 'Lainnya', active: true },
  { id: 'sc6', categoryId: 'c2', name: 'Upah Tukang', active: true },
  { id: 'sc7', categoryId: 'c2', name: 'Gaji Staff', active: true },
  { id: 'sc8', categoryId: 'c3', name: 'BBM', active: true },
  { id: 'sc9', categoryId: 'c3', name: 'Sewa Alat', active: true }
];

const initialMaterials = [
  { id: 'm1', itemName: 'Semen Portland (50kg)', unit: 'Zak', quantityRequested: 100, quantityReceived: 100, receiveDate: '2026-07-15', status: 'Complete', verification: true, note: '' },
  { id: 'm2', itemName: 'Besi Beton 12mm', unit: 'Batang', quantityRequested: 50, quantityReceived: 30, receiveDate: '2026-07-18', status: 'Partial', verification: true, note: '' },
  { id: 'm3', itemName: 'Pasir Beton', unit: 'M3', quantityRequested: 10, quantityReceived: 0, receiveDate: '', status: 'Waiting', verification: false, note: '' },
  { id: 'm4', itemName: 'Batu Split 2/3', unit: 'M3', quantityRequested: 15, quantityReceived: 10, receiveDate: '2026-07-20', status: 'Partial', verification: false, note: 'Batu split agak kotor dan basah' }
];

const initialInvoices = [
  { id: 'inv1', vendorId: 'v1', invoiceNumber: 'INV/2026/001', invoiceDate: '2026-07-10', description: 'Pembelian Semen Portland 100 zak', totalInvoice: 7500000, termin: 1 },
  { id: 'inv2', vendorId: 'v2', invoiceNumber: 'INV/2026/045', invoiceDate: '2026-07-12', description: 'Pembelian Besi Beton 12mm 50 batang', totalInvoice: 9500000, termin: 2 }
];

const initialPayments = [
  { id: 'p1', invoiceId: 'inv1', paymentDate: '2026-07-11', amount: 7500000, paymentNote: 'Lunas Termur' },
  { id: 'p2', invoiceId: 'inv2', paymentDate: '2026-07-13', amount: 4500000, paymentNote: 'DP 50% kurang 5 juta' }
];

const initialCashflows = [
  { id: 'cf1', transactionDate: '2026-07-01', transactionType: 'Dana Masuk', description: 'Modal Awal dari Owner', amount: 100000000, note: 'Transfer bank Mandiri' },
  { id: 'cf2', transactionDate: '2026-07-11', transactionType: 'Pengeluaran', categoryId: 'c1', subcategoryId: 'sc1', vendorId: 'v1', description: 'Pembayaran INV/2026/001 - Semen Portland', amount: 7500000, note: 'Transfer BCA' },
  { id: 'cf3', transactionDate: '2026-07-13', transactionType: 'Pengeluaran', categoryId: 'c1', subcategoryId: 'sc2', vendorId: 'v2', description: 'Pembayaran DP INV/2026/045 - Besi Beton', amount: 4500000, note: 'Transfer Mandiri' },
  { id: 'cf4', transactionDate: '2026-07-14', transactionType: 'Pengeluaran', categoryId: 'c4', description: 'Biaya Admin Bank Transfer', amount: 6500, note: 'Biaya admin' }
];

async function seed() {
  console.log('Memulai migrasi data awal ke Supabase...');

  // 1. Categories
  console.log('Mengimpor categories...');
  for (const item of initialCategories) {
    const { error } = await supabase.from('categories').upsert({
      id: item.id,
      name: item.name,
      icon: item.icon,
      color: item.color,
      active: item.active
    });
    if (error) console.error(`Error category ${item.id}:`, error.message);
  }

  // 2. Subcategories
  console.log('Mengimpor subcategories...');
  for (const item of initialSubCategories) {
    const { error } = await supabase.from('subcategories').upsert({
      id: item.id,
      category_id: item.categoryId,
      name: item.name,
      active: item.active
    });
    if (error) console.error(`Error subcategory ${item.id}:`, error.message);
  }

  // 3. Vendors
  console.log('Mengimpor vendors...');
  for (const item of initialVendors) {
    const { error } = await supabase.from('vendors').upsert({
      id: item.id,
      name: item.name,
      address: item.address,
      pic: item.pic,
      phone: item.phone,
      bank: item.bank,
      account_number: item.accountNumber
    });
    if (error) console.error(`Error vendor ${item.id}:`, error.message);
  }

  // 4. Materials
  console.log('Mengimpor materials...');
  for (const item of initialMaterials) {
    const { error } = await supabase.from('materials').upsert({
      id: item.id,
      item_name: item.itemName,
      unit: item.unit,
      quantity_requested: item.quantityRequested,
      quantity_received: item.quantityReceived,
      receive_date: item.receiveDate || null,
      status: item.status,
      verification: item.verification,
      note: item.note
    });
    if (error) console.error(`Error material ${item.id}:`, error.message);
  }

  // 5. Invoices
  console.log('Mengimpor invoices...');
  for (const item of initialInvoices) {
    const { error } = await supabase.from('invoices').upsert({
      id: item.id,
      vendor_id: item.vendorId,
      invoice_number: item.invoiceNumber,
      invoice_date: item.invoiceDate,
      description: item.description,
      total_invoice: item.totalInvoice,
      termin: item.termin
    });
    if (error) console.error(`Error invoice ${item.id}:`, error.message);
  }

  // 6. Payments
  console.log('Mengimpor payments...');
  for (const item of initialPayments) {
    const { error } = await supabase.from('payments').upsert({
      id: item.id,
      invoice_id: item.invoiceId,
      payment_date: item.paymentDate,
      amount: item.amount,
      payment_note: item.paymentNote
    });
    if (error) console.error(`Error payment ${item.id}:`, error.message);
  }

  // 7. Cashflows
  console.log('Mengimpor cashflows...');
  for (const item of initialCashflows) {
    const { error } = await supabase.from('cashflows').upsert({
      id: item.id,
      transaction_date: item.transactionDate,
      transaction_type: item.transactionType,
      category_id: item.categoryId || null,
      subcategory_id: item.subcategoryId || null,
      vendor_id: item.vendorId || null,
      description: item.description,
      amount: item.amount,
      note: item.note
    });
    if (error) console.error(`Error cashflow ${item.id}:`, error.message);
  }

  console.log('Selesai memindahkan data ke Supabase!');
}

seed().catch(err => {
  console.error('Proses gagal:', err);
});
