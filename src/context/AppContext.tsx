'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/utils/supabase';

// Interfaces
export interface Vendor {
  id: string;
  name: string;
  address: string;
  pic: string;
  phone: string;
  bank: string;
  accountNumber: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  active: boolean;
}

export interface PettyCashCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  active: boolean;
}

export interface SubCategory {
  id: string;
  categoryId: string;
  name: string;
  active: boolean;
}

export interface MaterialReceipt {
  id: string;
  receiveDate: string;
  quantityReceived: number;
  verification: boolean;
  note: string;
}

export interface Material {
  id: string;
  itemName: string;
  unit: string;
  quantityRequested: number;
  requestDate: string;
  quantityReceived: number;
  status: 'Complete' | 'Partial' | 'Waiting';
  receipts: MaterialReceipt[];
}

export interface Invoice {
  id: string;
  vendorId: string;
  invoiceNumber: string;
  invoiceDate: string;
  description: string;
  totalInvoice: number;
  termin: number;
  createdAt?: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  paymentDate: string;
  amount: number;
  paymentNote: string;
}

export interface Cashflow {
  id: string;
  transactionDate: string;
  transactionType: 'Dana Masuk' | 'Pengeluaran';
  categoryId?: string;
  subcategoryId?: string;
  vendorId?: string;
  description: string;
  amount: number;
  runningBalance?: number;
  note: string;
  createdAt?: number;
  rowIndex?: number;
}

export interface PettyCash {
  id: string;
  transactionDate: string;
  transactionType: 'Dana Masuk' | 'Pengeluaran';
  categoryId?: string;
  subcategoryId?: string;
  vendorId?: string;
  description: string;
  amount: number;
  runningBalance?: number;
  note: string;
  createdAt?: number;
  rowIndex?: number;
}

export interface CashflowGreenHouseCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  active: boolean;
}

export interface CashflowGreenHouse {
  id: string;
  transactionDate: string;
  categoryId?: string;
  description: string;
  debit: number;
  credit: number;
  runningBalance?: number;
  createdAt?: number;
  rowIndex?: number;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

  interface AppContextType {
  vendors: Vendor[];
  categories: Category[];
  pettyCashCategories: PettyCashCategory[];
  subCategories: SubCategory[];
  materials: Material[];
  invoices: Invoice[];
  payments: Payment[];
  cashflows: Cashflow[];
  cashflowGreenHouse: CashflowGreenHouse[];
  cashflowGreenHouseCategories: CashflowGreenHouseCategory[];
  pettyCashes: PettyCash[];
  toasts: Toast[];
  showToast: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
  removeToast: (id: string) => void;

  // Modal control states for Quick Actions
  openMaterialModal: boolean;
  setOpenMaterialModal: (val: boolean) => void;
  openInvoiceModal: boolean;
  setOpenInvoiceModal: (val: boolean) => void;
  openCashflowModal: boolean;
  setOpenCashflowModal: (val: boolean) => void;

  // Vendor actions
  addVendor: (vendor: Omit<Vendor, 'id'>) => Vendor;
  updateVendor: (id: string, vendor: Partial<Vendor>) => void;
  deleteVendor: (id: string) => boolean;

  // Category actions
  addCategory: (category: Omit<Category, 'id'>) => Category;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => boolean;
  deleteCategories: (ids: string[]) => { deleted: string[]; blocked: string[] };

  // PettyCashCategory actions
  addPettyCashCategory: (category: Omit<PettyCashCategory, 'id'>) => PettyCashCategory;
  updatePettyCashCategory: (id: string, category: Partial<PettyCashCategory>) => void;
  deletePettyCashCategory: (id: string) => boolean;
  deletePettyCashCategories: (ids: string[]) => { deleted: string[]; blocked: string[] };

  // SubCategory actions
  addSubCategory: (sub: Omit<SubCategory, 'id'>) => SubCategory;
  updateSubCategory: (id: string, sub: Partial<SubCategory>) => void;
  deleteSubCategory: (id: string) => void;

  // Material actions
  addMaterial: (material: Omit<Material, 'id' | 'status'>) => void;
  updateMaterial: (id: string, material: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  deleteMaterials: (ids: string[]) => void;

  // Invoice & Payment actions
  addInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  deleteInvoices: (ids: string[]) => void;
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePayment: (id: string, payment: Partial<Payment>) => void;
  deletePayment: (id: string) => void;

  // Cashflow actions
  addCashflow: (cashflow: Omit<Cashflow, 'id' | 'runningBalance'>) => void;
  addCashflows: (cashflowList: Omit<Cashflow, 'id' | 'runningBalance'>[]) => void;
  updateCashflow: (id: string, cashflow: Partial<Cashflow>) => void;
  deleteCashflow: (id: string) => void;
  deleteCashflows: (ids: string[]) => void;

  // Cashflow Green House actions
  addCashflowGreenHouse: (cashflow: Omit<CashflowGreenHouse, 'id' | 'runningBalance'>) => void;
  addCashflowsGreenHouse: (cashflowList: Omit<CashflowGreenHouse, 'id' | 'runningBalance'>[]) => void;
  updateCashflowGreenHouse: (id: string, cashflow: Partial<CashflowGreenHouse>) => void;
  deleteCashflowGreenHouse: (id: string) => void;
  deleteCashflowsGreenHouse: (ids: string[]) => void;
  addCashflowGreenHouseCategory: (category: Omit<CashflowGreenHouseCategory, 'id'>) => CashflowGreenHouseCategory;
  updateCashflowGreenHouseCategory: (id: string, category: Partial<CashflowGreenHouseCategory>) => void;
  deleteCashflowGreenHouseCategory: (id: string) => boolean;
  deleteCashflowGreenHouseCategories: (ids: string[]) => { deleted: string[]; blocked: string[] };

  // PettyCash actions
  addPettyCash: (pettyCash: Omit<PettyCash, 'id' | 'runningBalance'>) => void;
  addPettyCashes: (pettyCashList: Omit<PettyCash, 'id' | 'runningBalance'>[]) => void;
  updatePettyCash: (id: string, pettyCash: Partial<PettyCash>) => void;
  deletePettyCash: (id: string) => void;
  deletePettyCashes: (ids: string[]) => void;

  // Global Items Per Page
  itemsPerPage: number;
  setItemsPerPage: (val: number) => void;

  // Authentication State
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateAccount: (username: string, password?: string) => void;
  currentUser: { username: string };
  isDataLoading: boolean;
  dataLoadError: string | null;
  retryDataLoad: () => void;
  importAllData: (jsonData: string) => boolean;
  exportAllData: () => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Mock Data
const initialVendors: Vendor[] = [
  { id: 'v1', name: 'PT Semen Perkasa', address: 'Jl. Merdeka No. 10, Jakarta', pic: 'Budi Santoso', phone: '081234567890', bank: 'BCA', accountNumber: '8001234567' },
  { id: 'v2', name: 'UD Jaya Besi', address: 'Jl. Raya Industri No. 45, Bekasi', pic: 'Hendra Wijaya', phone: '081987654321', bank: 'Mandiri', accountNumber: '1230004567890' },
  { id: 'v3', name: 'CV Pasir Abadi', address: 'Jl. Pasir Putih No. 12, Bogor', pic: 'Slamet', phone: '082111222333', bank: 'BRI', accountNumber: '001201999988776' }
];

const initialCategories: Category[] = [
  { id: 'c1', name: 'Biaya Material', icon: 'Hammer', color: '#3b82f6', active: true },
  { id: 'c2', name: 'Biaya SDM', icon: 'Users', color: '#10b981', active: true },
  { id: 'c3', name: 'Biaya Operasional', icon: 'Cpu', color: '#f59e0b', active: true },
  { id: 'c4', name: 'Adm Bank', icon: 'CreditCard', color: '#6b7280', active: true }
];

const initialPettyCashCategories: PettyCashCategory[] = [
  { id: 'pc1', name: 'Operasional', icon: 'Settings', color: '#10b981', active: true },
  { id: 'pc2', name: 'Konsumsi', icon: 'Coffee', color: '#f59e0b', active: true },
  { id: 'pc3', name: 'Transportasi', icon: 'Truck', color: '#3b82f6', active: true },
  { id: 'pc4', name: 'Lain-lain', icon: 'Box', color: '#6b7280', active: true }
];

const initialSubCategories: SubCategory[] = [
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

const initialMaterials: Material[] = [
  { id: 'm1', itemName: 'Semen Portland (50kg)', unit: 'Zak', quantityRequested: 100, requestDate: '2026-07-10', quantityReceived: 100, status: 'Complete', receipts: [{ id: 'mr1', receiveDate: '2026-07-15', quantityReceived: 100, verification: true, note: '' }] },
  { id: 'm2', itemName: 'Besi Beton 12mm', unit: 'Batang', quantityRequested: 50, requestDate: '2026-07-12', quantityReceived: 30, status: 'Partial', receipts: [{ id: 'mr2', receiveDate: '2026-07-18', quantityReceived: 30, verification: true, note: '' }] },
  { id: 'm3', itemName: 'Pasir Beton', unit: 'M3', quantityRequested: 10, requestDate: '2026-07-22', quantityReceived: 0, status: 'Waiting', receipts: [] },
  { id: 'm4', itemName: 'Batu Split 2/3', unit: 'M3', quantityRequested: 15, requestDate: '2026-07-18', quantityReceived: 10, status: 'Partial', receipts: [{ id: 'mr3', receiveDate: '2026-07-20', quantityReceived: 10, verification: false, note: 'Batu split agak kotor dan basah' }] }
];

const initialInvoices: Invoice[] = [
  { id: 'inv1', vendorId: 'v1', invoiceNumber: 'INV/2026/001', invoiceDate: '2026-07-10', description: 'Pembelian Semen Portland 100 zak', totalInvoice: 7500000, termin: 1 },
  { id: 'inv2', vendorId: 'v2', invoiceNumber: 'INV/2026/045', invoiceDate: '2026-07-12', description: 'Pembelian Besi Beton 12mm 50 batang', totalInvoice: 9500000, termin: 2 }
];

const initialPayments: Payment[] = [
  { id: 'p1', invoiceId: 'inv1', paymentDate: '2026-07-11', amount: 7500000, paymentNote: 'Lunas Termur' },
  { id: 'p2', invoiceId: 'inv2', paymentDate: '2026-07-13', amount: 4500000, paymentNote: 'DP 50% kurang 5 juta' }
];

const initialCashflowGreenHouseCategories: CashflowGreenHouseCategory[] = [
  { id: 'cfgh_cat_1', name: 'Operasional Kantor', icon: 'Building2', color: '#3b82f6', active: true },
  { id: 'cfgh_cat_2', name: 'Gaji dan Tunjangan', icon: 'Users', color: '#10b981', active: true },
  { id: 'cfgh_cat_3', name: 'Lain-lain', icon: 'Box', color: '#6b7280', active: true }
];

const initialCashflows: Cashflow[] = [
  { id: 'cf1', transactionDate: '2026-07-01', transactionType: 'Dana Masuk', description: 'Modal Awal dari Owner', amount: 100000000, note: 'Transfer bank Mandiri' },
  { id: 'cf2', transactionDate: '2026-07-11', transactionType: 'Pengeluaran', categoryId: 'c1', subcategoryId: 'sc1', vendorId: 'v1', description: 'Pembayaran INV/2026/001 - Semen Portland', amount: 7500000, note: 'Transfer BCA' },
  { id: 'cf3', transactionDate: '2026-07-13', transactionType: 'Pengeluaran', categoryId: 'c1', subcategoryId: 'sc2', vendorId: 'v2', description: 'Pembayaran DP INV/2026/045 - Besi Beton', amount: 4500000, note: 'Transfer Mandiri' },
  { id: 'cf4', transactionDate: '2026-07-14', transactionType: 'Pengeluaran', categoryId: 'c4', description: 'Biaya Admin Bank Transfer', amount: 6500, note: 'Biaya admin' }
];

// Helper to generate UUID with mobile fallback
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Math.random fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pettyCashCategories, setPettyCashCategories] = useState<PettyCashCategory[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [cashflows, setCashflows] = useState<Cashflow[]>([]);
  const [cashflowGreenHouse, setCashflowGreenHouse] = useState<CashflowGreenHouse[]>([]);
  const [cashflowGreenHouseCategories, setCashflowGreenHouseCategories] = useState<CashflowGreenHouseCategory[]>([]);
  const [pettyCashes, setPettyCashes] = useState<PettyCash[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL));
  const [dataLoadError, setDataLoadError] = useState<string | null>(null);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    const id = generateUUID();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  // Offline Mode queue and sync logic
  useEffect(() => {
    const handleOnline = async () => {
      const queue = JSON.parse(localStorage.getItem('cpms_offline_queue') || '[]');
      if (queue.length === 0) return;
      showToast('info', `Menghubungkan kembali... Memproses ${queue.length} aksi tertunda.`);
      
      const newQueue = [];
      for (const action of queue) {
        try {
          const { table, method, payload, match, timestamp } = action;
          const query = supabase.from(table);
          
          if (method === 'update' || method === 'delete') {
            const id = match?.id || match?.invoice_id;
            if (id) {
              const { data: serverData } = await query.select('updated_at').match(match).maybeSingle();
              if (serverData && (serverData as { updated_at?: string }).updated_at) {
                const serverTime = new Date((serverData as { updated_at?: string }).updated_at || 0).getTime();
                const actionTime = timestamp || 0;
                if (serverTime > actionTime) {
                  console.warn(`Conflict detected for ${table} with id ${id}. Server data is newer. Action discarded.`);
                  continue;
                }
              }
            }
          }

          if (method === 'insert') {
            const { error } = await query.insert(payload);
            if (error) throw error;
          } else if (method === 'update') {
            const { error } = await query.update(payload).match(match);
            if (error) throw error;
          } else if (method === 'delete') {
            const { error } = await query.delete().match(match);
            if (error) throw error;
          } else if (method === 'upsert') {
            const { error } = await query.upsert(payload);
            if (error) throw error;
          }
        } catch (err) {
          console.error("Failed to sync offline action:", err);
          newQueue.push(action);
        }
      }
      
      if (newQueue.length > 0) {
        localStorage.setItem('cpms_offline_queue', JSON.stringify(newQueue));
        showToast('warning', `Sebagian aksi gagal disinkronkan kembali. Tersisa ${newQueue.length} aksi.`);
      } else {
        localStorage.removeItem('cpms_offline_queue');
        showToast('success', 'Semua data offline berhasil disinkronkan!');
        fetchSupabaseData();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [showToast]);

  const queueOfflineAction = (action: { table: string; method: string; payload?: unknown; match?: Record<string, unknown> }) => {
    const queue = JSON.parse(localStorage.getItem('cpms_offline_queue') || '[]');
    queue.push({ ...action, timestamp: Date.now() });
    localStorage.setItem('cpms_offline_queue', JSON.stringify(queue));
    showToast('warning', 'Sedang offline. Aksi disimpan dalam antrean.');
  };

  interface SupabaseError {
    message: string;
    status?: number;
    code?: string;
  }

  const handleSupabaseWrite = async (
    operation: () => Promise<{ error: SupabaseError | null } | null | undefined | void | unknown> | unknown,
    offlineAction: { table: string; method: string; payload?: unknown; match?: Record<string, unknown> }
  ) => {
    if (!navigator.onLine) {
      queueOfflineAction(offlineAction);
      return;
    }
    try {
      const res = await (operation as () => Promise<{ error: SupabaseError | null }>)();
      if (res && res.error) {
        const error = res.error;
        // If error looks like a network error, queue it
        if (error.message === 'Failed to fetch' || error.status === 0 || error.code === 'PGRST301') {
          queueOfflineAction(offlineAction);
        } else {
          console.error("Supabase write error:", error);
          showToast('error', `Gagal menyimpan: ${error.message}`);
        }
      }
    } catch {
      queueOfflineAction(offlineAction);
    }
  };

  const [itemsPerPage, setItemsPerPageState] = useState<number>(5);

  const [openMaterialModal, setOpenMaterialModal] = useState<boolean>(false);
  const [openInvoiceModal, setOpenInvoiceModal] = useState<boolean>(false);
  const [openCashflowModal, setOpenCashflowModal] = useState<boolean>(false);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ username: string }>({ username: 'admin' });

  // Sync Supabase Helper Functions
  const fetchSupabaseData = async () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    setIsDataLoading(true);
    setDataLoadError(null);
    try {
      const [vRes, cRes, pccRes, scRes, mRes, iRes, pRes, cfRes, pcRes, aRes] = await Promise.all([
        supabase.from('vendors').select('*').order('name'),
        supabase.from('categories').select('*').order('name'),
        supabase.from('petty_cash_categories').select('*').order('name'),
        supabase.from('subcategories').select('*').order('name'),
        supabase.from('materials').select('*').order('item_name'),
        supabase.from('invoices').select('*'),
        supabase.from('payments').select('*'),
        supabase.from('cashflows').select('*'),
        supabase.from('petty_cashes').select('*'),
        supabase.from('accounts').select('*').eq('id', 'primary').maybeSingle()
      ]);

      const queryError = [vRes, cRes, pccRes, scRes, mRes, iRes, pRes, cfRes, pcRes, aRes].find(result => result.error);
      if (queryError?.error) {
        throw new Error(queryError.error.message);
      }

      // Fetch Cashflow Green House tables separately — skip gracefully if tables don't exist yet
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let cfghCatData: any[] | null = null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let cfghData: any[] | null = null;
      try {
        const [cfghCatRes, cfghRes] = await Promise.all([
          supabase.from('cashflow_green_house_categories').select('*').order('name'),
          supabase.from('cashflow_green_house').select('*'),
        ]);
        if (cfghCatRes.error || cfghRes.error) {
          console.warn('Cashflow Green House tables not available yet, using localStorage fallback:', cfghCatRes.error?.message || cfghRes.error?.message);
        } else {
          cfghCatData = cfghCatRes.data;
          cfghData = cfghRes.data;
        }
      } catch {
        console.warn('Cashflow Green House tables not available yet, using localStorage fallback');
      }

      setDataLoadError(null);
      if (vRes.data) setVendors(vRes.data);
      if (cRes.data) setCategories(cRes.data);
      if (pccRes.data) setPettyCashCategories(pccRes.data);
      if (scRes.data) setSubCategories(scRes.data);
      if (aRes.data) {
        // Sync account to LocalStorage
        localStorage.setItem('cpms_user_username', aRes.data.username);
        localStorage.setItem('cpms_user_password', aRes.data.password);
        setCurrentUser({ username: aRes.data.username });
      }
        if (mRes.data) {
          setMaterials(mRes.data.map((m) => ({
            id: m.id,
            itemName: m.item_name,
            unit: m.unit,
            quantityRequested: Number(m.quantity_requested),
            requestDate: m.request_date || '',
            quantityReceived: Number(m.quantity_received),
            status: m.status as 'Complete' | 'Partial' | 'Waiting',
            receipts: typeof m.receipts === 'string' ? JSON.parse(m.receipts) : (m.receipts || [])
          })));
        }
      if (iRes.data) {
        setInvoices(iRes.data.map((i) => ({
          id: i.id,
          vendorId: i.vendor_id,
          invoiceNumber: i.invoice_number,
          invoiceDate: i.invoice_date,
          description: i.description || '',
          totalInvoice: Number(i.total_invoice),
          termin: i.termin,
          createdAt: new Date(i.created_at).getTime()
        })));
      }
      if (pRes.data) {
        setPayments(pRes.data.map((p) => ({
          id: p.id,
          invoiceId: p.invoice_id,
          paymentDate: p.payment_date,
          amount: Number(p.amount),
          paymentNote: p.payment_note || ''
        })));
      }
      if (cfRes.data) {
        setCashflows(cfRes.data.map((cf) => ({
          id: cf.id,
          transactionDate: cf.transaction_date,
          transactionType: cf.transaction_type as 'Dana Masuk' | 'Pengeluaran',
          categoryId: cf.category_id || undefined,
          subcategoryId: cf.subcategory_id || undefined,
          vendorId: cf.vendor_id || undefined,
          description: cf.description,
          amount: Number(cf.amount),
          note: cf.note || '',
          createdAt: new Date(cf.created_at).getTime(),
          rowIndex: cf.row_index !== null && cf.row_index !== undefined ? Number(cf.row_index) : undefined
        })));
      }
      if (cfghCatData) setCashflowGreenHouseCategories(cfghCatData);
      if (cfghData) {
        setCashflowGreenHouse(cfghData.map((cf) => ({
          id: cf.id,
          transactionDate: cf.transaction_date,
          categoryId: cf.category_id || undefined,
          description: cf.description || '',
          debit: Number(cf.debit || 0),
          credit: Number(cf.credit || 0),
          createdAt: cf.created_at ? new Date(cf.created_at).getTime() : undefined,
          rowIndex: cf.row_index !== null && cf.row_index !== undefined ? Number(cf.row_index) : undefined
        })));
      }
      if (pcRes.data) {
        setPettyCashes(pcRes.data.map((pc) => ({
          id: pc.id,
          transactionDate: pc.transaction_date,
          transactionType: pc.transaction_type as 'Dana Masuk' | 'Pengeluaran',
          categoryId: pc.category_id || undefined,
          subcategoryId: pc.subcategory_id || undefined,
          vendorId: pc.vendor_id || undefined,
          description: pc.description,
          amount: Number(pc.amount),
          note: pc.note || '',
          createdAt: new Date(pc.created_at).getTime(),
          rowIndex: pc.row_index !== null && pc.row_index !== undefined ? Number(pc.row_index) : undefined
        })));
      }
    } catch (err) {
      console.error("Error fetching from Supabase", err);
      setDataLoadError(err instanceof Error ? err.message : 'Gagal memuat data dari Supabase.');
    } finally {
      setIsDataLoading(false);
    }
  };

  const retryDataLoad = () => {
    void fetchSupabaseData();
  };

  // Load from LocalStorage or Supabase
  useEffect(() => {
    const authStatus = localStorage.getItem('cpms_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    const localUsername = localStorage.getItem('cpms_user_username') || 'admin';
    setCurrentUser({ username: localUsername });

    const localItemsPerPage = localStorage.getItem('cpms_items_per_page');
    if (localItemsPerPage) setItemsPerPageState(Number(localItemsPerPage));

    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      fetchSupabaseData();

      const channel = supabase
        .channel('db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public' },
          () => {
            fetchSupabaseData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      const localVendors = localStorage.getItem('cpms_vendors');
      const localCategories = localStorage.getItem('cpms_categories');
      const localPettyCashCategories = localStorage.getItem('cpms_petty_cash_categories');
      const localSubCategories = localStorage.getItem('cpms_subcategories');
      const localMaterials = localStorage.getItem('cpms_materials');
      const localInvoices = localStorage.getItem('cpms_invoices');
      const localPayments = localStorage.getItem('cpms_payments');
      const localCashflows = localStorage.getItem('cpms_cashflows');
      const localCashflowGreenHouse = localStorage.getItem('cpms_cashflow_green_house');
      const localCashflowGreenHouseCategories = localStorage.getItem('cpms_cashflow_green_house_categories');
      const localPettyCashes = localStorage.getItem('cpms_petty_cashes');

      if (localCashflowGreenHouseCategories) setCashflowGreenHouseCategories(JSON.parse(localCashflowGreenHouseCategories));
      else setCashflowGreenHouseCategories(initialCashflowGreenHouseCategories);

      if (localCashflowGreenHouse) setCashflowGreenHouse(JSON.parse(localCashflowGreenHouse));
      else setCashflowGreenHouse([]);

      if (localVendors) setVendors(JSON.parse(localVendors));
      else setVendors(initialVendors);

      if (localCategories) setCategories(JSON.parse(localCategories));
      else setCategories(initialCategories);

      if (localPettyCashCategories) setPettyCashCategories(JSON.parse(localPettyCashCategories));
      else setPettyCashCategories(initialPettyCashCategories);

      if (localSubCategories) setSubCategories(JSON.parse(localSubCategories));
      else setSubCategories(initialSubCategories);

      if (localMaterials) setMaterials(JSON.parse(localMaterials));
      else setMaterials(initialMaterials);

      if (localInvoices) setInvoices(JSON.parse(localInvoices));
      else setInvoices(initialInvoices);

      if (localPayments) setPayments(JSON.parse(localPayments));
      else setPayments(initialPayments);

      if (localCashflows) setCashflows(JSON.parse(localCashflows));
      else setCashflows(initialCashflows);

      if (localPettyCashes) setPettyCashes(JSON.parse(localPettyCashes));
    }
  }, []);

  const setItemsPerPage = (val: number) => {
    setItemsPerPageState(val);
    localStorage.setItem('cpms_items_per_page', String(val));
  };

  const login = (username: string, password: string): boolean => {
    const savedUsername = localStorage.getItem('cpms_user_username') || 'admin';
    const savedPassword = localStorage.getItem('cpms_user_password') || 'admin123';
    if (username === savedUsername && password === savedPassword) {
      setIsAuthenticated(true);
      setCurrentUser({ username });
      localStorage.setItem('cpms_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('cpms_auth');
  };

  const updateAccount = (username: string, password?: string) => {
    setCurrentUser({ username });
    localStorage.setItem('cpms_user_username', username);
    
    const payload: Record<string, string> = { username };
    if (password) {
      localStorage.setItem('cpms_user_password', password);
      payload.password = password;
    }

    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      supabase.from('accounts').upsert({ id: 'primary', ...payload }).then(({ error }) => {
        if (error) console.error("Supabase upsert account error", error);
      });
    }

    showToast('success', 'Akun berhasil diperbarui');
  };

  // Save to LocalStorage helper
  const save = (key: string, data: unknown) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Vendor actions
  const addVendor = (vendor: Omit<Vendor, 'id'>): Vendor => {
    const newId = generateUUID();
    const newVendor = { ...vendor, id: newId };
    const updated = [...vendors, newVendor];
    setVendors(updated);
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      handleSupabaseWrite(
        () => supabase.from('vendors').insert([{
          id: newId,
          name: vendor.name,
          address: vendor.address,
          pic: vendor.pic,
          phone: vendor.phone,
          bank: vendor.bank,
          account_number: vendor.accountNumber
        }]),
        {
          table: 'vendors',
          method: 'insert',
          payload: {
            id: newId,
            name: vendor.name,
            address: vendor.address,
            pic: vendor.pic,
            phone: vendor.phone,
            bank: vendor.bank,
            account_number: vendor.accountNumber
          }
        }
      );
    } else {
      save('cpms_vendors', updated);
    }
    showToast('success', 'Vendor berhasil ditambahkan');
    return newVendor;
  };

  const updateVendor = (id: string, vendor: Partial<Vendor>) => {
    const updated = vendors.map(v => v.id === id ? { ...v, ...vendor } : v);
    setVendors(updated);
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const payload: Record<string, string | number | boolean | null> = {};
      if (vendor.name !== undefined) payload.name = vendor.name;
      if (vendor.address !== undefined) payload.address = vendor.address;
      if (vendor.pic !== undefined) payload.pic = vendor.pic;
      if (vendor.phone !== undefined) payload.phone = vendor.phone;
      if (vendor.bank !== undefined) payload.bank = vendor.bank;
      if (vendor.accountNumber !== undefined) payload.account_number = vendor.accountNumber;

      handleSupabaseWrite(
        () => supabase.from('vendors').update(payload).eq('id', id),
        {
          table: 'vendors',
          method: 'update',
          payload,
          match: { id }
        }
      );
    } else {
      save('cpms_vendors', updated);
    }
    showToast('success', 'Vendor berhasil diperbarui');
  };

  const deleteVendor = (id: string): boolean => {
    const inUseInvoices = invoices.some(i => i.vendorId === id);
    const inUseCashflows = cashflows.some(c => c.vendorId === id);
    if (inUseInvoices || inUseCashflows) {
      showToast('error', 'Gagal menghapus! Vendor ini masih terikat dengan data Invoice atau transaksi Cashflow.');
      return false;
    }
    const updated = vendors.filter(v => v.id !== id);
    setVendors(updated);
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      handleSupabaseWrite(
        () => supabase.from('vendors').delete().eq('id', id),
        {
          table: 'vendors',
          method: 'delete',
          match: { id }
        }
      );
    } else {
      save('cpms_vendors', updated);
    }
    showToast('success', 'Vendor berhasil dihapus');
    return true;
  };

  // Category actions
  const addCategory = (category: Omit<Category, 'id'>): Category => {
    const newId = 'c_' + generateUUID();
    const newCategory = { ...category, id: newId };
    const updated = [...categories, newCategory];
    setCategories(updated);
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      handleSupabaseWrite(
        () => supabase.from('categories').insert([{
          id: newId,
          name: category.name,
          icon: category.icon,
          color: category.color,
          active: category.active
        }]),
        {
          table: 'categories',
          method: 'insert',
          payload: {
            id: newId,
            name: category.name,
            icon: category.icon,
            color: category.color,
            active: category.active
          }
        }
      );
    } else {
      save('cpms_categories', updated);
    }
    showToast('success', 'Kategori berhasil ditambahkan');
    return newCategory;
  };

  const updateCategory = (id: string, category: Partial<Category>) => {
    const updated = categories.map(c => c.id === id ? { ...c, ...category } : c);
    setCategories(updated);
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const payload: Record<string, string | number | boolean | null> = {};
      if (category.name !== undefined) payload.name = category.name;
      if (category.icon !== undefined) payload.icon = category.icon;
      if (category.color !== undefined) payload.color = category.color;
      if (category.active !== undefined) payload.active = category.active;

      handleSupabaseWrite(
        () => supabase.from('categories').update(payload).eq('id', id),
        {
          table: 'categories',
          method: 'update',
          payload,
          match: { id }
        }
      );
    } else {
      save('cpms_categories', updated);
    }
    showToast('success', 'Kategori berhasil diperbarui');
  };

  const deleteCategory = (id: string): boolean => {
    const inUse = cashflows.some(c => c.categoryId === id);
    if (inUse) {
      showToast('error', 'Gagal menghapus! Kategori ini sedang digunakan dalam transaksi Cashflow.');
      return false;
    }
    const updated = categories.filter(c => c.id !== id);
    const updatedSub = subCategories.filter(sc => sc.categoryId !== id);
    setCategories(updated);
    setSubCategories(updatedSub);
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      handleSupabaseWrite(
        () => supabase.from('categories').delete().eq('id', id),
        {
          table: 'categories',
          method: 'delete',
          match: { id }
        }
      );
    } else {
      save('cpms_categories', updated);
      save('cpms_subcategories', updatedSub);
    }
    showToast('success', 'Kategori berhasil dihapus');
    return true;
  };

  const deleteCategories = (ids: string[]): { deleted: string[]; blocked: string[] } => {
    const deleted: string[] = [];
    const blocked: string[] = [];

    ids.forEach(id => {
      const inUse = cashflows.some(c => c.categoryId === id);
      if (inUse) {
        const cat = categories.find(c => c.id === id);
        blocked.push(cat?.name || id);
      } else {
        deleted.push(id);
      }
    });

    if (deleted.length > 0) {
      const updated = categories.filter(c => !deleted.includes(c.id));
      const updatedSub = subCategories.filter(sc => !deleted.includes(sc.categoryId));
      setCategories(updated);
      setSubCategories(updatedSub);
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        handleSupabaseWrite(
          () => supabase.from('categories').delete().in('id', deleted),
          { table: 'categories', method: 'delete', match: { id: deleted } }
        );
      } else {
        save('cpms_categories', updated);
        save('cpms_subcategories', updatedSub);
      }
    }

    if (deleted.length > 0) {
      showToast('success', `${deleted.length} kategori berhasil dihapus`);
    }

    return { deleted, blocked };
  };

  const addPettyCashCategory = (category: Omit<PettyCashCategory, 'id'>): PettyCashCategory => {
    const newId = 'pcc_' + generateUUID();
    const newCategory = { ...category, id: newId };
    const updated = [...pettyCashCategories, newCategory];
    setPettyCashCategories(updated);
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      handleSupabaseWrite(
        () => supabase.from('petty_cash_categories').insert([{
          id: newId,
          name: category.name,
          icon: category.icon,
          color: category.color,
          active: category.active
        }]),
        {
          table: 'petty_cash_categories',
          method: 'insert',
          payload: {
            id: newId,
            name: category.name,
            icon: category.icon,
            color: category.color,
            active: category.active
          }
        }
      );
    } else {
      save('cpms_petty_cash_categories', updated);
    }
    showToast('success', 'Kategori Petty Cash berhasil ditambahkan');
    return newCategory;
  };

  const updatePettyCashCategory = (id: string, category: Partial<PettyCashCategory>) => {
    const updated = pettyCashCategories.map(c => c.id === id ? { ...c, ...category } : c);
    setPettyCashCategories(updated);
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const payload: Record<string, string | number | boolean | null> = {};
      if (category.name !== undefined) payload.name = category.name;
      if (category.icon !== undefined) payload.icon = category.icon;
      if (category.color !== undefined) payload.color = category.color;
      if (category.active !== undefined) payload.active = category.active;

      handleSupabaseWrite(
        () => supabase.from('petty_cash_categories').update(payload).eq('id', id),
        {
          table: 'petty_cash_categories',
          method: 'update',
          payload,
          match: { id }
        }
      );
    } else {
      save('cpms_petty_cash_categories', updated);
    }
    showToast('success', 'Kategori Petty Cash berhasil diperbarui');
  };

  const deletePettyCashCategory = (id: string): boolean => {
    const inUse = pettyCashes.some(c => c.categoryId === id);
    if (inUse) {
      showToast('error', 'Gagal menghapus! Kategori ini sedang digunakan dalam transaksi Petty Cash.');
      return false;
    }
    const updated = pettyCashCategories.filter(c => c.id !== id);
    setPettyCashCategories(updated);
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      handleSupabaseWrite(
        () => supabase.from('petty_cash_categories').delete().eq('id', id),
        {
          table: 'petty_cash_categories',
          method: 'delete',
          match: { id }
        }
      );
    } else {
      save('cpms_petty_cash_categories', updated);
    }
    showToast('success', 'Kategori Petty Cash berhasil dihapus');
    return true;
  };

  const deletePettyCashCategories = (ids: string[]): { deleted: string[]; blocked: string[] } => {
    const deleted: string[] = [];
    const blocked: string[] = [];

    ids.forEach(id => {
      const inUse = pettyCashes.some(c => c.categoryId === id);
      if (inUse) {
        const cat = pettyCashCategories.find(c => c.id === id);
        blocked.push(cat?.name || id);
      } else {
        deleted.push(id);
      }
    });

    if (deleted.length > 0) {
      const updated = pettyCashCategories.filter(c => !deleted.includes(c.id));
      setPettyCashCategories(updated);
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        handleSupabaseWrite(
          () => supabase.from('petty_cash_categories').delete().in('id', deleted),
          { table: 'petty_cash_categories', method: 'delete', match: { id: deleted } }
        );
      } else {
        save('cpms_petty_cash_categories', updated);
      }
    }

    if (deleted.length > 0) {
      showToast('success', `${deleted.length} kategori Petty Cash berhasil dihapus`);
    }

    return { deleted, blocked };
  };

  // SubCategory actions
  const addSubCategory = (sub: Omit<SubCategory, 'id'>): SubCategory => {
    const newId = 'sc_' + generateUUID();
    const newSub = { ...sub, id: newId };
    const updated = [...subCategories, newSub];
    setSubCategories(updated);
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      handleSupabaseWrite(
        () => supabase.from('subcategories').insert([{
          id: newId,
          category_id: sub.categoryId,
          name: sub.name,
          active: sub.active
        }]),
        {
          table: 'subcategories',
          method: 'insert',
          payload: {
            id: newId,
            category_id: sub.categoryId,
            name: sub.name,
            active: sub.active
          }
        }
      );
    } else {
      save('cpms_subcategories', updated);
    }
    showToast('success', 'Sub-kategori berhasil ditambahkan');
    return newSub;
  };

  const updateSubCategory = (id: string, sub: Partial<SubCategory>) => {
    const updated = subCategories.map(s => s.id === id ? { ...s, ...sub } : s);
    setSubCategories(updated);
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const payload: Record<string, string | number | boolean | null> = {};
      if (sub.categoryId !== undefined) payload.category_id = sub.categoryId;
      if (sub.name !== undefined) payload.name = sub.name;
      if (sub.active !== undefined) payload.active = sub.active;

      handleSupabaseWrite(
        () => supabase.from('subcategories').update(payload).eq('id', id),
        {
          table: 'subcategories',
          method: 'update',
          payload,
          match: { id }
        }
      );
    } else {
      save('cpms_subcategories', updated);
    }
    showToast('success', 'Sub-kategori berhasil diperbarui');
  };

  const deleteSubCategory = (id: string) => {
    const updated = subCategories.filter(s => s.id !== id);
    setSubCategories(updated);
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      handleSupabaseWrite(
        () => supabase.from('subcategories').delete().eq('id', id),
        {
          table: 'subcategories',
          method: 'delete',
          match: { id }
        }
      );
    } else {
      save('cpms_subcategories', updated);
    }
    showToast('success', 'Sub-kategori berhasil dihapus');
  };

    // Material actions
    const addMaterial = (material: Omit<Material, 'id' | 'status'>) => {
      let status: 'Complete' | 'Partial' | 'Waiting' = 'Waiting';
      if (material.quantityReceived >= material.quantityRequested && material.quantityRequested > 0) {
        status = 'Complete';
      } else if (material.quantityReceived > 0) {
        status = 'Partial';
      }
      const newId = generateUUID();
      const newMat = { ...material, id: newId, status };
      const updated = [...materials, newMat];
      setMaterials(updated);
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        handleSupabaseWrite(
          () => supabase.from('materials').insert([{
            id: newId,
            item_name: material.itemName,
            unit: material.unit,
            quantity_requested: material.quantityRequested,
            request_date: material.requestDate || null,
            quantity_received: material.quantityReceived,
            status,
            receipts: material.receipts
          }]),
          {
            table: 'materials',
            method: 'insert',
            payload: {
              id: newId,
              item_name: material.itemName,
              unit: material.unit,
              quantity_requested: material.quantityRequested,
              request_date: material.requestDate || null,
              quantity_received: material.quantityReceived,
              status,
              receipts: material.receipts
            }
          }
        );
      } else {
        save('cpms_materials', updated);
      }
      showToast('success', 'Material berhasil ditambahkan');
    };

    const updateMaterial = (id: string, material: Partial<Material>) => {
      let newStatus: 'Complete' | 'Partial' | 'Waiting' | undefined;
      const updated = materials.map(m => {
        if (m.id === id) {
          const merged = { ...m, ...material };
          let status: 'Complete' | 'Partial' | 'Waiting' = 'Waiting';
          if (merged.quantityReceived >= merged.quantityRequested && merged.quantityRequested > 0) {
            status = 'Complete';
          } else if (merged.quantityReceived > 0) {
            status = 'Partial';
          }
          newStatus = status;
          return { ...merged, status };
        }
        return m;
      });
      setMaterials(updated);
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const payload: Record<string, string | number | boolean | null | MaterialReceipt[]> = {};
        if (material.itemName !== undefined) payload.item_name = material.itemName;
        if (material.unit !== undefined) payload.unit = material.unit;
        if (material.quantityRequested !== undefined) payload.quantity_requested = material.quantityRequested;
        if (material.requestDate !== undefined) payload.request_date = material.requestDate || null;
        if (material.quantityReceived !== undefined) payload.quantity_received = material.quantityReceived;
        if (newStatus !== undefined) payload.status = newStatus;
        if (material.receipts !== undefined) payload.receipts = material.receipts;

        handleSupabaseWrite(
          () => supabase.from('materials').update(payload).eq('id', id),
          {
            table: 'materials',
            method: 'update',
            payload,
            match: { id }
          }
        );
      } else {
        save('cpms_materials', updated);
      }
      showToast('success', 'Material berhasil diperbarui');
    };

  const deleteMaterial = (id: string) => {
    const updated = materials.filter(m => m.id !== id);
    setMaterials(updated);
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      handleSupabaseWrite(
        () => supabase.from('materials').delete().eq('id', id),
        {
          table: 'materials',
          method: 'delete',
          match: { id }
        }
      );
    } else {
      save('cpms_materials', updated);
    }
    showToast('success', 'Material berhasil dihapus');
  };

  const deleteMaterials = (ids: string[]) => {
    const updated = materials.filter(m => !ids.includes(m.id));
    setMaterials(updated);
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      handleSupabaseWrite(
        () => supabase.from('materials').delete().in('id', ids),
        {
          table: 'materials',
          method: 'delete',
          match: { id: ids } // match expects object, we handle it or customize it. In supabase.from().delete().in('id', ids), we can match using match: { id: ids } but match method might do exact match or we can map match array in handleOnline
        }
      );
    } else {
      save('cpms_materials', updated);
    }
    showToast('success', `${ids.length} material berhasil dihapus`);
  };

  // Invoice & Payments
  const addInvoice = (invoice: Omit<Invoice, 'id'>) => {
    const newId = generateUUID();
    const newInv = { 
      ...invoice, 
      id: newId,
      createdAt: Date.now()
    };
    const updated = [...invoices, newInv];
    setInvoices(updated);
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      handleSupabaseWrite(
        () => supabase.from('invoices').insert([{
          id: newId,
          vendor_id: invoice.vendorId,
          invoice_number: invoice.invoiceNumber,
          invoice_date: invoice.invoiceDate,
          description: invoice.description,
          total_invoice: invoice.totalInvoice,
          termin: invoice.termin
        }]),
        {
          table: 'invoices',
          method: 'insert',
          payload: {
            id: newId,
            vendor_id: invoice.vendorId,
            invoice_number: invoice.invoiceNumber,
            invoice_date: invoice.invoiceDate,
            description: invoice.description,
            total_invoice: invoice.totalInvoice,
            termin: invoice.termin
          }
        }
      );
    } else {
      save('cpms_invoices', updated);
    }
    showToast('success', 'Invoice berhasil ditambahkan');
  };

  const updateInvoice = (id: string, invoice: Partial<Invoice>) => {
    const updated = invoices.map(i => i.id === id ? { ...i, ...invoice } : i);
    setInvoices(updated);
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const payload: Record<string, string | number | boolean | null> = {};
      if (invoice.vendorId !== undefined) payload.vendor_id = invoice.vendorId;
      if (invoice.invoiceNumber !== undefined) payload.invoice_number = invoice.invoiceNumber;
      if (invoice.invoiceDate !== undefined) payload.invoice_date = invoice.invoiceDate;
      if (invoice.description !== undefined) payload.description = invoice.description;
      if (invoice.totalInvoice !== undefined) payload.total_invoice = invoice.totalInvoice;
      if (invoice.termin !== undefined) payload.termin = invoice.termin;

      handleSupabaseWrite(
        () => supabase.from('invoices').update(payload).eq('id', id),
        {
          table: 'invoices',
          method: 'update',
          payload,
          match: { id }
        }
      );
    } else {
      save('cpms_invoices', updated);
    }
    showToast('success', 'Invoice berhasil diperbarui');
  };

  const deleteInvoice = (id: string) => {
    const updatedInvoices = invoices.filter(i => i.id !== id);
    const updatedPayments = payments.filter(p => p.invoiceId !== id);
    setInvoices(updatedInvoices);
    setPayments(updatedPayments);
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      // Delete from payments first due to foreign key constraints in Supabase
      handleSupabaseWrite(
        () => supabase.from('payments').delete().eq('invoice_id', id),
        {
          table: 'payments',
          method: 'delete',
          match: { invoice_id: id }
        }
      ).then(() => {
        handleSupabaseWrite(
          () => supabase.from('invoices').delete().eq('id', id),
          {
            table: 'invoices',
            method: 'delete',
            match: { id }
          }
        );
      });
    } else {
      save('cpms_invoices', updatedInvoices);
      save('cpms_payments', updatedPayments);
    }
    showToast('success', 'Invoice berhasil dihapus');
  };

  const deleteInvoices = (ids: string[]) => {
    const updatedInvoices = invoices.filter(i => !ids.includes(i.id));
    const updatedPayments = payments.filter(p => !ids.includes(p.invoiceId));
    setInvoices(updatedInvoices);
    setPayments(updatedPayments);
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      handleSupabaseWrite(
        () => supabase.from('payments').delete().in('invoice_id', ids),
        {
          table: 'payments',
          method: 'delete',
          match: { invoice_id: ids }
        }
      ).then(() => {
        handleSupabaseWrite(
          () => supabase.from('invoices').delete().in('id', ids),
          {
            table: 'invoices',
            method: 'delete',
            match: { id: ids }
          }
        );
      });
    } else {
      save('cpms_invoices', updatedInvoices);
      save('cpms_payments', updatedPayments);
    }
    showToast('success', `${ids.length} invoice berhasil dihapus`);
  };

  const addPayment = (payment: Omit<Payment, 'id'>) => {
    const newId = generateUUID();
    const newPayment = { ...payment, id: newId };
    const updated = [...payments, newPayment];
    setPayments(updated);
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      handleSupabaseWrite(
        () => supabase.from('payments').insert([{
          id: newId,
          invoice_id: payment.invoiceId,
          payment_date: payment.paymentDate,
          amount: payment.amount,
          payment_note: payment.paymentNote
        }]),
        {
          table: 'payments',
          method: 'insert',
          payload: {
            id: newId,
            invoice_id: payment.invoiceId,
            payment_date: payment.paymentDate,
            amount: payment.amount,
            payment_note: payment.paymentNote
          }
        }
      );
    } else {
      save('cpms_payments', updated);
    }
    showToast('success', 'Pembayaran berhasil ditambahkan');
  };

  const updatePayment = (id: string, payment: Partial<Payment>) => {
    const updated = payments.map(p => p.id === id ? { ...p, ...payment } : p);
    setPayments(updated);
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const payload: Record<string, string | number | boolean | null> = {};
      if (payment.invoiceId !== undefined) payload.invoice_id = payment.invoiceId;
      if (payment.paymentDate !== undefined) payload.payment_date = payment.paymentDate;
      if (payment.amount !== undefined) payload.amount = payment.amount;
      if (payment.paymentNote !== undefined) payload.payment_note = payment.paymentNote;

      handleSupabaseWrite(
        () => supabase.from('payments').update(payload).eq('id', id),
        {
          table: 'payments',
          method: 'update',
          payload,
          match: { id }
        }
      );
    } else {
      save('cpms_payments', updated);
    }
    showToast('success', 'Pembayaran berhasil diperbarui');
  };

  const deletePayment = (id: string) => {
    const updated = payments.filter(p => p.id !== id);
    setPayments(updated);
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      handleSupabaseWrite(
        () => supabase.from('payments').delete().eq('id', id),
        {
          table: 'payments',
          method: 'delete',
          match: { id }
        }
      );
    } else {
      save('cpms_payments', updated);
    }
    showToast('success', 'Pembayaran berhasil dihapus');
  };

  // Cashflow
  const addCashflow = (cashflow: Omit<Cashflow, 'id' | 'runningBalance'> & { rowIndex?: number }) => {
    const newId = generateUUID();
    const nextRowIndex = cashflow.rowIndex !== undefined 
      ? cashflow.rowIndex 
      : (cashflows.length > 0 ? Math.max(...cashflows.map(cf => cf.rowIndex || 0)) + 1 : 1);

    const newCf: Cashflow = { 
      ...cashflow, 
      id: newId,
      createdAt: Date.now(),
      rowIndex: nextRowIndex
    };
    const updated = [...cashflows, newCf];
    setCashflows(updated);
    
    // Always save to localStorage immediately so it doesn't get lost on fast reload/refresh
    save('cpms_cashflows', updated);

    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      handleSupabaseWrite(
        () => supabase.from('cashflows').insert([{
          id: newId,
          transaction_date: cashflow.transactionDate,
          transaction_type: cashflow.transactionType,
          category_id: cashflow.categoryId || null,
          subcategory_id: cashflow.subcategoryId || null,
          vendor_id: cashflow.vendorId || null,
          description: cashflow.description,
          amount: cashflow.amount,
          note: cashflow.note,
          row_index: nextRowIndex
        }]),
        {
          table: 'cashflows',
          method: 'insert',
          payload: {
            id: newId,
            transaction_date: cashflow.transactionDate,
            transaction_type: cashflow.transactionType,
            category_id: cashflow.categoryId || null,
            subcategory_id: cashflow.subcategoryId || null,
            vendor_id: cashflow.vendorId || null,
            description: cashflow.description,
            amount: cashflow.amount,
            note: cashflow.note,
            row_index: nextRowIndex
          }
        }
      ).then(() => {
        fetchSupabaseData();
      });
    }
    showToast('success', 'Transaksi cashflow berhasil ditambahkan');
  };

  const addCashflows = async (cashflowList: (Omit<Cashflow, 'id' | 'runningBalance'> & { rowIndex?: number })[]) => {
    const baseRowIndex = cashflows.length > 0 ? Math.max(...cashflows.map(cf => cf.rowIndex || 0)) : 0;
    const newItems = cashflowList.map((cf, index) => {
      const nextIndex = cf.rowIndex !== undefined ? cf.rowIndex : baseRowIndex + index + 1;
      return {
        ...cf,
        id: generateUUID(),
        createdAt: Date.now() + index,
        rowIndex: nextIndex
      };
    });

    console.log("Import rows", newItems);

    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const payloads = newItems.map(cf => ({
        id: cf.id,
        transaction_date: cf.transactionDate,
        transaction_type: cf.transactionType,
        category_id: cf.categoryId || null,
        subcategory_id: cf.subcategoryId || null,
        vendor_id: cf.vendorId || null,
        description: cf.description,
        amount: cf.amount,
        note: cf.note,
        row_index: cf.rowIndex
      }));

      handleSupabaseWrite(
        () => supabase.from('cashflows').insert(payloads),
        {
          table: 'cashflows',
          method: 'insert',
          payload: payloads
        }
      ).then(() => {
        fetchSupabaseData();
        showToast('success', `Berhasil mengimpor ${cashflowList.length} transaksi cashflow ke database`);
      });
    } else {
      const updated = [...cashflows, ...newItems];
      setCashflows(updated);
      save('cpms_cashflows', updated);
      showToast('success', `Berhasil mengimpor ${cashflowList.length} transaksi cashflow`);
    }
  };

  const updateCashflow = (id: string, cashflow: Partial<Cashflow>) => {
    const updated = cashflows.map(c => c.id === id ? { ...c, ...cashflow } : c);
    setCashflows(updated);
    
    // Always save to localStorage immediately so it doesn't get lost on fast reload/refresh
    save('cpms_cashflows', updated);

    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const payload: Record<string, string | number | boolean | null> = {};
      if (cashflow.transactionDate !== undefined) payload.transaction_date = cashflow.transactionDate;
      if (cashflow.transactionType !== undefined) payload.transaction_type = cashflow.transactionType;
      if (cashflow.categoryId !== undefined) payload.category_id = cashflow.categoryId || null;
      if (cashflow.subcategoryId !== undefined) payload.subcategory_id = cashflow.subcategoryId || null;
      if (cashflow.vendorId !== undefined) payload.vendor_id = cashflow.vendorId || null;
      if (cashflow.description !== undefined) payload.description = cashflow.description;
      if (cashflow.amount !== undefined) payload.amount = cashflow.amount;
      if (cashflow.note !== undefined) payload.note = cashflow.note;

      handleSupabaseWrite(
        () => supabase.from('cashflows').update(payload).eq('id', id),
        {
          table: 'cashflows',
          method: 'update',
          payload,
          match: { id }
        }
      );
    }
    showToast('success', 'Transaksi cashflow berhasil diperbarui');
  };

  const deleteCashflow = (id: string) => {
    const updated = cashflows.filter(c => c.id !== id);
    setCashflows(updated);
    
    // Always save to localStorage immediately so it doesn't get lost on fast reload/refresh
    save('cpms_cashflows', updated);

    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      handleSupabaseWrite(
        () => supabase.from('cashflows').delete().eq('id', id),
        {
          table: 'cashflows',
          method: 'delete',
          match: { id }
        }
      );
    }
    showToast('success', 'Transaksi cashflow berhasil dihapus');
  };

  const deleteCashflows = (ids: string[]) => {
    const updated = cashflows.filter(c => !ids.includes(c.id));
    setCashflows(updated);
    
    // Always save to localStorage immediately so it doesn't get lost on fast reload/refresh
    save('cpms_cashflows', updated);

    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      handleSupabaseWrite(
        () => supabase.from('cashflows').delete().in('id', ids),
        {
          table: 'cashflows',
          method: 'delete',
          match: { id: ids }
        }
      );
    }
    showToast('success', `${ids.length} transaksi cashflow berhasil dihapus`);
  };

  // PettyCash
  const addCashflowGreenHouse = (cashflow: Omit<CashflowGreenHouse, 'id' | 'runningBalance'> & { rowIndex?: number }) => {
    const newId = generateUUID();
    const nextRowIndex = cashflow.rowIndex ?? (cashflowGreenHouse.length > 0 ? Math.max(...cashflowGreenHouse.map(item => item.rowIndex || 0)) + 1 : 1);
    const newItem: CashflowGreenHouse = { ...cashflow, id: newId, createdAt: Date.now(), rowIndex: nextRowIndex };
    const updated = [...cashflowGreenHouse, newItem];
    setCashflowGreenHouse(updated);
    save('cpms_cashflow_green_house', updated);
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const payload = { id: newId, transaction_date: cashflow.transactionDate, category_id: cashflow.categoryId || null, description: cashflow.description, debit: cashflow.debit, credit: cashflow.credit, row_index: nextRowIndex };
      handleSupabaseWrite(() => supabase.from('cashflow_green_house').insert([payload]), { table: 'cashflow_green_house', method: 'insert', payload });
    }
    showToast('success', 'Transaksi Cashflow Green House berhasil ditambahkan');
  };

  const addCashflowsGreenHouse = (items: (Omit<CashflowGreenHouse, 'id' | 'runningBalance'> & { rowIndex?: number })[]) => {
    const baseRowIndex = cashflowGreenHouse.length > 0 ? Math.max(...cashflowGreenHouse.map(item => item.rowIndex || 0)) : 0;
    const newItems = items.map((item, index) => ({ ...item, id: generateUUID(), createdAt: Date.now() + index, rowIndex: item.rowIndex ?? baseRowIndex + index + 1 }));
    const updated = [...cashflowGreenHouse, ...newItems];
    setCashflowGreenHouse(updated);
    save('cpms_cashflow_green_house', updated);
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const payloads = newItems.map(item => ({ id: item.id, transaction_date: item.transactionDate, category_id: item.categoryId || null, description: item.description, debit: item.debit, credit: item.credit, row_index: item.rowIndex }));
      handleSupabaseWrite(() => supabase.from('cashflow_green_house').insert(payloads), { table: 'cashflow_green_house', method: 'insert', payload: payloads });
    }
    showToast('success', `Berhasil mengimpor ${items.length} transaksi Cashflow Green House`);
  };

  const updateCashflowGreenHouse = (id: string, changes: Partial<CashflowGreenHouse>) => {
    const updated = cashflowGreenHouse.map(item => item.id === id ? { ...item, ...changes } : item);
    setCashflowGreenHouse(updated);
    save('cpms_cashflow_green_house', updated);
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const payload: Record<string, string | number | null> = {};
      if (changes.transactionDate !== undefined) payload.transaction_date = changes.transactionDate;
      if (changes.categoryId !== undefined) payload.category_id = changes.categoryId || null;
      if (changes.description !== undefined) payload.description = changes.description;
      if (changes.debit !== undefined) payload.debit = changes.debit;
      if (changes.credit !== undefined) payload.credit = changes.credit;
      handleSupabaseWrite(() => supabase.from('cashflow_green_house').update(payload).eq('id', id), { table: 'cashflow_green_house', method: 'update', payload, match: { id } });
    }
    showToast('success', 'Transaksi Cashflow Green House berhasil diperbarui');
  };

  const deleteCashflowGreenHouse = (id: string) => {
    const updated = cashflowGreenHouse.filter(item => item.id !== id);
    setCashflowGreenHouse(updated);
    save('cpms_cashflow_green_house', updated);
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) handleSupabaseWrite(() => supabase.from('cashflow_green_house').delete().eq('id', id), { table: 'cashflow_green_house', method: 'delete', match: { id } });
    showToast('success', 'Transaksi Cashflow Green House berhasil dihapus');
  };

  const deleteCashflowsGreenHouse = (ids: string[]) => {
    const updated = cashflowGreenHouse.filter(item => !ids.includes(item.id));
    setCashflowGreenHouse(updated);
    save('cpms_cashflow_green_house', updated);
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) handleSupabaseWrite(() => supabase.from('cashflow_green_house').delete().in('id', ids), { table: 'cashflow_green_house', method: 'delete', match: { id: ids } });
    showToast('success', `${ids.length} transaksi Cashflow Green House berhasil dihapus`);
  };

  const addCashflowGreenHouseCategory = (category: Omit<CashflowGreenHouseCategory, 'id'>) => {
    const newCategory = { ...category, id: `cfgh_cat_${generateUUID()}` };
    const updated = [...cashflowGreenHouseCategories, newCategory];
    setCashflowGreenHouseCategories(updated);
    save('cpms_cashflow_green_house_categories', updated);
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) handleSupabaseWrite(() => supabase.from('cashflow_green_house_categories').insert([newCategory]), { table: 'cashflow_green_house_categories', method: 'insert', payload: newCategory });
    showToast('success', 'Kategori Cashflow Green House berhasil ditambahkan');
    return newCategory;
  };

  const updateCashflowGreenHouseCategory = (id: string, changes: Partial<CashflowGreenHouseCategory>) => {
    const updated = cashflowGreenHouseCategories.map(category => category.id === id ? { ...category, ...changes } : category);
    setCashflowGreenHouseCategories(updated);
    save('cpms_cashflow_green_house_categories', updated);
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) handleSupabaseWrite(() => supabase.from('cashflow_green_house_categories').update(changes).eq('id', id), { table: 'cashflow_green_house_categories', method: 'update', payload: changes, match: { id } });
  };

  const deleteCashflowGreenHouseCategory = (id: string) => {
    if (cashflowGreenHouse.some(item => item.categoryId === id)) {
      showToast('error', 'Kategori masih digunakan transaksi Cashflow Green House.');
      return false;
    }
    const updated = cashflowGreenHouseCategories.filter(category => category.id !== id);
    setCashflowGreenHouseCategories(updated);
    save('cpms_cashflow_green_house_categories', updated);
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) handleSupabaseWrite(() => supabase.from('cashflow_green_house_categories').delete().eq('id', id), { table: 'cashflow_green_house_categories', method: 'delete', match: { id } });
    showToast('success', 'Kategori Cashflow Green House berhasil dihapus');
    return true;
  };

  const deleteCashflowGreenHouseCategories = (ids: string[]) => {
    const blockedIds = ids.filter(id => cashflowGreenHouse.some(item => item.categoryId === id));
    const blocked = blockedIds.map(id => cashflowGreenHouseCategories.find(category => category.id === id)?.name || id);
    const deleted = ids.filter(id => !blockedIds.includes(id));
    if (deleted.length > 0) {
      const updated = cashflowGreenHouseCategories.filter(category => !deleted.includes(category.id));
      setCashflowGreenHouseCategories(updated);
      save('cpms_cashflow_green_house_categories', updated);
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) handleSupabaseWrite(() => supabase.from('cashflow_green_house_categories').delete().in('id', deleted), { table: 'cashflow_green_house_categories', method: 'delete', match: { id: deleted } });
    }
    return { deleted, blocked };
  };

  const addPettyCash = (pettyCash: Omit<PettyCash, 'id' | 'runningBalance'> & { rowIndex?: number }) => {
    const newId = generateUUID();
    const nextRowIndex = pettyCash.rowIndex !== undefined 
      ? pettyCash.rowIndex 
      : (pettyCashes.length > 0 ? Math.max(...pettyCashes.map(pc => pc.rowIndex || 0)) + 1 : 1);

    const newPc: PettyCash = { 
      ...pettyCash, 
      id: newId,
      createdAt: Date.now(),
      rowIndex: nextRowIndex
    };
    const updated = [...pettyCashes, newPc];
    setPettyCashes(updated);
    save('cpms_petty_cashes', updated);

    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      handleSupabaseWrite(
        () => supabase.from('petty_cashes').insert([{
          id: newId,
          transaction_date: pettyCash.transactionDate,
          transaction_type: pettyCash.transactionType,
          category_id: pettyCash.categoryId || null,
          subcategory_id: pettyCash.subcategoryId || null,
          vendor_id: pettyCash.vendorId || null,
          description: pettyCash.description,
          amount: pettyCash.amount,
          note: pettyCash.note,
          row_index: nextRowIndex
        }]),
        {
          table: 'petty_cashes',
          method: 'insert',
          payload: {
            id: newId,
            transaction_date: pettyCash.transactionDate,
            transaction_type: pettyCash.transactionType,
            category_id: pettyCash.categoryId || null,
            subcategory_id: pettyCash.subcategoryId || null,
            vendor_id: pettyCash.vendorId || null,
            description: pettyCash.description,
            amount: pettyCash.amount,
            note: pettyCash.note,
            row_index: nextRowIndex
          }
        }
      ).then(() => {
        fetchSupabaseData();
      });
    }
    showToast('success', 'Transaksi petty cash berhasil ditambahkan');
  };

  const addPettyCashes = async (pettyCashList: (Omit<PettyCash, 'id' | 'runningBalance'> & { rowIndex?: number })[]) => {
    const baseRowIndex = pettyCashes.length > 0 ? Math.max(...pettyCashes.map(pc => pc.rowIndex || 0)) : 0;
    const newItems = pettyCashList.map((pc, index) => {
      const nextIndex = pc.rowIndex !== undefined ? pc.rowIndex : baseRowIndex + index + 1;
      return {
        ...pc,
        id: generateUUID(),
        createdAt: Date.now() + index,
        rowIndex: nextIndex
      };
    });

    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const payloads = newItems.map(pc => ({
        id: pc.id,
        transaction_date: pc.transactionDate,
        transaction_type: pc.transactionType,
        category_id: pc.categoryId || null,
        subcategory_id: pc.subcategoryId || null,
        vendor_id: pc.vendorId || null,
        description: pc.description,
        amount: pc.amount,
        note: pc.note,
        row_index: pc.rowIndex
      }));

      handleSupabaseWrite(
        () => supabase.from('petty_cashes').insert(payloads),
        {
          table: 'petty_cashes',
          method: 'insert',
          payload: payloads
        }
      ).then(() => {
        fetchSupabaseData();
        showToast('success', `Berhasil mengimpor ${pettyCashList.length} transaksi petty cash ke database`);
      });
    } else {
      const updated = [...pettyCashes, ...newItems];
      setPettyCashes(updated);
      save('cpms_petty_cashes', updated);
      showToast('success', `Berhasil mengimpor ${pettyCashList.length} transaksi petty cash`);
    }
  };

  const updatePettyCash = (id: string, pettyCash: Partial<PettyCash>) => {
    const updated = pettyCashes.map(pc => pc.id === id ? { ...pc, ...pettyCash } : pc);
    setPettyCashes(updated);
    save('cpms_petty_cashes', updated);

    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const payload: Record<string, string | number | boolean | null> = {};
      if (pettyCash.transactionDate !== undefined) payload.transaction_date = pettyCash.transactionDate;
      if (pettyCash.transactionType !== undefined) payload.transaction_type = pettyCash.transactionType;
      if (pettyCash.categoryId !== undefined) payload.category_id = pettyCash.categoryId || null;
      if (pettyCash.subcategoryId !== undefined) payload.subcategory_id = pettyCash.subcategoryId || null;
      if (pettyCash.vendorId !== undefined) payload.vendor_id = pettyCash.vendorId || null;
      if (pettyCash.description !== undefined) payload.description = pettyCash.description;
      if (pettyCash.amount !== undefined) payload.amount = pettyCash.amount;
      if (pettyCash.note !== undefined) payload.note = pettyCash.note;

      handleSupabaseWrite(
        () => supabase.from('petty_cashes').update(payload).eq('id', id),
        {
          table: 'petty_cashes',
          method: 'update',
          payload,
          match: { id }
        }
      );
    }
    showToast('success', 'Transaksi petty cash berhasil diperbarui');
  };

  const deletePettyCash = (id: string) => {
    const updated = pettyCashes.filter(pc => pc.id !== id);
    setPettyCashes(updated);
    save('cpms_petty_cashes', updated);

    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      handleSupabaseWrite(
        () => supabase.from('petty_cashes').delete().eq('id', id),
        {
          table: 'petty_cashes',
          method: 'delete',
          match: { id }
        }
      );
    }
    showToast('success', 'Transaksi petty cash berhasil dihapus');
  };

  const deletePettyCashes = (ids: string[]) => {
    const updated = pettyCashes.filter(pc => !ids.includes(pc.id));
    setPettyCashes(updated);
    save('cpms_petty_cashes', updated);

    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      handleSupabaseWrite(
        () => supabase.from('petty_cashes').delete().in('id', ids),
        {
          table: 'petty_cashes',
          method: 'delete',
          match: { id: ids }
        }
      );
    }
    showToast('success', `${ids.length} transaksi petty cash berhasil dihapus`);
  };

  // Hitung running balance berdasarkan transactionDate ASC, rowIndex ASC, id ASC
  const sortedCashflows = [...cashflows].sort((a, b) => {
    const dateA = new Date(a.transactionDate).getTime();
    const dateB = new Date(b.transactionDate).getTime();
    if (dateA !== dateB) return dateA - dateB;
    const rowA = a.rowIndex || 0;
    const rowB = b.rowIndex || 0;
    if (rowA !== rowB) return rowA - rowB;
    return a.id.localeCompare(b.id);
  });

  let currentBalance = 0;
  const cashflowsWithBalance = sortedCashflows.map(cf => {
    if (cf.transactionType === 'Dana Masuk') {
      currentBalance += cf.amount;
    } else {
      currentBalance -= cf.amount;
    }
    return { ...cf, runningBalance: currentBalance };
  });

  const sortedPettyCashes = [...pettyCashes].sort((a, b) => {
    const dateA = new Date(a.transactionDate).getTime();
    const dateB = new Date(b.transactionDate).getTime();
    if (dateA !== dateB) return dateA - dateB;
    const rowA = a.rowIndex || 0;
    const rowB = b.rowIndex || 0;
    if (rowA !== rowB) return rowA - rowB;
    return a.id.localeCompare(b.id);
  });

  let currentPcBalance = 0;
  const pettyCashesWithBalance = sortedPettyCashes.map(pc => {
    if (pc.transactionType === 'Dana Masuk') {
      currentPcBalance += pc.amount;
    } else {
      currentPcBalance -= pc.amount;
    }
    return { ...pc, runningBalance: currentPcBalance };
  });

  // Urutkan kembali sesuai default (misal terbaru di atas untuk tabel, tapi biarkan array utama ter-update)
  // Untuk cashflows state di UI, kita kirimkan data dengan running balance yang sudah dihitung.
  
  const exportAllData = (): string => {
    const data = {
      vendors,
      categories,
      pettyCashCategories,
      subCategories,
      materials,
      invoices,
      payments,
      cashflows,
      pettyCashes
    };
    return JSON.stringify(data);
  };

  let isImporting = false;
  const importAllData = (jsonData: string): boolean => {
    if (isImporting) return false;
    isImporting = true;
    try {
      const parsed = JSON.parse(jsonData);
      
      // Update client state immediately so user sees the data
      if (parsed.categories) setCategories(parsed.categories);
      if (parsed.pettyCashCategories) setPettyCashCategories(parsed.pettyCashCategories);
      if (parsed.subCategories) setSubCategories(parsed.subCategories);
      if (parsed.vendors) setVendors(parsed.vendors);
      if (parsed.materials) setMaterials(parsed.materials);
      if (parsed.invoices) setInvoices(parsed.invoices);
      if (parsed.payments) setPayments(parsed.payments);
      if (parsed.cashflows) setCashflows(parsed.cashflows);
      if (parsed.pettyCashes) setPettyCashes(parsed.pettyCashes);

      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        // Upload to Supabase in background
        const uploadToSupabase = async () => {
          try {
            // Delete old data from Supabase sequentially to avoid race conditions or double triggers
            await supabase.from('cashflows').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabase.from('petty_cashes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabase.from('invoices').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabase.from('materials').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabase.from('vendors').delete().neq('id', '00000000-0000-0000-0000-000000000000');

            // Generate UUID mapping for non-UUID keys
            const idMap = new Map<string, string>();
            const getOrGenerateUUID = (oldId: string): string => {
              const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(oldId);
              if (isValidUUID) return oldId;
              if (idMap.has(oldId)) return idMap.get(oldId)!;
              const newUUID = generateUUID();
              idMap.set(oldId, newUUID);
              return newUUID;
            };

            if (parsed.categories) {
              const payloads = parsed.categories.map((c: Category) => ({
                id: c.id, // categories/subcategories PK is text, not UUID
                name: c.name,
                icon: c.icon,
                color: c.color,
                active: c.active
              }));
              const { error } = await supabase.from('categories').upsert(payloads);
              if (error) throw new Error(`Categories: ${error.message}`);
            }
            if (parsed.subCategories) {
              const payloads = parsed.subCategories.map((sc: SubCategory) => ({
                id: sc.id,
                category_id: sc.categoryId,
                name: sc.name,
                active: sc.active
              }));
              const { error } = await supabase.from('subcategories').upsert(payloads);
              if (error) throw new Error(`Subcategories: ${error.message}`);
            }
            if (parsed.vendors) {
              const payloads = parsed.vendors.map((v: Vendor) => ({
                id: getOrGenerateUUID(v.id),
                name: v.name,
                address: v.address,
                pic: v.pic,
                phone: v.phone,
                bank: v.bank,
                account_number: v.accountNumber
              }));
              const { error } = await supabase.from('vendors').upsert(payloads);
              if (error) throw new Error(`Vendors: ${error.message}`);
            }
              if (parsed.materials) {
                const payloads = parsed.materials.map((m: Material) => ({
                  id: getOrGenerateUUID(m.id),
                  item_name: m.itemName,
                  unit: m.unit,
                  quantity_requested: m.quantityRequested,
                  request_date: m.requestDate || null,
                  quantity_received: m.quantityReceived,
                  status: m.status,
                  receipts: m.receipts
                }));
              const { error } = await supabase.from('materials').upsert(payloads);
              if (error) throw new Error(`Materials: ${error.message}`);
            }
            if (parsed.invoices) {
              const payloads = parsed.invoices.map((i: Invoice) => ({
                id: getOrGenerateUUID(i.id),
                vendor_id: getOrGenerateUUID(i.vendorId),
                invoice_number: i.invoiceNumber,
                invoice_date: i.invoiceDate,
                description: i.description,
                total_invoice: i.totalInvoice,
                termin: i.termin
              }));
              const { error } = await supabase.from('invoices').upsert(payloads);
              if (error) throw new Error(`Invoices: ${error.message}`);
            }
            if (parsed.payments) {
              const payloads = parsed.payments.map((p: Payment) => ({
                id: getOrGenerateUUID(p.id),
                invoice_id: getOrGenerateUUID(p.invoiceId),
                payment_date: p.paymentDate,
                amount: p.amount,
                payment_note: p.paymentNote
              }));
              const { error } = await supabase.from('payments').upsert(payloads);
              if (error) throw new Error(`Payments: ${error.message}`);
            }
            if (parsed.cashflows) {
              const payloads = parsed.cashflows.map((cf: Cashflow, idx: number) => ({
                id: getOrGenerateUUID(cf.id),
                transaction_date: cf.transactionDate,
                transaction_type: cf.transactionType,
                category_id: cf.categoryId || null,
                subcategory_id: cf.subcategoryId || null,
                vendor_id: cf.vendorId ? getOrGenerateUUID(cf.vendorId) : null,
                description: cf.description,
                amount: cf.amount,
                note: cf.note,
                row_index: cf.rowIndex !== undefined ? cf.rowIndex : idx + 1
              }));
              const { error } = await supabase.from('cashflows').upsert(payloads);
              if (error) throw new Error(`Cashflows: ${error.message}`);
            }
            if (parsed.pettyCashCategories) {
              const payloads = parsed.pettyCashCategories.map((c: PettyCashCategory) => ({
                id: c.id,
                name: c.name,
                icon: c.icon,
                color: c.color,
                active: c.active
              }));
              const { error } = await supabase.from('petty_cash_categories').upsert(payloads);
              if (error) throw new Error(`Petty Cash Categories: ${error.message}`);
            }
            if (parsed.pettyCashes) {
              const payloads = parsed.pettyCashes.map((pc: PettyCash, idx: number) => ({
                id: getOrGenerateUUID(pc.id),
                transaction_date: pc.transactionDate,
                transaction_type: pc.transactionType,
                category_id: pc.categoryId || null,
                subcategory_id: pc.subcategoryId || null,
                vendor_id: pc.vendorId ? getOrGenerateUUID(pc.vendorId) : null,
                description: pc.description,
                amount: pc.amount,
                note: pc.note,
                row_index: pc.rowIndex !== undefined ? pc.rowIndex : idx + 1
              }));
              const { error } = await supabase.from('petty_cashes').upsert(payloads);
              if (error) throw new Error(`Petty Cashes: ${error.message}`);
            }
            showToast('success', 'Semua data berhasil di-upload ke Supabase');
            fetchSupabaseData();
            isImporting = false;
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error("Gagal upload data ke Supabase:", err);
            showToast('error', `Gagal sinkronisasi ke Supabase: ${errorMessage}`);
            isImporting = false;
          }
        };
        uploadToSupabase();
      } else {
        // Local fallback
        if (parsed.vendors) save('cpms_vendors', parsed.vendors);
        if (parsed.categories) save('cpms_categories', parsed.categories);
        if (parsed.subCategories) save('cpms_subcategories', parsed.subCategories);
        if (parsed.materials) save('cpms_materials', parsed.materials);
        if (parsed.invoices) save('cpms_invoices', parsed.invoices);
        if (parsed.payments) save('cpms_payments', parsed.payments);
        if (parsed.cashflows) {
          const cashflowsWithIndex = parsed.cashflows.map((cf: Cashflow, idx: number) => ({
            ...cf,
            rowIndex: cf.rowIndex !== undefined ? cf.rowIndex : idx + 1
          }));
          save('cpms_cashflows', cashflowsWithIndex);
          setCashflows(cashflowsWithIndex);
        }
        if (parsed.pettyCashes) {
          const pettyCashesWithIndex = parsed.pettyCashes.map((pc: PettyCash, idx: number) => ({
            ...pc,
            rowIndex: pc.rowIndex !== undefined ? pc.rowIndex : idx + 1
          }));
          save('cpms_petty_cashes', pettyCashesWithIndex);
          setPettyCashes(pettyCashesWithIndex);
        }
        showToast('success', 'Semua data berhasil di-import ke browser local');
        isImporting = false;
      }
      return true;
    } catch {
      showToast('error', 'Format data tidak valid');
      isImporting = false;
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        vendors,
        categories,
        pettyCashCategories,
        subCategories,
        materials,
        invoices,
        payments,
        cashflows: cashflowsWithBalance,
        pettyCashes: pettyCashesWithBalance,
        toasts,
        showToast,
        removeToast,
        openMaterialModal,
        setOpenMaterialModal,
        openInvoiceModal,
        setOpenInvoiceModal,
        openCashflowModal,
        setOpenCashflowModal,
        addVendor,
        updateVendor,
        deleteVendor,
        addCategory,
        updateCategory,
        deleteCategory,
        deleteCategories,
        addPettyCashCategory,
        updatePettyCashCategory,
        deletePettyCashCategory,
        deletePettyCashCategories,
        addSubCategory,
        updateSubCategory,
        deleteSubCategory,
        addMaterial,
        updateMaterial,
        deleteMaterial,
        deleteMaterials,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        deleteInvoices,
        addPayment,
        updatePayment,
        deletePayment,
        addCashflow,
        addCashflows,
        updateCashflow,
        deleteCashflow,
        deleteCashflows,
        cashflowGreenHouse,
        cashflowGreenHouseCategories,
        addCashflowGreenHouse,
        addCashflowsGreenHouse,
        updateCashflowGreenHouse,
        deleteCashflowGreenHouse,
        deleteCashflowsGreenHouse,
        addCashflowGreenHouseCategory,
        updateCashflowGreenHouseCategory,
        deleteCashflowGreenHouseCategory,
        deleteCashflowGreenHouseCategories,
        addPettyCash,
        addPettyCashes,
        updatePettyCash,
        deletePettyCash,
        deletePettyCashes,
        itemsPerPage,
        setItemsPerPage,
        isAuthenticated,
        login,
        logout,
        updateAccount,
        currentUser,
        isDataLoading,
        dataLoadError,
        retryDataLoad,
        exportAllData,
        importAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};