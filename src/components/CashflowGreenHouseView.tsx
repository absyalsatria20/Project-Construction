'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle, ArrowUpDown, Check, Edit2, FileSpreadsheet, FileText, Plus,
  Search, Trash2, TrendingDown, TrendingUp, Upload, Wallet, X
} from 'lucide-react';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useApp, CashflowGreenHouse, CashflowGreenHouseCategory } from '@/context/AppContext';
import { ConfirmDialog } from './ConfirmDialog';
import { Pagination } from './Pagination';

type TransactionType = 'Dana Masuk' | 'Pengeluaran';

export const CashflowGreenHouseView: React.FC = () => {
  const {
    cashflowGreenHouse, cashflowGreenHouseCategories,
    addCashflowGreenHouse, addCashflowsGreenHouse, updateCashflowGreenHouse,
    deleteCashflowGreenHouse, deleteCashflowsGreenHouse,
    addCashflowGreenHouseCategory, updateCashflowGreenHouseCategory,
    deleteCashflowGreenHouseCategory, deleteCashflowGreenHouseCategories, itemsPerPage, setItemsPerPage
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilterStart, setDateFilterStart] = useState('');
  const [dateFilterEnd, setDateFilterEnd] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | ''>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedRow, setSelectedRow] = useState<CashflowGreenHouse | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [isBulkCategoryMode, setIsBulkCategoryMode] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [dialog, setDialog] = useState<{ title: string; message: string; onConfirm?: () => void } | null>(null);

  const [transactionDate, setTransactionDate] = useState('');
  const [transactionType, setTransactionType] = useState<TransactionType>('Pengeluaran');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [displayAmount, setDisplayAmount] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('cashflow_green_house_sort_order');
    if (saved === 'asc' || saved === 'desc') setSortDirection(saved);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isModalOpen]);

  const formatRupiah = (value: number) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(value);

  const formatRupiahInput = (value: number) => value ? new Intl.NumberFormat('id-ID').format(value) : '';

  const resetForm = () => {
    setTransactionDate(new Date().toISOString().split('T')[0]);
    setTransactionType('Pengeluaran');
    setCategoryId(cashflowGreenHouseCategories[0]?.id || '');
    setDescription(''); setAmount(0); setDisplayAmount(''); setFormError(''); setIsAddingCategory(false); setNewCategoryName('');
  };

  const openAdd = () => { resetForm(); setModalMode('add'); setSelectedRow(null); setIsModalOpen(true); };

  const openEdit = (row: CashflowGreenHouse) => {
    const type: TransactionType = row.debit > 0 ? 'Dana Masuk' : 'Pengeluaran';
    const value = row.debit || row.credit;
    setSelectedRow(row); setModalMode('edit'); setTransactionDate(row.transactionDate);
    setTransactionType(type); setCategoryId(row.categoryId || ''); setDescription(row.description);
    setAmount(value); setDisplayAmount(formatRupiahInput(value)); setFormError(''); setIsModalOpen(true);
  };

  // Satu urutan canonical untuk hitung saldo: tanggal, urutan input, lalu ID.
  // Saldo dihitung sebelum sort tampilan agar tetap melekat pada transaksi yang benar.
  const compareRowsByLedgerOrder = (a: CashflowGreenHouse, b: CashflowGreenHouse) => {
    const dateResult = a.transactionDate.localeCompare(b.transactionDate);
    if (dateResult !== 0) return dateResult;
    const rowIndexResult = (a.rowIndex || 0) - (b.rowIndex || 0);
    return rowIndexResult !== 0 ? rowIndexResult : a.id.localeCompare(b.id);
  };

  const sortedRows = useMemo(
    () => [...cashflowGreenHouse].sort(compareRowsByLedgerOrder),
    [cashflowGreenHouse]
  );

  const rowsWithBalance = useMemo(() => {
    let balance = 0;
    return sortedRows.map(row => {
      balance += row.debit - row.credit;
      return { ...row, runningBalance: balance };
    });
  }, [sortedRows]);

  const processedRows = useMemo(() => rowsWithBalance.filter(row => {
    const categoryName = cashflowGreenHouseCategories.find(c => c.id === row.categoryId)?.name || '';
    const text = `${row.description} ${categoryName}`.toLowerCase();
    const rowType: TransactionType = row.debit > 0 ? 'Dana Masuk' : 'Pengeluaran';
    return (!searchTerm || text.includes(searchTerm.toLowerCase())) &&
      (!typeFilter || rowType === typeFilter) &&
      (!categoryFilter || row.categoryId === categoryFilter) &&
      (!dateFilterStart || row.transactionDate >= dateFilterStart) &&
      (!dateFilterEnd || row.transactionDate <= dateFilterEnd);
  }).sort((a, b) => {
    const result = compareRowsByLedgerOrder(a, b);
    return sortDirection === 'asc' ? result : -result;
  }), [rowsWithBalance, searchTerm, typeFilter, categoryFilter, dateFilterStart, dateFilterEnd, sortDirection, cashflowGreenHouseCategories]);

  const totalPages = Math.max(1, Math.ceil(processedRows.length / itemsPerPage));
  const paginatedRows = processedRows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totals = useMemo(() => cashflowGreenHouse.reduce((result, row) => ({
    debit: result.debit + row.debit, credit: result.credit + row.credit
  }), { debit: 0, credit: 0 }), [cashflowGreenHouse]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!transactionDate) return setFormError('Tanggal transaksi wajib diisi.');
    if (amount <= 0) return setFormError('Nominal harus lebih besar dari 0.');
    if (!description.trim()) return setFormError('Keterangan wajib diisi.');
    if (transactionType === 'Pengeluaran' && !categoryId) return setFormError('Kategori wajib dipilih.');

    const data = {
      transactionDate, categoryId: transactionType === 'Pengeluaran' ? (categoryId || undefined) : undefined,
      description: description.trim(), debit: transactionType === 'Dana Masuk' ? amount : 0,
      credit: transactionType === 'Pengeluaran' ? amount : 0
    };
    if (modalMode === 'edit' && selectedRow) updateCashflowGreenHouse(selectedRow.id, data);
    else addCashflowGreenHouse(data);
    setIsModalOpen(false); resetForm();
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => setDialog({ title, message, onConfirm });
  const confirmDelete = (id: string) => showConfirm('Hapus Transaksi', 'Apakah Anda yakin ingin menghapus transaksi ini?', () => {
    deleteCashflowGreenHouse(id); setDialog(null);
  });
  const confirmDeleteCategories = (ids: string[]) => showConfirm('Hapus Kategori', `Hapus ${ids.length} kategori terpilih?`, () => {
    const result = deleteCashflowGreenHouseCategories(ids);
    setSelectedCategoryIds([]);
    setIsBulkCategoryMode(false);
    setDialog(result.blocked.length ? { title: 'Gagal Menghapus', message: `Kategori masih digunakan transaksi: ${result.blocked.join(', ')}` } : null);
  });
  const confirmDeleteCategory = (id: string) => showConfirm('Hapus Kategori', 'Apakah Anda yakin ingin menghapus kategori ini?', () => {
    const deleted = deleteCashflowGreenHouseCategory(id);
    setDialog(deleted ? null : { title: 'Gagal Menghapus', message: 'Kategori masih digunakan transaksi Cashflow Green House.' });
  });

  const exportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Laporan Cashflow Green House');
    sheet.addRow(['LAPORAN CASHFLOW GREEN HOUSE']);
    sheet.addRow([`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`]);
    sheet.addRow([]);
    sheet.addRow(['No', 'Tanggal', 'Jenis', 'Kategori', 'Keterangan', 'Debit', 'Kredit', 'Saldo Berjalan']);
    processedRows.forEach((row, index) => sheet.addRow([
      index + 1, new Date(row.transactionDate).toLocaleDateString('id-ID'), row.debit > 0 ? 'Dana Masuk' : 'Pengeluaran',
      cashflowGreenHouseCategories.find(c => c.id === row.categoryId)?.name || '-', row.description,
      row.debit || '-', row.credit || '-', row.runningBalance || 0
    ]));
    sheet.getRow(1).font = { bold: true, size: 16 };
    sheet.getRow(4).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } };
    [8, 14, 18, 24, 36, 18, 18, 20].forEach((width, index) => { sheet.getColumn(index + 1).width = width; });
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), 'Laporan_Cashflow_Green_House.xlsx');
  };

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', format: 'a4', unit: 'mm' });
    doc.setFontSize(16); doc.text('LAPORAN CASHFLOW GREEN HOUSE', 10, 15);
    doc.setFontSize(10); doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 10, 21);
    autoTable(doc, {
      head: [['No', 'Tanggal', 'Jenis', 'Kategori', 'Keterangan', 'Debit', 'Kredit', 'Saldo Berjalan']],
      body: processedRows.map((row, index) => [index + 1, new Date(row.transactionDate).toLocaleDateString('id-ID'), row.debit > 0 ? 'Dana Masuk' : 'Pengeluaran', cashflowGreenHouseCategories.find(c => c.id === row.categoryId)?.name || '-', row.description, row.debit ? formatRupiah(row.debit) : '-', row.credit ? formatRupiah(row.credit) : '-', formatRupiah(row.runningBalance || 0)]),
      startY: 26, theme: 'striped', headStyles: { fillColor: [59, 130, 246], fontSize: 8 }, styles: { fontSize: 7.5 }
    });
    doc.save('Laporan_Cashflow_Green_House.pdf');
  };

  const exportCategoryExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Rekap Pengeluaran');
    sheet.addRow(['REKAP PENGELUARAN GREEN HOUSE']);
    sheet.addRow([`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`]);
    sheet.addRow([]);
    sheet.addRow(['Kategori', 'Total Pengeluaran']);
    cashflowGreenHouseCategories.forEach(category => {
      sheet.addRow([category.name, cashflowGreenHouse.filter(row => row.categoryId === category.id).reduce((sum, row) => sum + row.credit, 0)]);
    });
    sheet.addRow(['Grand Total', totals.credit]);
    sheet.getRow(1).font = { bold: true, size: 16 };
    sheet.getRow(4).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } };
    sheet.getColumn(1).width = 32;
    sheet.getColumn(2).width = 22;
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), 'Rekap_Pengeluaran_Green_House.xlsx');
  };

  const exportCategoryPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', format: 'a4', unit: 'mm' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('REKAP PENGELUARAN GREEN HOUSE', 14, 16);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);
    autoTable(doc, {
      head: [['Kategori', 'Total Pengeluaran']],
      body: cashflowGreenHouseCategories.map(category => [category.name, formatRupiah(cashflowGreenHouse.filter(row => row.categoryId === category.id).reduce((sum, row) => sum + row.credit, 0))]),
      foot: [['Grand Total', formatRupiah(totals.credit)]],
      startY: 28,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' }
    });
    doc.save('Rekap_Pengeluaran_Green_House.pdf');
  };

  const handleImportExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const workbook = XLSX.read(reader.result, { type: 'array' });
        const rows = XLSX.utils.sheet_to_json<Record<string, string | number>>(workbook.Sheets[workbook.SheetNames[0]]);
        const get = (row: Record<string, string | number>, name: string) => {
          const key = Object.keys(row).find(k => k.trim().toLowerCase() === name.toLowerCase());
          return key ? row[key] : undefined;
        };
        const categoryCache = new Map(cashflowGreenHouseCategories.map(c => [c.name.trim().toLowerCase(), c.id]));
        const imported: Array<Omit<CashflowGreenHouse, 'id' | 'runningBalance'>> = [];
        let errors = 0;
        rows.forEach((row, index) => {
          const rawDate = get(row, 'Tanggal'); const rawType = String(get(row, 'Jenis') || '').toLowerCase();
          const desc = String(get(row, 'Keterangan') || '').trim(); const rawAmount = get(row, 'Nominal');
          let date = '';
          if (typeof rawDate === 'number') date = new Date((rawDate - 25569) * 86400 * 1000).toISOString().split('T')[0];
          else if (rawDate) { const parsed = new Date(String(rawDate)); if (!isNaN(parsed.getTime())) date = parsed.toISOString().split('T')[0]; }
          const amountValue = typeof rawAmount === 'number' ? rawAmount : Number(String(rawAmount || '').replace(/Rp|\s|\./gi, '').replace(',', '.'));
          if (!date || !desc || !amountValue || amountValue <= 0 || (!rawType.includes('masuk') && !rawType.includes('keluar') && !rawType.includes('pengeluaran') && !rawType.includes('debit') && !rawType.includes('kredit'))) { errors++; return; }
          const isIncome = rawType.includes('masuk') || rawType.includes('debit') || rawType.includes('income');
          const rawCategory = String(get(row, 'Kategori') || '').trim();
          let catId = '';
          if (!isIncome && rawCategory && rawCategory !== '-') {
            catId = categoryCache.get(rawCategory.toLowerCase()) || '';
            if (!catId) { const category = addCashflowGreenHouseCategory({ name: rawCategory, icon: 'Tag', color: '#3b82f6', active: true }); catId = category.id; categoryCache.set(rawCategory.toLowerCase(), catId); }
          }
          imported.push({ transactionDate: date, categoryId: catId || undefined, description: desc, debit: isIncome ? amountValue : 0, credit: isIncome ? 0 : amountValue, rowIndex: index + 1 });
        });
        if (imported.length) addCashflowsGreenHouse(imported);
        setDialog({ title: 'Import Selesai', message: `Berhasil mengimport ${imported.length} data. ${errors ? `${errors} baris diabaikan karena tidak valid.` : ''}` });
      } catch { setDialog({ title: 'Import Gagal', message: 'Gagal membaca file Excel. Pastikan format file benar.' }); }
      event.target.value = '';
    };
    reader.readAsArrayBuffer(file);
  };

  const clearFilters = () => { setSearchTerm(''); setTypeFilter(''); setCategoryFilter(''); setDateFilterStart(''); setDateFilterEnd(''); setCurrentPage(1); };
  const hasFilters = Boolean(searchTerm || typeFilter || categoryFilter || dateFilterStart || dateFilterEnd);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard label="Total Dana Masuk" value={formatRupiah(totals.debit)} color="green" icon={<TrendingUp className="w-5 h-5" />} />
        <SummaryCard label="Total Pengeluaran" value={formatRupiah(totals.credit)} color="red" icon={<TrendingDown className="w-5 h-5" />} />
        <SummaryCard label="Saldo Green House" value={formatRupiah(totals.debit - totals.credit)} color="blue" icon={<Wallet className="w-5 h-5" />} />
      </div>

      <div className="space-y-6">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative w-full lg:max-w-xs"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><input type="text" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} placeholder="Cari deskripsi transaksi..." className="w-full pl-10 pr-4 h-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 transition-all" /></div>
            <div className="flex flex-wrap items-center gap-3.5">
              <input type="file" id="import-excel-green-house" accept=".xlsx, .xls" className="hidden" onChange={handleImportExcel} />
              <button type="button" onClick={exportExcel} className="inline-flex items-center justify-center h-10 px-4 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 text-sm font-semibold transition-all gap-2" title="Export Excel">
                <FileSpreadsheet className="w-4 h-4 text-green-600" /><span>Excel</span>
              </button>
              <button type="button" onClick={exportPDF} className="inline-flex items-center justify-center h-10 px-4 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 text-sm font-semibold transition-all gap-2" title="Export PDF">
                <FileText className="w-4 h-4 text-red-500" /><span>PDF</span>
              </button>
              <button type="button" onClick={() => document.getElementById('import-excel-green-house')?.click()} className="inline-flex items-center justify-center h-10 px-4 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 text-sm font-semibold transition-all gap-2" title="Import Excel">
                <Upload className="w-4 h-4 text-blue-600" /><span>Import</span>
              </button>
              <a href="/template-import-cashflow.xlsx" download className="inline-flex items-center justify-center h-10 px-4 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-500 hover:text-slate-700 text-sm font-semibold transition-all" title="Unduh Template Excel">Unduh Template</a>
              <button type="button" onClick={openAdd} className="inline-flex items-center justify-center h-10 px-5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all gap-2 shadow-sm"><Plus className="w-4 h-4" />Input Transaksi</button>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-4 pt-4 border-t border-slate-100">
            <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value as TransactionType | ''); setCurrentPage(1); }} className="w-full md:w-48 h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-700 font-medium cursor-pointer transition-all"><option value="">Semua Jenis</option><option value="Dana Masuk">Dana Masuk</option><option value="Pengeluaran">Pengeluaran</option></select>
            <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }} className="w-full md:w-56 h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-700 font-medium cursor-pointer transition-all"><option value="">Semua Kategori</option>{cashflowGreenHouseCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            <div className="flex items-center gap-2 w-full md:w-auto"><input type="date" value={dateFilterStart} onChange={e => { setDateFilterStart(e.target.value); setCurrentPage(1); }} className="w-full md:w-36 h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-600 transition-all" /><span className="text-slate-400 text-xs font-semibold">s/d</span><input type="date" value={dateFilterEnd} onChange={e => { setDateFilterEnd(e.target.value); setCurrentPage(1); }} className="w-full md:w-36 h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-600 transition-all" /></div>
            {hasFilters && <button onClick={clearFilters} className="text-sm text-blue-600 font-semibold px-2 py-1 hover:bg-blue-50 rounded-lg">Reset Filter</button>}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider sticky top-0 backdrop-blur-md z-10">
            {isBulkMode && <th className="py-4 px-4 text-center w-12"><input type="checkbox" checked={paginatedRows.length > 0 && paginatedRows.every(row => selectedIds.includes(row.id))} onChange={e => setSelectedIds(e.target.checked ? paginatedRows.map(row => row.id) : [])} /></th>}
            <th className="py-4 px-6 w-28"><button onClick={() => { const next = sortDirection === 'asc' ? 'desc' : 'asc'; setSortDirection(next); localStorage.setItem('cashflow_green_house_sort_order', next); }} className="flex items-center gap-1">Tanggal <ArrowUpDown className="w-3.5 h-3.5" /></button></th><th className="py-4 px-4 w-32">Jenis</th><th className="py-4 px-4 w-48">Kategori</th><th className="py-4 px-4 w-96">Keterangan</th><th className="py-4 px-4 text-right w-36">Debit</th><th className="py-4 px-4 text-right w-36">Kredit</th><th className="py-4 px-4 text-right w-40">Total Saldo</th><th className="py-4 px-6 text-right w-24">Edit</th>
          </tr></thead><tbody className="divide-y divide-slate-100 text-sm">
            {paginatedRows.map(row => <tr key={row.id} className={`${selectedIds.includes(row.id) ? 'bg-blue-50/30' : row.debit > 0 ? 'bg-green-50/40 hover:bg-green-50/60' : 'hover:bg-slate-50/50'} transition-colors`}>
              {isBulkMode && <td className="py-4 px-4 text-center"><input type="checkbox" checked={selectedIds.includes(row.id)} onChange={e => setSelectedIds(e.target.checked ? [...selectedIds, row.id] : selectedIds.filter(id => id !== row.id))} /></td>}
              <td className="py-4 px-6 text-slate-500 font-medium whitespace-nowrap">{new Date(row.transactionDate).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td><td className="py-4 px-4"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${row.debit > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{row.debit > 0 ? 'Dana Masuk' : 'Pengeluaran'}</span></td><td className="py-4 px-4 text-slate-700 font-medium">{cashflowGreenHouseCategories.find(c => c.id === row.categoryId)?.name || '-'}</td><td className="py-4 px-4 text-slate-800 font-medium break-words max-w-[384px]">{row.description}</td><td className="py-4 px-4 text-right font-bold text-green-600 whitespace-nowrap">{row.debit ? formatRupiah(row.debit) : '-'}</td><td className="py-4 px-4 text-right font-bold text-red-600 whitespace-nowrap">{row.credit ? formatRupiah(row.credit) : '-'}</td><td className="py-4 px-4 text-right font-bold text-slate-700 whitespace-nowrap">{formatRupiah(row.runningBalance || 0)}</td><td className="py-4 px-6 text-right"><div className="flex items-center justify-end gap-1"><button onClick={() => openEdit(row)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button><button onClick={() => confirmDelete(row.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button></div></td>
            </tr>)}
            {processedRows.length === 0 && <tr><td colSpan={isBulkMode ? 9 : 8} className="py-16 text-center"><Search className="w-6 h-6 text-slate-300 mx-auto mb-3" /><p className="text-sm font-bold text-slate-700">{cashflowGreenHouse.length === 0 ? 'Belum ada transaksi' : 'Tidak ditemukan data transaksi'}</p><p className="text-xs text-slate-400">Silakan periksa filter atau tambahkan transaksi.</p></td></tr>}
          </tbody></table></div>
          <div className="border-t border-slate-100 bg-slate-50/30 p-4 relative"><Pagination currentPage={Math.min(currentPage, totalPages)} totalPages={totalPages} totalItems={processedRows.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} onItemsPerPageChange={setItemsPerPage} /><button type="button" onClick={() => { setIsBulkMode(!isBulkMode); setSelectedIds([]); }} className={`mt-3 inline-flex items-center justify-center px-4 py-2 border rounded-xl text-xs font-semibold gap-1.5 ${isBulkMode ? 'bg-amber-50 border-amber-300 text-amber-700' : 'border-slate-200 bg-white text-slate-600'}`}><Trash2 className="w-3.5 h-3.5" />{isBulkMode ? 'Batal Pilih' : 'Pilih Banyak'}</button></div>
        </div>

        <CategorySummary categories={cashflowGreenHouseCategories} rows={cashflowGreenHouse} formatRupiah={formatRupiah} managing={isManagingCategories} setManaging={setIsManagingCategories} newName={newCategoryName} setNewName={setNewCategoryName} editingId={editingCategoryId} setEditingId={setEditingCategoryId} editingName={editingCategoryName} setEditingName={setEditingCategoryName} addCategory={addCashflowGreenHouseCategory} updateCategory={updateCashflowGreenHouseCategory} deleteCategory={confirmDeleteCategory} exportExcel={exportCategoryExcel} exportPDF={exportCategoryPDF} isBulkMode={isBulkCategoryMode} setIsBulkMode={setIsBulkCategoryMode} selectedIds={selectedCategoryIds} setSelectedIds={setSelectedCategoryIds} deleteCategories={deleteCashflowGreenHouseCategories} confirmDeleteCategories={confirmDeleteCategories} />
      </div>

      {mounted && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 350 }} className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden z-10">
                <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                    <h3 className="text-base font-bold text-slate-800">{modalMode === 'add' ? 'Input Transaksi Green House' : 'Edit Transaksi Green House'}</h3>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ scrollbarGutter: 'stable' }}>
                    {formError && <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-100 flex items-center gap-2"><AlertTriangle className="w-4.5 h-4.5 flex-shrink-0" />{formError}</div>}
                    <div className="space-y-1"><label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Tanggal Transaksi</label><input type="date" value={transactionDate} onChange={e => setTransactionDate(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Jenis Transaksi</label><select value={transactionType} onChange={e => { const value = e.target.value as TransactionType; setTransactionType(value); if (value === 'Dana Masuk') setCategoryId(''); }} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"><option value="Dana Masuk">Dana Masuk (Income)</option><option value="Pengeluaran">Pengeluaran (Expense)</option></select></div>
                    {transactionType === 'Dana Masuk' ? (
                      <div className="space-y-4"><div className="space-y-1"><label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Keterangan</label><input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Keterangan pemasukan..." className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" /></div></div>
                    ) : (
                      <div className="space-y-4 p-4 border border-slate-100 rounded-2xl bg-slate-50/40">
                        <div className="space-y-1"><div className="flex justify-between items-center"><label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Kategori</label><button type="button" onClick={() => { setIsAddingCategory(!isAddingCategory); setNewCategoryName(''); }} className="text-xs text-blue-600 font-bold hover:underline">{isAddingCategory ? 'Batal' : '+ Kategori Baru'}</button></div>
                          {isAddingCategory ? <div className="flex gap-2"><input type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="Nama Kategori Baru..." className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20" /><button type="button" onClick={() => { if (!newCategoryName.trim()) return; const created = addCashflowGreenHouseCategory({ name: newCategoryName, icon: 'Tag', color: '#3b82f6', active: true }); setCategoryId(created.id); setIsAddingCategory(false); setNewCategoryName(''); }} className="px-3 py-1.5 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700">Simpan</button></div> : <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white">{cashflowGreenHouseCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>}
                        </div>
                        <div className="space-y-1"><label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Keterangan</label><input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Keterangan pengeluaran..." className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" /></div>
                      </div>
                    )}
                    <div className="space-y-1"><label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Nominal (Rupiah)</label><div className="relative flex items-center"><span className="absolute left-3 text-sm font-bold text-slate-500">Rp</span><input type="text" inputMode="decimal" pattern="[0-9.]*" value={displayAmount} onChange={e => { const clean = e.target.value.replace(/[^0-9]/g, ''); const value = clean ? parseInt(clean, 10) : 0; setAmount(value); setDisplayAmount(formatRupiahInput(value)); }} placeholder="0" className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold" /></div></div>
                  </div>
                  <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-white flex-shrink-0"><button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">Batal</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm shadow-blue-500/10 transition-colors">Simpan Transaksi</button></div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
      <ConfirmDialog isOpen={Boolean(dialog)} title={dialog?.title || ''} message={dialog?.message || ''} onConfirm={dialog?.onConfirm} onClose={() => setDialog(null)} />
      <AnimatePresence>
        {isBulkMode && selectedIds.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 100, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 100, x: '-50%' }} transition={{ duration: 0.25, ease: 'easeInOut' }} className="fixed left-1/2 z-[999] w-[calc(100vw-32px)] max-w-md bg-white p-4 rounded-[20px] shadow-[0_12px_32px_rgba(0,0,0,0.15)] border border-slate-100 flex flex-col gap-3" style={{ bottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}>
            <div className="flex items-center gap-2 text-slate-800"><span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600"><Check className="w-3.5 h-3.5" /></span><span className="text-sm font-bold">{selectedIds.length} item dipilih</span></div>
            <div className="flex items-center gap-3"><button type="button" onClick={() => setSelectedIds([])} className="flex-1 h-12 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-[14px] text-sm font-bold">Batal</button><button type="button" onClick={() => showConfirm('Hapus Terpilih', `Apakah Anda yakin ingin menghapus ${selectedIds.length} transaksi Green House terpilih?`, () => { deleteCashflowsGreenHouse(selectedIds); setSelectedIds([]); setIsBulkMode(false); setDialog(null); })} className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white rounded-[14px] text-sm font-bold inline-flex items-center justify-center gap-1.5"><Trash2 className="w-4 h-4" />Hapus Banyak</button></div>
          </motion.div>
        )}
        {isBulkCategoryMode && selectedCategoryIds.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 100, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 100, x: '-50%' }} transition={{ duration: 0.25, ease: 'easeInOut' }} className="fixed left-1/2 z-[999] w-[calc(100vw-32px)] max-w-md bg-white p-4 rounded-[20px] shadow-[0_12px_32px_rgba(0,0,0,0.15)] border border-slate-100 flex flex-col gap-3" style={{ bottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}>
            <div className="flex items-center gap-2 text-slate-800"><span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600"><Check className="w-3.5 h-3.5" /></span><span className="text-sm font-bold">{selectedCategoryIds.length} kategori dipilih</span></div>
            <div className="flex items-center gap-3"><button type="button" onClick={() => setSelectedCategoryIds([])} className="flex-1 h-12 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-[14px] text-sm font-bold">Batal</button><button type="button" onClick={() => confirmDeleteCategories(selectedCategoryIds)} className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white rounded-[14px] text-sm font-bold inline-flex items-center justify-center gap-1.5"><Trash2 className="w-4 h-4" />Hapus Banyak</button></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SummaryCard = ({ label, value, color, icon }: { label: string; value: string; color: 'green' | 'red' | 'blue'; icon: React.ReactNode }) => { const styles = { green: { text: 'text-green-600', bg: 'bg-green-50' }, red: { text: 'text-red-600', bg: 'bg-red-50' }, blue: { text: 'text-blue-600', bg: 'bg-blue-50' } }[color]; return <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between"><div><span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">{label}</span><h3 className={`text-xl font-bold ${styles.text} mt-1`}>{value}</h3></div><div className={`p-3 ${styles.bg} rounded-xl ${styles.text}`}>{icon}</div></div>; };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CategorySummaryProps = {
  categories: CashflowGreenHouseCategory[];
  rows: CashflowGreenHouse[];
  formatRupiah: (value: number) => string;
  managing: boolean;
  setManaging: (value: boolean) => void;
  newName: string;
  setNewName: (value: string) => void;
  editingId: string | null;
  setEditingId: (value: string | null) => void;
  editingName: string;
  setEditingName: (value: string) => void;
  addCategory: (category: Omit<CashflowGreenHouseCategory, 'id'>) => CashflowGreenHouseCategory;
  updateCategory: (id: string, updates: Partial<CashflowGreenHouseCategory>) => void;
  deleteCategory: (id: string) => void;
  exportExcel: () => void;
  exportPDF: () => void;
  isBulkMode: boolean;
  setIsBulkMode: (value: boolean) => void;
  selectedIds: string[];
  setSelectedIds: (value: string[]) => void;
  deleteCategories: (ids: string[]) => { deleted: string[]; blocked: string[] };
  confirmDeleteCategories: (ids: string[]) => void;
};

const CategorySummary = ({ categories, rows, formatRupiah, managing, setManaging, newName, setNewName, editingId, setEditingId, editingName, setEditingName, addCategory, updateCategory, deleteCategory, exportExcel, exportPDF, isBulkMode, setIsBulkMode, selectedIds, setSelectedIds }: CategorySummaryProps) => {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-800">Rekap Pengeluaran</h3>
          <p className="text-[11px] text-slate-400 font-semibold">Tabel rekapitulasi kategori</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button type="button" onClick={exportExcel} className="inline-flex items-center justify-center h-8 px-3 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 text-xs font-semibold gap-1.5"><FileSpreadsheet className="w-3.5 h-3.5 text-green-600" /><span className="hidden sm:inline">Excel</span></button>
          <button type="button" onClick={exportPDF} className="inline-flex items-center justify-center h-8 px-3 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 text-xs font-semibold gap-1.5"><FileText className="w-3.5 h-3.5 text-red-500" /><span className="hidden sm:inline">PDF</span></button>
          <button type="button" onClick={() => setManaging(!managing)} className="text-xs text-blue-600 font-bold hover:underline">{managing ? 'Selesai' : 'Kelola'}</button>
        </div>
      </div>
      {managing ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Tambah Kategori Baru</p>
            <div className="flex gap-2">
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nama kategori..." className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              <button type="button" onClick={() => { if (newName.trim()) { addCategory({ name: newName.trim(), icon: 'Tag', color: '#3b82f6', active: true }); setNewName(''); } }} className="px-3 py-1.5 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700 transition-colors">Tambah</button>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Daftar Kategori</p>
              <button type="button" onClick={() => { setIsBulkMode(!isBulkMode); setSelectedIds([]); }} className={`text-[10px] font-bold px-2 py-1 rounded-lg ${isBulkMode ? 'bg-amber-50 text-amber-700 border border-amber-300' : 'text-blue-600 hover:bg-blue-50'}`}>{isBulkMode ? 'Batal Pilih' : 'Pilih Banyak'}</button>
            </div>
            {isBulkMode && categories.length > 0 && <div className="flex items-center gap-2 px-2 py-1"><label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer"><input type="checkbox" checked={selectedIds.length === categories.length} onChange={e => setSelectedIds(e.target.checked ? categories.map(c => c.id) : [])} className="rounded border-slate-300 text-blue-600" />Pilih Semua</label></div>}
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden text-xs">
              {categories.map((category) => (
                <div key={category.id} className={`p-2 flex items-center gap-2 hover:bg-slate-50/50 ${selectedIds.includes(category.id) ? 'bg-blue-50/40' : ''}`}>
                  {isBulkMode && <input type="checkbox" checked={selectedIds.includes(category.id)} onChange={e => setSelectedIds(e.target.checked ? [...selectedIds, category.id] : selectedIds.filter(id => id !== category.id))} className="shrink-0 rounded border-slate-300 text-blue-600" />}
                  {editingId === category.id ? (
                    <div className="flex gap-2 w-full"><input type="text" value={editingName} onChange={e => setEditingName(e.target.value)} className="flex-1 px-2 py-1 border border-slate-200 rounded-lg text-base sm:text-xs" /><button type="button" onClick={() => { if (editingName.trim()) updateCategory(category.id, { name: editingName.trim() }); setEditingId(null); }} className="px-2 py-1 bg-green-600 text-white rounded text-[10px]">Simpan</button><button type="button" onClick={() => setEditingId(null)} className="px-2 py-1 bg-slate-400 text-white rounded text-[10px]">Batal</button></div>
                  ) : (
                    <div className="flex justify-between items-center w-full min-w-0"><span className="font-semibold text-slate-700 truncate">{category.name}</span>{!isBulkMode && <div className="flex gap-1 flex-shrink-0"><button type="button" title="Edit kategori" aria-label={`Edit kategori ${category.name}`} onClick={() => { setEditingId(category.id); setEditingName(category.name); }} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-3.5 h-3.5" /></button><button type="button" title="Hapus kategori" aria-label={`Hapus kategori ${category.name}`} onClick={() => deleteCategory(category.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button></div>}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden text-xs">
          {categories.map((category) => <div key={category.id} className="p-3 flex justify-between items-center gap-3 hover:bg-slate-50/50"><span className="font-semibold text-slate-600 truncate">{category.name}</span><span className="font-bold text-slate-700 whitespace-nowrap">{formatRupiah(rows.filter((row) => row.categoryId === category.id).reduce((sum, row) => sum + row.credit, 0))}</span></div>)}
                    <div className="p-3 bg-slate-50/70 flex justify-between items-center gap-3 font-bold"><span>Grand Total</span><span className="text-blue-600 whitespace-nowrap">{formatRupiah(rows.reduce((sum, row) => sum + row.credit, 0))}</span></div>
        </div>
      )}
    </div>
  );
};

const classStyles = <style jsx global>{`.action-button { display:inline-flex; align-items:center; justify-content:center; height:2.5rem; padding:0 1rem; border:1px solid rgb(226 232 240); border-radius:.75rem; color:rgb(71 85 105); font-size:.875rem; font-weight:600; gap:.5rem; } .action-button:hover { background:rgb(248 250 252); } .filter-input,.form-input { width:100%; padding:.625rem .875rem; border:1px solid rgb(226 232 240); border-radius:.75rem; font-size:.875rem; outline:none; } .filter-input:focus,.form-input:focus { border-color:rgb(59 130 246); box-shadow:0 0 0 2px rgb(59 130 246 / .2); } .field-label { display:block; color:rgb(71 85 105); font-size:.75rem; font-weight:700; letter-spacing:.05em; text-transform:uppercase; }`}</style>;
void classStyles;
