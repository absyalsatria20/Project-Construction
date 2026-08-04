'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp, Invoice } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  ArrowUpDown, 
  X,
  AlertTriangle,
  Calendar,
  FileSpreadsheet,
  FileText,
  Users,
  Check
} from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// ExtendedPDF interface removed
import { ConfirmDialog } from './ConfirmDialog';
import { Pagination } from './Pagination';

export const PaymentView: React.FC = () => {
  const { 
    invoices, 
    payments, 
    vendors, 
    addInvoice, 
    updateInvoice, 
    deleteInvoice,
    addPayment,
    deletePayment,
    itemsPerPage,
    setItemsPerPage,
    addVendor,
    deleteVendor,
    updateVendor,
    openInvoiceModal,
    setOpenInvoiceModal,
    deleteInvoices
  } = useApp();

  // Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [dateFilterStart, setDateFilterStart] = useState('');
  const [dateFilterEnd, setDateFilterEnd] = useState('');

  // UI state for adding vendor directly in form
  const [isAddingVendor, setIsAddingVendor] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  
  // Frontpage vendor management (Now in modal popup)
  const [isManagingVendors, setIsManagingVendors] = useState(false);
  const [frontpageNewVendorName, setFrontpageNewVendorName] = useState('');
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);
  const [editingVendorName, setEditingVendorName] = useState('');

  // Sorting State
  const [sortField, setSortField] = useState<keyof Invoice>('invoiceDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Mounted State for Portal
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Modals State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceModalMode, setInvoiceModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    if (isInvoiceModalOpen || isPaymentModalOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
    } else {
      document.body.style.overflow = '';
      document.body.style.height = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, [isInvoiceModalOpen, isPaymentModalOpen]);

  // Invoice Form State
  const [vendorId, setVendorId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [description, setDescription] = useState('');
  const [totalInvoice, setTotalInvoice] = useState<number>(0);
  const [displayTotalInvoice, setDisplayTotalInvoice] = useState('');
  const [termin, setTermin] = useState<number>(0);
  const [invoiceError, setInvoiceError] = useState('');

  // Payment Form State
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [displayPaymentAmount, setDisplayPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentError, setPaymentError] = useState('');

  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'confirm' | 'success' | 'error' | 'info';
    onConfirm?: () => void;
  }>({ isOpen: false, title: '', message: '', variant: 'confirm' });

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setDialogState({ isOpen: true, title, message, variant: 'confirm', onConfirm });
  };

  const showAlert = (title: string, message: string, variant: 'success' | 'error' | 'info' = 'info') => {
    setDialogState({ isOpen: true, title, message, variant });
  };

  const closeDialog = () => {
    setDialogState(prev => ({ ...prev, isOpen: false }));
  };

  // Helper formatting Rupiah
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatRupiahInput = (value: number) => {
    if (!value) return '';
    return new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Reset invoice form
  const resetInvoiceForm = () => {
    setVendorId('');
    setInvoiceNumber('');
    setInvoiceDate('');
    setDescription('');
    setTotalInvoice(0);
    setDisplayTotalInvoice('');
    setTermin(1);
    setInvoiceError('');
    setIsAddingVendor(false);
    setNewVendorName('');
  };

  // Reset payment form
  const resetPaymentForm = () => {
    setPaymentDate('');
    setPaymentAmount(0);
    setDisplayPaymentAmount('');
    setPaymentNote('');
    setPaymentError('');
  };

  const handleOpenAddInvoice = () => {
    resetInvoiceForm();
    if (vendors.length > 0) setVendorId(vendors[0].id);
    setInvoiceModalMode('add');
    setIsInvoiceModalOpen(true);
  };

  useEffect(() => {
    if (openInvoiceModal) {
      handleOpenAddInvoice();
      setOpenInvoiceModal(false);
    }
  }, [openInvoiceModal, vendors]);

  const handleOpenEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setVendorId(invoice.vendorId);
    setInvoiceNumber(invoice.invoiceNumber);
    setInvoiceDate(invoice.invoiceDate);
    setDescription(invoice.description);
    setTotalInvoice(invoice.totalInvoice);
    setDisplayTotalInvoice(formatRupiahInput(invoice.totalInvoice));
    setTermin(invoice.termin);
    setInvoiceModalMode('edit');
    setInvoiceError('');
    setIsInvoiceModalOpen(true);
  };

  const handleOpenViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setInvoiceModalMode('view');
    setIsInvoiceModalOpen(true);
  };

  const handleDeleteInvoice = (id: string) => {
    showConfirm('Hapus Invoice', 'Apakah Anda yakin ingin menghapus invoice ini beserta seluruh histori pembayarannya?', () => {
      deleteInvoice(id);
      setSelectedIds(prev => prev.filter(x => x !== id));
    });
  };

  const handleOpenAddPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    resetPaymentForm();
    // Default payment date to today
    setPaymentDate(new Date().toISOString().split('T')[0]);
    
    // Default nominal to remaining balance
    const invoicePayments = payments
      .filter(p => p.invoiceId === invoice.id)
      .reduce((sum, p) => sum + p.amount, 0);
    const remaining = invoice.totalInvoice - invoicePayments;
    setPaymentAmount(remaining);
    setDisplayPaymentAmount(formatRupiahInput(remaining));

    setIsPaymentModalOpen(true);
  };

  const handleInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) {
      setInvoiceError('Vendor wajib dipilih.');
      return;
    }
    if (!invoiceDate) {
      setInvoiceError('Tanggal Invoice wajib diisi.');
      return;
    }
    if (totalInvoice <= 0) {
      setInvoiceError('Total Invoice harus lebih besar dari 0.');
      return;
    }

    const payload = {
      vendorId,
      invoiceNumber: invoiceNumber.trim() || '-',
      invoiceDate,
      description: description.trim() || '-',
      totalInvoice,
      termin
    };

    if (invoiceModalMode === 'add') {
      addInvoice(payload);
    } else if (invoiceModalMode === 'edit' && selectedInvoice) {
      updateInvoice(selectedInvoice.id, payload);
    }

    setIsInvoiceModalOpen(false);
    resetInvoiceForm();
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    if (!paymentDate) {
      setPaymentError('Tanggal Pembayaran wajib diisi.');
      return;
    }
    if (paymentAmount <= 0) {
      setPaymentError('Nominal pembayaran harus lebih besar dari 0.');
      return;
    }

    const invoicePayments = payments
      .filter(p => p.invoiceId === selectedInvoice.id)
      .reduce((sum, p) => sum + p.amount, 0);
    const remaining = selectedInvoice.totalInvoice - invoicePayments;

    if (paymentAmount > remaining) {
      setPaymentError(`Nominal pembayaran melebihi sisa tagihan (${formatRupiah(remaining)}).`);
      return;
    }

    addPayment({
      invoiceId: selectedInvoice.id,
      paymentDate,
      amount: paymentAmount,
      paymentNote: paymentNote.trim() || '-'
    });

    setIsPaymentModalOpen(false);
    
    // Refresh the view invoice modal if it is active
    if (isInvoiceModalOpen && invoiceModalMode === 'view') {
      // Keep it open
    } else {
      resetPaymentForm();
    }
  };

  const handleDeletePayment = (id: string) => {
    showConfirm('Hapus Pembayaran', 'Apakah Anda yakin ingin menghapus histori pembayaran ini?', () => {
      deletePayment(id);
    });
  };

  // Sorting
  const handleSort = (field: keyof Invoice) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

    // Processing Invoice List
  const processedInvoices = useMemo(() => {
    let result = invoices.map(inv => {
      const invPayments = payments
        .filter(p => p.invoiceId === inv.id)
        .reduce((sum, p) => sum + p.amount, 0);
      const remaining = inv.totalInvoice - invPayments;
      
      let status: 'Belum Bayar' | 'Sebagian' | 'Lunas' = 'Belum Bayar';
      if (invPayments >= inv.totalInvoice) {
        status = 'Lunas';
      } else if (invPayments > 0) {
        status = 'Sebagian';
      }

      const vendor = vendors.find(v => v.id === inv.vendorId);

      return {
        ...inv,
        vendorName: vendor ? vendor.name : 'Unknown Vendor',
        paidAmount: invPayments,
        remainingAmount: remaining,
        status
      };
    });

    // Search
    if (searchTerm) {
      result = result.filter(inv => 
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.vendorName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Vendor Filter
    if (vendorFilter) {
      result = result.filter(inv => inv.vendorId === vendorFilter);
    }

    // Date Range Filter
    if (dateFilterStart) {
      result = result.filter(inv => inv.invoiceDate >= dateFilterStart);
    }
    if (dateFilterEnd) {
      result = result.filter(inv => inv.invoiceDate <= dateFilterEnd);
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle undefined / fallback
      if (aVal === undefined) aVal = '';
      if (bVal === undefined) bVal = '';

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      } else {
        return sortDirection === 'asc'
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      }
    });

    return result;
  }, [invoices, payments, vendors, searchTerm, vendorFilter, dateFilterStart, dateFilterEnd, sortField, sortDirection]);

  // Paginated Invoices
  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedInvoices.slice(startIndex, startIndex + itemsPerPage);
  }, [processedInvoices, currentPage]);

  const totalPages = Math.ceil(processedInvoices.length / itemsPerPage) || 1;

  // Export to Excel
  const exportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet('Rekap Pembayaran', {
      pageSetup: {
        orientation: 'landscape',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        margins: {
          left: 0.7, right: 0.7,
          top: 0.75, bottom: 0.75,
          header: 0.3, footer: 0.3
        }
      }
    });

    const headerBg: ExcelJS.FillPattern = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } };
    const headerFont: Partial<ExcelJS.Font> = { name: 'Calibri', bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    const dataFont: Partial<ExcelJS.Font> = { name: 'Calibri', bold: false, size: 9 };
    const thinBorder: Partial<ExcelJS.Borders> = {
      top: { style: 'thin' }, bottom: { style: 'thin' },
      left: { style: 'thin' }, right: { style: 'thin' }
    };

    const titleRow = ws.addRow(['REKAP PEMBAYARAN VENDOR']);
    titleRow.font = { name: 'Calibri', bold: true, size: 16 };
    titleRow.height = 28;
    ws.mergeCells('A1:J1');

    const dateRow = ws.addRow([`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`]);
    dateRow.font = { name: 'Calibri', size: 10 };
    dateRow.height = 18;
    ws.mergeCells('A2:J2');

    ws.addRow([]);

    const headers = ['No. Invoice', 'Vendor', 'Deskripsi', 'Tanggal', 'Termin', 'Total Invoice', 'Terbayar', 'Sisa Tagihan', 'Status', 'Riwayat Pembayaran'];
    const headerRow = ws.addRow(headers);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.fill = headerBg;
      cell.font = headerFont;
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = thinBorder;
    });

    ws.getColumn(1).width = 16;
    ws.getColumn(2).width = 28;
    ws.getColumn(3).width = 45;
    ws.getColumn(4).width = 14;
    ws.getColumn(5).width = 10;
    ws.getColumn(6).width = 20;
    ws.getColumn(7).width = 20;
    ws.getColumn(8).width = 20;
    ws.getColumn(9).width = 14;
    ws.getColumn(10).width = 36;

    const colAlignments: Record<number, Partial<ExcelJS.Alignment>> = {
      1: { horizontal: 'left', vertical: 'top', wrapText: false },
      2: { horizontal: 'left', vertical: 'top', wrapText: true },
      3: { horizontal: 'left', vertical: 'top', wrapText: true },
      4: { horizontal: 'center', vertical: 'top', wrapText: false },
      5: { horizontal: 'center', vertical: 'top', wrapText: false },
      6: { horizontal: 'right', vertical: 'top', wrapText: false },
      7: { horizontal: 'right', vertical: 'top', wrapText: false },
      8: { horizontal: 'right', vertical: 'top', wrapText: false },
      9: { horizontal: 'center', vertical: 'top', wrapText: false },
      10: { horizontal: 'left', vertical: 'top', wrapText: true },
    };

    processedInvoices.forEach(inv => {
      const invPayments = payments.filter(p => p.invoiceId === inv.id);
      const historyStr = invPayments
        .map(p => `${new Date(p.paymentDate).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })}: ${formatRupiah(p.amount)}`)
        .join('\n');

      const row = ws.addRow([
        inv.invoiceNumber,
        inv.vendorName,
        inv.description || '-',
        new Date(inv.invoiceDate).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        inv.termin.toString(),
        formatRupiah(inv.totalInvoice),
        formatRupiah(inv.paidAmount),
        formatRupiah(inv.remainingAmount),
        inv.status,
        historyStr || '-'
      ]);

      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.alignment = colAlignments[colNumber] || { vertical: 'top' };
        cell.border = thinBorder;
        cell.font = dataFont;
      });

      const vendorLines = Math.ceil((inv.vendorName || '').length / 26);
      const descLines = Math.ceil((inv.description || '').length / 32);
      const historyLines = historyStr ? historyStr.split('\n').length : 1;
      const maxLines = Math.max(vendorLines, descLines, historyLines, 1);
      row.height = Math.max(20, maxLines * 18);
    });

    ws.autoFilter = {
      from: { row: 4, column: 1 },
      to: { row: 4, column: 10 }
    };

    ws.views = [{ state: 'frozen', ySplit: 4 }];

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'Rekap_Pembayaran_Vendor.xlsx');
  };

  // Export to PDF
  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', format: 'a4', unit: 'mm' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('REKAP PEMBAYARAN VENDOR', 10, 15);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 10, 21);

    const headers = [['No. Invoice', 'Vendor', 'Deskripsi', 'Tanggal', 'Termin', 'Total Invoice', 'Terbayar', 'Sisa Tagihan', 'Status', 'Riwayat Pembayaran']];
    const data = processedInvoices.map(inv => {
      const invPayments = payments.filter(p => p.invoiceId === inv.id);
      const historyStr = invPayments
        .map(p => `${new Date(p.paymentDate).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })}: Rp ${p.amount.toLocaleString('id-ID')}`)
        .join('\n');

      return [
        inv.invoiceNumber,
        inv.vendorName,
        inv.description || '-',
        new Date(inv.invoiceDate).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        inv.termin.toString(),
        formatRupiah(inv.totalInvoice),
        formatRupiah(inv.paidAmount),
        formatRupiah(inv.remainingAmount),
        inv.status,
        historyStr || '-'
      ];
    });

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 26,
      theme: 'striped',
      margin: { left: 10, right: 10 },
      headStyles: { fillColor: [59, 130, 246], fontSize: 8, halign: 'center' },
      styles: { fontSize: 7.5, valign: 'top', overflow: 'linebreak' },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 30 },
        2: { cellWidth: 53 },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 16, halign: 'center' },
        5: { cellWidth: 27, halign: 'right' },
        6: { cellWidth: 27, halign: 'right' },
        7: { cellWidth: 27, halign: 'right' },
        8: { cellWidth: 20, halign: 'center' },
        9: { cellWidth: 34 }
      }
    });

    doc.save('Rekap_Pembayaran_Vendor.pdf');
  };

  const getStatusBadge = (status: 'Belum Bayar' | 'Sebagian' | 'Lunas') => {
    switch (status) {
      case 'Lunas':
        return <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold bg-green-50 text-green-700 rounded-full border border-green-200">Lunas</span>;
      case 'Sebagian':
        return <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-700 rounded-full border border-amber-200">Sebagian</span>;
      case 'Belum Bayar':
        return <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-700 rounded-full border border-red-200">Belum Bayar</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search, Filter, Export Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search input */}
          <div className="relative w-full lg:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari invoice atau vendor..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 h-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5">
            <button
              onClick={() => setIsManagingVendors(true)}
              className="inline-flex items-center justify-center h-10 px-4 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 text-sm font-semibold transition-all gap-2"
              title="Kelola Vendor"
            >
              <Users className="w-4 h-4 text-blue-600" />
              <span>Kelola Vendor</span>
            </button>
            <button
              onClick={exportExcel}
              className="inline-flex items-center justify-center h-10 px-4 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 text-sm font-semibold transition-all gap-2"
              title="Export Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
              <span>Excel</span>
            </button>
            <button
              onClick={exportPDF}
              className="inline-flex items-center justify-center h-10 px-4 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 text-sm font-semibold transition-all gap-2"
              title="Export PDF"
            >
              <FileText className="w-4 h-4 text-red-500" />
              <span>PDF</span>
            </button>
            <button
              onClick={handleOpenAddInvoice}
              disabled={vendors.length === 0}
              className="inline-flex items-center justify-center h-10 px-5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Create Invoice
            </button>
          </div>
        </div>

        {/* Filter Options */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 pt-4 border-t border-slate-100">
          {/* Filter Vendor */}
          <select
            value={vendorFilter}
            onChange={(e) => { setVendorFilter(e.target.value); setCurrentPage(1); }}
            className="w-full md:w-56 h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-700 font-medium cursor-pointer transition-all"
          >
            <option value="">Semua Vendor</option>
            {vendors.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>

          {/* Date Start & End */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="date"
              value={dateFilterStart}
              onChange={(e) => { setDateFilterStart(e.target.value); setCurrentPage(1); }}
              className="w-full md:w-36 h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-600 transition-all"
              placeholder="Mulai"
            />
            <span className="text-slate-400 text-xs font-semibold">s/d</span>
            <input
              type="date"
              value={dateFilterEnd}
              onChange={(e) => { setDateFilterEnd(e.target.value); setCurrentPage(1); }}
              className="w-full md:w-36 h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-600 transition-all"
              placeholder="Sampai"
            />
          </div>

          {(searchTerm || vendorFilter || dateFilterStart || dateFilterEnd) && (
            <button
              onClick={() => { setSearchTerm(''); setVendorFilter(''); setDateFilterStart(''); setDateFilterEnd(''); }}
              className="text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors self-center px-2 py-1 hover:bg-blue-50 rounded-lg whitespace-nowrap"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Warning if no vendors */}
      {vendors.length === 0 && (
        <div className="p-4 bg-amber-50 text-amber-800 border border-amber-200 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          Silakan tambahkan data Vendor terlebih dahulu di tab &apos;Master Data&apos; sebelum menginput Invoice.
        </div>
      )}

      {/* Invoice Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1250px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider sticky top-0 backdrop-blur-md z-10">
                {isBulkEditMode && (
                  <th className="py-4 px-4 text-center w-12">
                    <input
                      type="checkbox"
                      checked={paginatedInvoices.length > 0 && paginatedInvoices.every(inv => selectedIds.includes(inv.id))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const newSelections = [...selectedIds];
                          paginatedInvoices.forEach(inv => {
                            if (!newSelections.includes(inv.id)) {
                              newSelections.push(inv.id);
                            }
                          });
                          setSelectedIds(newSelections);
                        } else {
                          const paginatedIds = paginatedInvoices.map(inv => inv.id);
                          setSelectedIds(selectedIds.filter(id => !paginatedIds.includes(id)));
                        }
                      }}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                  </th>
                )}
                <th className="py-4 px-6 font-semibold w-36">
                  <button onClick={() => handleSort('invoiceDate')} className="flex items-center gap-1 hover:text-slate-800">
                    Tanggal <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </th>
                <th className="py-4 px-4 font-semibold w-56">Vendor</th>
                <th className="py-4 px-4 font-semibold w-96">Deskripsi</th>
                <th className="py-4 px-4 font-semibold text-center w-24">Termin</th>
                <th className="py-4 px-4 font-semibold text-right w-40">Total Invoice</th>
                <th className="py-4 px-4 font-semibold text-right w-40">Terbayar</th>
                <th className="py-4 px-4 font-semibold text-right w-40">Sisa Tagihan</th>
                <th className="py-4 px-4 font-semibold text-center w-28">Status</th>
                <th className="py-4 px-6 font-semibold text-right w-36">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedInvoices.map((inv) => (
                <tr key={inv.id} className={`${selectedIds.includes(inv.id) ? 'bg-blue-50/30' : ''} hover:bg-slate-50/50 transition-colors`}>
                  {isBulkEditMode && (
                    <td className="py-4 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(inv.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds([...selectedIds, inv.id]);
                          } else {
                            setSelectedIds(selectedIds.filter(id => id !== inv.id));
                          }
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                    </td>
                  )}
                  <td className="py-4 px-6 text-slate-500 font-medium whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(inv.invoiceDate).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-700 font-medium break-words max-w-[200px]" title={inv.vendorName}>{inv.vendorName}</td>
                  <td className="py-4 px-4 font-semibold text-slate-800 break-words max-w-[384px]">{inv.description}</td>
                  <td className="py-4 px-4 text-center text-slate-600 font-bold whitespace-nowrap">{inv.termin}</td>
                  <td className="py-4 px-4 text-right font-bold text-slate-700 whitespace-nowrap">{formatRupiah(inv.totalInvoice)}</td>
                  <td className="py-4 px-4 text-right font-semibold text-green-600 whitespace-nowrap">{formatRupiah(inv.paidAmount)}</td>
                  <td className="py-4 px-4 text-right font-semibold text-amber-600 whitespace-nowrap">{formatRupiah(inv.remainingAmount)}</td>
                  <td className="py-4 px-4 text-center whitespace-nowrap">{getStatusBadge(inv.status)}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => handleOpenViewInvoice(inv)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Detail & Histori Pembayaran"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {inv.status !== 'Lunas' && (
                        <button
                          onClick={() => handleOpenAddPayment(inv)}
                          className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                          title="Bayar Termin"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleOpenEditInvoice(inv)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Invoice"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteInvoice(inv.id)}
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {processedInvoices.length === 0 && (
                <tr>
                  <td colSpan={isBulkEditMode ? 10 : 9} className="py-16 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                        <Search className="w-6 h-6 text-slate-300" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-slate-700">Tidak ditemukan data invoice</p>
                        <p className="text-xs text-slate-400">Silakan periksa filter atau tambahkan data baru</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Bulk Selection */}
        <div className="border-t border-slate-100 bg-slate-50/30 p-4 relative">
          <div className="flex-1">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={processedInvoices.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
          <div className="mt-3 flex items-center justify-start">
            <button
              onClick={() => {
                setIsBulkEditMode(!isBulkEditMode);
                setSelectedIds([]);
              }}
              className={`inline-flex items-center justify-center px-4 py-2 border rounded-xl text-xs font-semibold transition-colors gap-1.5 ${
                isBulkEditMode 
                  ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100' 
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isBulkEditMode ? 'Batal Pilih' : 'Pilih Banyak'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Vendor Management Modal Popup */}
      {mounted && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isManagingVendors && (
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setIsManagingVendors(false);
                  setEditingVendorId(null);
                  setFrontpageNewVendorName('');
                }}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] overflow-hidden z-10"
              >
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Daftar Vendor</h3>
                    <p className="text-[11px] text-slate-400 font-semibold">Kelola vendor terdaftar di sistem</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsManagingVendors(false);
                      setEditingVendorId(null);
                      setFrontpageNewVendorName('');
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Add Vendor Form */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Tambah Vendor Baru</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={frontpageNewVendorName}
                        onChange={(e) => setFrontpageNewVendorName(e.target.value)}
                        placeholder="Nama vendor..."
                        className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <button
                        onClick={() => {
                          if (!frontpageNewVendorName.trim()) return;
                          addVendor({
                            name: frontpageNewVendorName,
                            address: '',
                            pic: '-',
                            phone: '-',
                            bank: '-',
                            accountNumber: ''
                          });
                          setFrontpageNewVendorName('');
                        }}
                        className="px-3 py-1.5 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700 transition-colors"
                      >
                        Tambah
                      </button>
                    </div>
                  </div>

                  {/* Vendor List */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Daftar Vendor Aktif</p>
                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden text-xs max-h-[300px] overflow-y-auto">
                      {vendors.length === 0 ? (
                        <div className="p-4 text-center text-slate-400">Belum ada vendor terdaftar.</div>
                      ) : (
                        vendors.map((v) => (
                          <div key={v.id} className="p-3 flex justify-between items-center hover:bg-slate-50/50">
                            {editingVendorId === v.id ? (
                              <div className="flex gap-2 w-full">
                                <input
                                  type="text"
                                  value={editingVendorName}
                                  onChange={(e) => setEditingVendorName(e.target.value)}
                                  className="flex-1 px-2 py-1 border border-slate-200 rounded-lg text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                                <button
                                  onClick={() => {
                                    if (!editingVendorName.trim()) return;
                                    updateVendor(v.id, { name: editingVendorName });
                                    setEditingVendorId(null);
                                  }}
                                  className="px-2.5 py-1 bg-green-600 text-white rounded font-semibold text-[10px]"
                                >
                                  Simpan
                                </button>
                                <button
                                  onClick={() => setEditingVendorId(null)}
                                  className="px-2.5 py-1 bg-slate-400 text-white rounded font-semibold text-[10px]"
                                >
                                  Batal
                                </button>
                              </div>
                            ) : (
                              <>
                                <span className="font-semibold text-slate-700">{v.name}</span>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => {
                                      setEditingVendorId(v.id);
                                      setEditingVendorName(v.name);
                                    }}
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      showConfirm('Hapus Vendor', `Hapus vendor "${v.name}"?`, () => {
                                        const success = deleteVendor(v.id);
                                        if (!success) {
                                          showAlert('Gagal Menghapus', 'Gagal menghapus! Vendor ini masih terikat dengan data Invoice atau transaksi Cashflow.', 'error');
                                        }
                                      });
                                    }}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end bg-slate-50">
                  <button
                    onClick={() => {
                      setIsManagingVendors(false);
                      setEditingVendorId(null);
                      setFrontpageNewVendorName('');
                    }}
                    className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-white transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Invoice CRUD Modal */}
      {mounted && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isInvoiceModalOpen && (
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsInvoiceModalOpen(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden z-10"
              >
                <form onSubmit={handleInvoiceSubmit} className="flex flex-col flex-1 overflow-hidden">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                    <h3 className="text-base font-bold text-slate-800">
                    {invoiceModalMode === 'add' ? 'Buat Invoice Baru' : invoiceModalMode === 'edit' ? 'Edit Invoice' : 'Detail Invoice & Histori'}
                  </h3>
                    <button 
                      type="button"
                      onClick={() => setIsInvoiceModalOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                  {/* Body */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ scrollbarGutter: 'stable' }}>
                  {invoiceError && (
                    <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-100 flex items-center gap-2">
                      <AlertTriangle className="w-4.5 h-4.5 flex-shrink-0" />
                      {invoiceError}
                    </div>
                  )}

                  {invoiceModalMode === 'view' && selectedInvoice ? (
                    // View Mode & History
                    <div className="space-y-5 text-sm">
                      {/* Summary Card */}
                      <div className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">No. Invoice</span>
                            <h4 className="font-bold text-slate-800 text-base">{selectedInvoice.invoiceNumber || '-'}</h4>
                            <p className="text-xs text-slate-500 font-semibold">{selectedInvoice.description}</p>
                          </div>
                          <div>
                            {getStatusBadge(
                              payments.filter(p => p.invoiceId === selectedInvoice.id).reduce((sum, p) => sum + p.amount, 0) >= selectedInvoice.totalInvoice
                                ? 'Lunas'
                                : payments.filter(p => p.invoiceId === selectedInvoice.id).reduce((sum, p) => sum + p.amount, 0) > 0
                                  ? 'Sebagian'
                                  : 'Belum Bayar'
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200/60 text-center">
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Total</span>
                            <span className="font-bold text-slate-700">{formatRupiah(selectedInvoice.totalInvoice)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Terbayar</span>
                            <span className="font-bold text-green-600">
                              {formatRupiah(payments.filter(p => p.invoiceId === selectedInvoice.id).reduce((sum, p) => sum + p.amount, 0))}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Sisa</span>
                            <span className="font-bold text-amber-600">
                              {formatRupiah(selectedInvoice.totalInvoice - payments.filter(p => p.invoiceId === selectedInvoice.id).reduce((sum, p) => sum + p.amount, 0))}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Vendor & Details */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Vendor</span>
                          <span className="font-semibold text-slate-700">
                            {vendors.find(v => v.id === selectedInvoice.vendorId)?.name || 'Unknown'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Tanggal Invoice</span>
                          <span className="font-semibold text-slate-700">
                            {new Date(selectedInvoice.invoiceDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      {/* Payment History List */}
                      <div className="space-y-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Histori Pembayaran</span>
                        <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-white max-h-[180px] overflow-y-auto">
                          {payments.filter(p => p.invoiceId === selectedInvoice.id).length === 0 ? (
                            <div className="p-4 text-center text-slate-400 text-xs font-medium">Belum ada pembayaran.</div>
                          ) : (
                            payments.filter(p => p.invoiceId === selectedInvoice.id).map((p) => (
                              <div key={p.id} className="p-3 flex justify-between items-center hover:bg-slate-50/50">
                                <div>
                                  <p className="font-semibold text-slate-800 text-xs">{p.paymentNote}</p>
                                  <p className="text-[10px] text-slate-400 font-medium">
                                    {new Date(p.paymentDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-slate-700 text-xs">{formatRupiah(p.amount)}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeletePayment(p.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Add / Edit Form
                    <div className="space-y-4">
                      {/* Vendor Dropdown */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Vendor</label>
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingVendor(!isAddingVendor);
                              setNewVendorName('');
                            }}
                            className="text-xs text-blue-600 font-bold hover:underline"
                          >
                            {isAddingVendor ? 'Batal' : '+ Vendor Baru'}
                          </button>
                        </div>
                        {isAddingVendor ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newVendorName}
                              onChange={(e) => setNewVendorName(e.target.value)}
                              placeholder="Nama Vendor Baru..."
                              className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!newVendorName.trim()) return;
                                const created = addVendor({
                                  name: newVendorName,
                                  address: '',
                                  pic: '-',
                                  phone: '-',
                                  bank: '-',
                                  accountNumber: ''
                                });
                                setVendorId(created.id);
                                setIsAddingVendor(false);
                                setNewVendorName('');
                              }}
                              className="px-3 py-1.5 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700"
                            >
                              Simpan
                            </button>
                          </div>
                        ) : (
                          <select
                            value={vendorId}
                            onChange={(e) => setVendorId(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                          >
                            {vendors.map(v => (
                              <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Invoice Number */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">No. Invoice</label>
                          <input
                            type="text"
                            value={invoiceNumber}
                            onChange={(e) => setInvoiceNumber(e.target.value)}
                            placeholder="INV/2026/XYZ"
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>

                        {/* Invoice Date */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Tanggal Invoice</label>
                          <input
                            type="date"
                            value={invoiceDate}
                            onChange={(e) => setInvoiceDate(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Total Invoice */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Total Invoice (Rp)</label>
                          <div className="relative flex items-center">
                            <span className="absolute left-3 text-sm font-bold text-slate-500">Rp</span>
                            <input
                              type="text"
                              inputMode="decimal"
                              pattern="[0-9.]*"
                              value={displayTotalInvoice}
                              onChange={(e) => {
                                const cleanVal = e.target.value.replace(/[^0-9]/g, '');
                                const numVal = cleanVal ? parseInt(cleanVal, 10) : 0;
                                setTotalInvoice(numVal);
                                setDisplayTotalInvoice(formatRupiahInput(numVal));
                              }}
                              placeholder="0"
                              className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                            />
                          </div>
                        </div>

                        {/* Termin */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Termin (Urutan Ke-)</label>
                          <input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={termin}
                            onChange={(e) => {
                              const val = e.target.value === '' ? 0 : Number(e.target.value);
                              setTermin(val);
                            }}
                            placeholder="0"
                            min="0"
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Keterangan / Deskripsi</label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Contoh: Pembelian Semen Portland 100 zak"
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-20 resize-none"
                        />
                      </div>
                    </div>
                  )}

                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-white flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsInvoiceModalOpen(false)}
                      className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                    >
                      {invoiceModalMode === 'view' ? 'Tutup' : 'Batal'}
                    </button>
                    {invoiceModalMode !== 'view' && (
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm shadow-blue-500/10 transition-colors"
                      >
                        Simpan
                      </button>
                    )}
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Payment Form Modal */}
      {mounted && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isPaymentModalOpen && selectedInvoice && (
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsPaymentModalOpen(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 flex flex-col z-10"
              >
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Tambah Pembayaran</h3>
                    <p className="text-xs text-slate-400 font-semibold">{selectedInvoice.invoiceNumber}</p>
                  </div>
                  <button 
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body */}
                <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
                  {paymentError && (
                    <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-100 flex items-center gap-2">
                      <AlertTriangle className="w-4.5 h-4.5 flex-shrink-0" />
                      {paymentError}
                    </div>
                  )}

                  <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Total Tagihan:</span>
                      <span className="font-bold text-slate-700">{formatRupiah(selectedInvoice.totalInvoice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Sudah Terbayar:</span>
                      <span className="font-bold text-green-600">
                        {formatRupiah(payments.filter(p => p.invoiceId === selectedInvoice.id).reduce((sum, p) => sum + p.amount, 0))}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-blue-200/50">
                      <span className="text-slate-600 font-bold">Sisa Tagihan:</span>
                      <span className="font-bold text-amber-600">
                        {formatRupiah(selectedInvoice.totalInvoice - payments.filter(p => p.invoiceId === selectedInvoice.id).reduce((sum, p) => sum + p.amount, 0))}
                      </span>
                    </div>
                  </div>

                  {/* Payment Date */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Tanggal Pembayaran</label>
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  {/* Payment Amount */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Nominal Pembayaran (Rp)</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-sm font-bold text-slate-500">Rp</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9.]*"
                        value={displayPaymentAmount}
                        onChange={(e) => {
                          const cleanVal = e.target.value.replace(/[^0-9]/g, '');
                          const numVal = cleanVal ? parseInt(cleanVal, 10) : 0;
                          setPaymentAmount(numVal);
                          setDisplayPaymentAmount(formatRupiahInput(numVal));
                        }}
                        placeholder="0"
                        className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                      />
                    </div>
                  </div>

                  {/* Payment Note */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Catatan Pembayaran (Termin / Note)</label>
                    <input
                      type="text"
                      value={paymentNote}
                      onChange={(e) => setPaymentNote(e.target.value)}
                      placeholder="Contoh: DP 30%, Termin 2, Pelunasan"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPaymentModalOpen(false)}
                      className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm shadow-blue-500/10 transition-colors"
                    >
                      Simpan Pembayaran
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <ConfirmDialog
        isOpen={dialogState.isOpen}
        title={dialogState.title}
        message={dialogState.message}
        variant={dialogState.variant}
        onConfirm={dialogState.onConfirm}
        onClose={closeDialog}
      />

      {/* Floating Bulk Action Bar */}
      <AnimatePresence>
        {isBulkEditMode && selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 100, x: '-50%' }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="fixed left-1/2 z-[999] w-[calc(100vw-32px)] max-w-md bg-white p-4 rounded-[20px] shadow-[0_12px_32px_rgba(0,0,0,0.15)] border border-slate-100 flex flex-col gap-3"
            style={{ bottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
          >
            <div className="flex items-center gap-2 text-slate-800">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600">
                <Check className="w-3.5 h-3.5" />
              </span>
              <span className="text-sm font-bold">{selectedIds.length} invoice dipilih</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedIds([])}
                className="flex-1 h-12 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-[14px] text-sm font-bold transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  showConfirm(
                    'Hapus Terpilih',
                    `Apakah Anda yakin ingin menghapus ${selectedIds.length} invoice terpilih beserta histori pembayarannya?`,
                    () => {
                      deleteInvoices(selectedIds);
                      setSelectedIds([]);
                    }
                  );
                }}
                className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white rounded-[14px] text-sm font-bold transition-colors inline-flex items-center justify-center gap-1.5 shadow-sm shadow-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
                Hapus Banyak
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
