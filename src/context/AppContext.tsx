'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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

export interface SubCategory {
  id: string;
  categoryId: string;
  name: string;
  active: boolean;
}

export interface Material {
  id: string;
  itemName: string;
  unit: string;
  quantityRequested: number;
  quantityReceived: number;
  receiveDate: string;
  status: 'Complete' | 'Partial' | 'Waiting';
  verification: boolean; // true = Sesuai, false = Tidak Sesuai
  note: string;
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
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface AppContextType {
  vendors: Vendor[];
  categories: Category[];
  subCategories: SubCategory[];
  materials: Material[];
  invoices: Invoice[];
  payments: Payment[];
  cashflows: Cashflow[];
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

  // SubCategory actions
  addSubCategory: (sub: Omit<SubCategory, 'id'>) => SubCategory;
  updateSubCategory: (id: string, sub: Partial<SubCategory>) => void;
  deleteSubCategory: (id: string) => void;

  // Material actions
  addMaterial: (material: Omit<Material, 'id' | 'status'>) => void;
  updateMaterial: (id: string, material: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;

  // Invoice & Payment actions
  addInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePayment: (id: string, payment: Partial<Payment>) => void;
  deletePayment: (id: string) => void;

  // Cashflow actions
  addCashflow: (cashflow: Omit<Cashflow, 'id' | 'runningBalance'>) => void;
  addCashflows: (cashflowList: Omit<Cashflow, 'id' | 'runningBalance'>[]) => void;
  updateCashflow: (id: string, cashflow: Partial<Cashflow>) => void;
  deleteCashflow: (id: string) => void;

  // Global Items Per Page
  itemsPerPage: number;
  setItemsPerPage: (val: number) => void;

  // Authentication State
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateAccount: (username: string, password?: string) => void;
  currentUser: { username: string };
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
  { id: 'm1', itemName: 'Semen Portland (50kg)', unit: 'Zak', quantityRequested: 100, quantityReceived: 100, receiveDate: '2026-07-15', status: 'Complete', verification: true, note: '' },
  { id: 'm2', itemName: 'Besi Beton 12mm', unit: 'Batang', quantityRequested: 50, quantityReceived: 30, receiveDate: '2026-07-18', status: 'Partial', verification: true, note: '' },
  { id: 'm3', itemName: 'Pasir Beton', unit: 'M3', quantityRequested: 10, quantityReceived: 0, receiveDate: '', status: 'Waiting', verification: false, note: '' },
  { id: 'm4', itemName: 'Batu Split 2/3', unit: 'M3', quantityRequested: 15, quantityReceived: 10, receiveDate: '2026-07-20', status: 'Partial', verification: false, note: 'Batu split agak kotor dan basah' }
];

const initialInvoices: Invoice[] = [
  { id: 'inv1', vendorId: 'v1', invoiceNumber: 'INV/2026/001', invoiceDate: '2026-07-10', description: 'Pembelian Semen Portland 100 zak', totalInvoice: 7500000, termin: 1 },
  { id: 'inv2', vendorId: 'v2', invoiceNumber: 'INV/2026/045', invoiceDate: '2026-07-12', description: 'Pembelian Besi Beton 12mm 50 batang', totalInvoice: 9500000, termin: 2 }
];

const initialPayments: Payment[] = [
  { id: 'p1', invoiceId: 'inv1', paymentDate: '2026-07-11', amount: 7500000, paymentNote: 'Lunas Termur' },
  { id: 'p2', invoiceId: 'inv2', paymentDate: '2026-07-13', amount: 4500000, paymentNote: 'DP 50% kurang 5 juta' }
];

const initialCashflows: Cashflow[] = [
  { id: 'cf1', transactionDate: '2026-07-01', transactionType: 'Dana Masuk', description: 'Modal Awal dari Owner', amount: 100000000, note: 'Transfer bank Mandiri' },
  { id: 'cf2', transactionDate: '2026-07-11', transactionType: 'Pengeluaran', categoryId: 'c1', subcategoryId: 'sc1', vendorId: 'v1', description: 'Pembayaran INV/2026/001 - Semen Portland', amount: 7500000, note: 'Transfer BCA' },
  { id: 'cf3', transactionDate: '2026-07-13', transactionType: 'Pengeluaran', categoryId: 'c1', subcategoryId: 'sc2', vendorId: 'v2', description: 'Pembayaran DP INV/2026/045 - Besi Beton', amount: 4500000, note: 'Transfer Mandiri' },
  { id: 'cf4', transactionDate: '2026-07-14', transactionType: 'Pengeluaran', categoryId: 'c4', description: 'Biaya Admin Bank Transfer', amount: 6500, note: 'Biaya admin' }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [cashflows, setCashflows] = useState<Cashflow[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const [itemsPerPage, setItemsPerPageState] = useState<number>(5);

  const [openMaterialModal, setOpenMaterialModal] = useState<boolean>(false);
  const [openInvoiceModal, setOpenInvoiceModal] = useState<boolean>(false);
  const [openCashflowModal, setOpenCashflowModal] = useState<boolean>(false);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ username: string }>({ username: 'admin' });

  // Load from LocalStorage
  useEffect(() => {
    const authStatus = localStorage.getItem('cpms_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    const localUsername = localStorage.getItem('cpms_user_username') || 'admin';
    setCurrentUser({ username: localUsername });

    const localVendors = localStorage.getItem('cpms_vendors');
    const localCategories = localStorage.getItem('cpms_categories');
    const localSubCategories = localStorage.getItem('cpms_subcategories');
    const localMaterials = localStorage.getItem('cpms_materials');
    const localInvoices = localStorage.getItem('cpms_invoices');
    const localPayments = localStorage.getItem('cpms_payments');
    const localCashflows = localStorage.getItem('cpms_cashflows');
    const localItemsPerPage = localStorage.getItem('cpms_items_per_page');

    if (localVendors) setVendors(JSON.parse(localVendors));
    else setVendors(initialVendors);

    if (localCategories) setCategories(JSON.parse(localCategories));
    else setCategories(initialCategories);

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

    if (localItemsPerPage) setItemsPerPageState(Number(localItemsPerPage));
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
    if (password) {
      localStorage.setItem('cpms_user_password', password);
    }
    showToast('success', 'Akun berhasil diperbarui');
  };

  // Save to LocalStorage helper
  const save = (key: string, data: unknown) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Vendor actions
  const addVendor = (vendor: Omit<Vendor, 'id'>): Vendor => {
    const newVendor = { ...vendor, id: 'v_' + crypto.randomUUID() };
    const updated = [...vendors, newVendor];
    setVendors(updated);
    save('cpms_vendors', updated);
    showToast('success', 'Vendor berhasil ditambahkan');
    return newVendor;
  };

  const updateVendor = (id: string, vendor: Partial<Vendor>) => {
    const updated = vendors.map(v => v.id === id ? { ...v, ...vendor } : v);
    setVendors(updated);
    save('cpms_vendors', updated);
    showToast('success', 'Vendor berhasil diperbarui');
  };

  const deleteVendor = (id: string): boolean => {
    // Business Rule 1 & check invoices/cashflows
    const inUseInvoices = invoices.some(i => i.vendorId === id);
    const inUseCashflows = cashflows.some(c => c.vendorId === id);
    if (inUseInvoices || inUseCashflows) {
      showToast('error', 'Gagal menghapus! Vendor ini masih terikat dengan data Invoice atau transaksi Cashflow.');
      return false; // Gagal hapus karena terpakai
    }
    const updated = vendors.filter(v => v.id !== id);
    setVendors(updated);
    save('cpms_vendors', updated);
    showToast('success', 'Vendor berhasil dihapus');
    return true;
  };

  // Category actions
  const addCategory = (category: Omit<Category, 'id'>): Category => {
    const newCategory = { ...category, id: 'c_' + crypto.randomUUID() };
    const updated = [...categories, newCategory];
    setCategories(updated);
    save('cpms_categories', updated);
    showToast('success', 'Kategori berhasil ditambahkan');
    return newCategory;
  };

  const updateCategory = (id: string, category: Partial<Category>) => {
    const updated = categories.map(c => c.id === id ? { ...c, ...category } : c);
    setCategories(updated);
    save('cpms_categories', updated);
    showToast('success', 'Kategori berhasil diperbarui');
  };

  const deleteCategory = (id: string): boolean => {
    // Business Rule 1
    const inUse = cashflows.some(c => c.categoryId === id);
    if (inUse) {
      showToast('error', 'Gagal menghapus! Kategori ini sedang digunakan dalam transaksi Cashflow.');
      return false;
    }
    const updated = categories.filter(c => c.id !== id);
    const updatedSub = subCategories.filter(sc => sc.categoryId !== id);
    setCategories(updated);
    setSubCategories(updatedSub);
    save('cpms_categories', updated);
    save('cpms_subcategories', updatedSub);
    showToast('success', 'Kategori berhasil dihapus');
    return true;
  };

  // SubCategory actions
  const addSubCategory = (sub: Omit<SubCategory, 'id'>): SubCategory => {
    const newSub = { ...sub, id: 'sc_' + crypto.randomUUID() };
    const updated = [...subCategories, newSub];
    setSubCategories(updated);
    save('cpms_subcategories', updated);
    showToast('success', 'Sub-kategori berhasil ditambahkan');
    return newSub;
  };

  const updateSubCategory = (id: string, sub: Partial<SubCategory>) => {
    const updated = subCategories.map(s => s.id === id ? { ...s, ...sub } : s);
    setSubCategories(updated);
    save('cpms_subcategories', updated);
    showToast('success', 'Sub-kategori berhasil diperbarui');
  };

  const deleteSubCategory = (id: string) => {
    const updated = subCategories.filter(s => s.id !== id);
    setSubCategories(updated);
    save('cpms_subcategories', updated);
    showToast('success', 'Sub-kategori berhasil dihapus');
  };

  // Material actions
  const addMaterial = (material: Omit<Material, 'id' | 'status'>) => {
    let status: 'Complete' | 'Partial' | 'Waiting' = 'Waiting';
    if (material.quantityReceived === material.quantityRequested) {
      status = 'Complete';
    } else if (material.quantityReceived > 0 && material.quantityReceived < material.quantityRequested) {
      status = 'Partial';
    }
    const newMat = { ...material, id: 'm_' + crypto.randomUUID(), status };
    const updated = [...materials, newMat];
    setMaterials(updated);
    save('cpms_materials', updated);
    showToast('success', 'Material berhasil ditambahkan');
  };

  const updateMaterial = (id: string, material: Partial<Material>) => {
    const updated = materials.map(m => {
      if (m.id === id) {
        const merged = { ...m, ...material };
        let status: 'Complete' | 'Partial' | 'Waiting' = 'Waiting';
        if (merged.quantityReceived >= merged.quantityRequested) {
          status = 'Complete';
        } else if (merged.quantityReceived > 0 && merged.quantityReceived < merged.quantityRequested) {
          status = 'Partial';
        }
        return { ...merged, status };
      }
      return m;
    });
    setMaterials(updated);
    save('cpms_materials', updated);
    showToast('success', 'Material berhasil diperbarui');
  };

  const deleteMaterial = (id: string) => {
    const updated = materials.filter(m => m.id !== id);
    setMaterials(updated);
    save('cpms_materials', updated);
    showToast('success', 'Material berhasil dihapus');
  };

  // Invoice & Payments
  const addInvoice = (invoice: Omit<Invoice, 'id'>) => {
    const newInv = { 
      ...invoice, 
      id: 'inv_' + crypto.randomUUID(),
      createdAt: Date.now()
    };
    const updated = [...invoices, newInv];
    setInvoices(updated);
    save('cpms_invoices', updated);
    showToast('success', 'Invoice berhasil ditambahkan');
  };

  const updateInvoice = (id: string, invoice: Partial<Invoice>) => {
    const updated = invoices.map(i => i.id === id ? { ...i, ...invoice } : i);
    setInvoices(updated);
    save('cpms_invoices', updated);
    showToast('success', 'Invoice berhasil diperbarui');
  };

  const deleteInvoice = (id: string) => {
    const updatedInvoices = invoices.filter(i => i.id !== id);
    const updatedPayments = payments.filter(p => p.invoiceId !== id);
    setInvoices(updatedInvoices);
    setPayments(updatedPayments);
    save('cpms_invoices', updatedInvoices);
    save('cpms_payments', updatedPayments);
    showToast('success', 'Invoice berhasil dihapus');
  };

  const addPayment = (payment: Omit<Payment, 'id'>) => {
    const newPayment = { ...payment, id: 'p_' + crypto.randomUUID() };
    const updated = [...payments, newPayment];
    setPayments(updated);
    save('cpms_payments', updated);
    showToast('success', 'Pembayaran berhasil ditambahkan');
  };

  const updatePayment = (id: string, payment: Partial<Payment>) => {
    const updated = payments.map(p => p.id === id ? { ...p, ...payment } : p);
    setPayments(updated);
    save('cpms_payments', updated);
    showToast('success', 'Pembayaran berhasil diperbarui');
  };

  const deletePayment = (id: string) => {
    const updated = payments.filter(p => p.id !== id);
    setPayments(updated);
    save('cpms_payments', updated);
    showToast('success', 'Pembayaran berhasil dihapus');
  };

  // Cashflow
  const addCashflow = (cashflow: Omit<Cashflow, 'id' | 'runningBalance'>) => {
    const newCf = { 
      ...cashflow, 
      id: 'cf_' + crypto.randomUUID(),
      createdAt: Date.now()
    };
    const updated = [...cashflows, newCf];
    setCashflows(updated);
    save('cpms_cashflows', updated);
    showToast('success', 'Transaksi cashflow berhasil ditambahkan');
  };

  const addCashflows = (cashflowList: Omit<Cashflow, 'id' | 'runningBalance'>[]) => {
    const newItems = cashflowList.map((cf, index) => ({
      ...cf,
      id: 'cf_' + crypto.randomUUID() + '_' + index,
      createdAt: Date.now() + index
    }));
    const updated = [...cashflows, ...newItems];
    setCashflows(updated);
    save('cpms_cashflows', updated);
    showToast('success', `Berhasil mengimpor ${cashflowList.length} transaksi cashflow`);
  };

  const updateCashflow = (id: string, cashflow: Partial<Cashflow>) => {
    const updated = cashflows.map(c => c.id === id ? { ...c, ...cashflow } : c);
    setCashflows(updated);
    save('cpms_cashflows', updated);
    showToast('success', 'Transaksi cashflow berhasil diperbarui');
  };

  const deleteCashflow = (id: string) => {
    const updated = cashflows.filter(c => c.id !== id);
    setCashflows(updated);
    save('cpms_cashflows', updated);
    showToast('success', 'Transaksi cashflow berhasil dihapus');
  };

  // Hitung running balance secara berurutan berdasarkan tanggal transaksi dan waktu pembuatan (createdAt) agar saldo terakumulasi dengan benar saat tanggal loncat
  const sortedCashflows = [...cashflows].sort((a, b) => {
    const dateA = new Date(a.transactionDate).getTime();
    const dateB = new Date(b.transactionDate).getTime();
    if (dateA !== dateB) return dateA - dateB;

    const timeA = a.createdAt || 0;
    const timeB = b.createdAt || 0;
    if (timeA !== timeB) return timeA - timeB;
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

  // Urutkan kembali sesuai default (misal terbaru di atas untuk tabel, tapi biarkan array utama ter-update)
  // Untuk cashflows state di UI, kita kirimkan data dengan running balance yang sudah dihitung.
  
  const exportAllData = (): string => {
    const data = {
      vendors,
      categories,
      subCategories,
      materials,
      invoices,
      payments,
      cashflows
    };
    return JSON.stringify(data);
  };

  const importAllData = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.vendors) {
        setVendors(parsed.vendors);
        save('cpms_vendors', parsed.vendors);
      }
      if (parsed.categories) {
        setCategories(parsed.categories);
        save('cpms_categories', parsed.categories);
      }
      if (parsed.subCategories) {
        setSubCategories(parsed.subCategories);
        save('cpms_subcategories', parsed.subCategories);
      }
      if (parsed.materials) {
        setMaterials(parsed.materials);
        save('cpms_materials', parsed.materials);
      }
      if (parsed.invoices) {
        setInvoices(parsed.invoices);
        save('cpms_invoices', parsed.invoices);
      }
      if (parsed.payments) {
        setPayments(parsed.payments);
        save('cpms_payments', parsed.payments);
      }
      if (parsed.cashflows) {
        setCashflows(parsed.cashflows);
        save('cpms_cashflows', parsed.cashflows);
      }
      showToast('success', 'Semua data berhasil di-import');
      return true;
    } catch {
      showToast('error', 'Format data tidak valid');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        vendors,
        categories,
        subCategories,
        materials,
        invoices,
        payments,
        cashflows: cashflowsWithBalance,
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
        addSubCategory,
        updateSubCategory,
        deleteSubCategory,
        addMaterial,
        updateMaterial,
        deleteMaterial,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        addPayment,
        updatePayment,
        deletePayment,
        addCashflow,
        addCashflows,
        updateCashflow,
        deleteCashflow,
        itemsPerPage,
        setItemsPerPage,
        isAuthenticated,
        login,
        logout,
        updateAccount,
        currentUser,
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