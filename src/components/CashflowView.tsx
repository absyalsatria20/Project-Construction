'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp, Cashflow } from '@/context/AppContext';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  ArrowUpDown, 
  X,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Wallet,
  FileSpreadsheet,
  FileText,
  Upload
} from 'lucide-react';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { ConfirmDialog } from './ConfirmDialog';
import { Pagination } from './Pagination';

export const CashflowView: React.FC = () => {
  const { 
    cashflows, 
    categories, 
    addCashflow, 
    addCashflows,
    updateCashflow, 
    deleteCashflow,
    addCategory,
    deleteCategory,
    updateCategory,
    itemsPerPage,
    setItemsPerPage,
    openCashflowModal,
    setOpenCashflowModal,
    deleteCashflows
  } = useApp();

  // Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilterStart, setDateFilterStart] = useState('');
  const [dateFilterEnd, setDateFilterEnd] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Sorting
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Mounted State for Portal
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    if (isModalOpen) {
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
  }, [isModalOpen]);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedCashflow, setSelectedCashflow] = useState<Cashflow | null>(null);

  // Category Add / Edit UI State
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Frontpage category management
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [frontpageNewCategoryName, setFrontpageNewCategoryName] = useState('');

  // Form State
  const [transactionDate, setTransactionDate] = useState('');
  const [transactionType, setTransactionType] = useState<'Dana Masuk' | 'Pengeluaran'>('Pengeluaran');
  const [categoryId, setCategoryId] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [displayAmount, setDisplayAmount] = useState('');

  const [formError, setFormError] = useState('');

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

  // Set default form values
  const resetForm = React.useCallback(() => {
    setTransactionDate(new Date().toISOString().split('T')[0]);
    setTransactionType('Pengeluaran');
    setCategoryId(categories[0]?.id || '');
    setVendorId('');
    setDescription('');
    setAmount(0);
    setDisplayAmount('');
    setFormError('');
    setIsAddingCategory(false);
    setNewCategoryName('');
  }, [categories]);

  // Set subcategory default when category changes
  useEffect(() => {
    // subcategory dinonaktifkan
  }, []);

  // Generate description automatically based on form values to ease input
  useEffect(() => {
    // Keterangan manual saja, tidak perlu generate otomatis
  }, []);

  const handleOpenAdd = React.useCallback(() => {
    resetForm();
    setModalMode('add');
    setIsModalOpen(true);
  }, [resetForm]);

  useEffect(() => {
    if (openCashflowModal) {
      handleOpenAdd();
      setOpenCashflowModal(false);
    }
  }, [openCashflowModal, setOpenCashflowModal, handleOpenAdd]);

  const handleOpenEdit = (cf: Cashflow) => {
    setSelectedCashflow(cf);
    setTransactionDate(cf.transactionDate);
    setTransactionType(cf.transactionType);
    setCategoryId(cf.categoryId || '');
    setVendorId(cf.vendorId || '');
    setDescription(cf.description);
    setAmount(cf.amount);
    setDisplayAmount(formatRupiahInput(cf.amount));
    setModalMode('edit');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    showConfirm('Hapus Transaksi', 'Apakah Anda yakin ingin menghapus transaksi ini?', () => {
      deleteCashflow(id);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!transactionDate) {
      setFormError('Tanggal transaksi wajib diisi.');
      return;
    }
    if (amount <= 0) {
      setFormError('Nominal harus lebih besar dari 0.');
      return;
    }
    if (!description.trim()) {
      setFormError('Keterangan wajib diisi.');
      return;
    }

    if (transactionType === 'Pengeluaran') {
      if (!categoryId) {
        setFormError('Kategori wajib dipilih.');
        return;
      }
    } else {
      // Tidak wajib kategori untuk Dana Masuk, tapi jika ada diisi silakan. Atau samakan saja set categoryId ke kosong/default
    }

    const payload = {
      transactionDate,
      transactionType,
      categoryId: (categoryId || undefined),
      vendorId: transactionType === 'Pengeluaran' ? (vendorId || undefined) : undefined,
      description: description,
      amount,
      note: ''
    };

    if (modalMode === 'add') {
      addCashflow(payload);
    } else if (modalMode === 'edit' && selectedCashflow) {
      updateCashflow(selectedCashflow.id, payload);
    }

    setIsModalOpen(false);
    resetForm();
  };

  // Calculations for Summary
  const totals = useMemo(() => {
    let masuk = 0;
    let keluar = 0;

    cashflows.forEach(cf => {
      if (cf.transactionType === 'Dana Masuk') {
        masuk += cf.amount;
      } else {
        keluar += cf.amount;
      }
    });

    return {
      masuk,
      keluar,
      saldo: masuk - keluar
    };
  }, [cashflows]);

  // Category Summary (Tabel Rekap Pengeluaran)
  const categorySummaryList = useMemo(() => {
    const summary: { [key: string]: number } = {};
    
    // Inisialisasi semua kategori pengeluaran yang aktif
    categories.forEach(cat => {
      summary[cat.name] = 0;
    });

    cashflows
      .filter(cf => cf.transactionType === 'Pengeluaran')
      .forEach(cf => {
        const cat = categories.find(c => c.id === cf.categoryId);
        const name = cat ? cat.name : 'Lain-lain';
        summary[name] = (summary[name] || 0) + cf.amount;
      });

    return Object.keys(summary).map(key => ({
      categoryName: key,
      total: summary[key]
    }));
  }, [cashflows, categories]);

  const grandTotalSummary = useMemo(() => {
    return categorySummaryList.reduce((sum, item) => sum + item.total, 0);
  }, [categorySummaryList]);

  // Filtered and Sorted Cashflow Data
  const processedCashflows = useMemo(() => {
    let result = [...cashflows];

    // Search by Description
    if (searchTerm) {
      result = result.filter(cf => 
        cf.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type Filter
    if (typeFilter) {
      result = result.filter(cf => cf.transactionType === typeFilter);
    }

    // Category Filter
    if (categoryFilter) {
      result = result.filter(cf => cf.categoryId === categoryFilter);
    }

    // Vendor Filter (vendorFilter dihapus)

    // Date Range Filter
    if (dateFilterStart) {
      result = result.filter(cf => cf.transactionDate >= dateFilterStart);
    }
    if (dateFilterEnd) {
      result = result.filter(cf => cf.transactionDate <= dateFilterEnd);
    }

    // Sorting berdasarkan rowIndex agar identik dengan baris Excel yang diimport
    result.sort((a, b) => {
      const rowA = a.rowIndex || 0;
      const rowB = b.rowIndex || 0;
      return sortDirection === 'asc' ? rowA - rowB : rowB - rowA;
    });

    return result;
  }, [cashflows, searchTerm, typeFilter, categoryFilter, dateFilterStart, dateFilterEnd, sortDirection]);

  // Paginated Data
  const paginatedCashflows = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedCashflows.slice(startIndex, startIndex + itemsPerPage);
  }, [processedCashflows, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedCashflows.length / itemsPerPage) || 1;

  // Export Excel
  const exportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet('Laporan Cashflow', {
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
    const greenBg: ExcelJS.FillPattern = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
    const headerFont: Partial<ExcelJS.Font> = { name: 'Calibri', bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    const dataFont: Partial<ExcelJS.Font> = { name: 'Calibri', bold: false, size: 9 };
    const greenFont: Partial<ExcelJS.Font> = { name: 'Calibri', bold: false, size: 9, color: { argb: 'FF15803D' } };
    const thinBorder: Partial<ExcelJS.Borders> = {
      top: { style: 'thin' }, bottom: { style: 'thin' },
      left: { style: 'thin' }, right: { style: 'thin' }
    };

    const titleRow = ws.addRow(['LAPORAN CASHFLOW PROYEK']);
    titleRow.font = { name: 'Calibri', bold: true, size: 16 };
    titleRow.height = 28;
    ws.mergeCells('A1:H1');

    const dateRow = ws.addRow([`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`]);
    dateRow.font = { name: 'Calibri', size: 10 };
    dateRow.height = 18;
    ws.mergeCells('A2:H2');

    ws.addRow([]);

    const headers = ['No', 'Tanggal', 'Jenis', 'Kategori', 'Deskripsi', 'Debit', 'Kredit', 'Saldo Berjalan'];
    const headerRow = ws.addRow(headers);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.fill = headerBg;
      cell.font = headerFont;
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = thinBorder;
    });

    ws.getColumn(1).width = 6;
    ws.getColumn(2).width = 14;
    ws.getColumn(3).width = 18;
    ws.getColumn(4).width = 22;
    ws.getColumn(5).width = 36;
    ws.getColumn(6).width = 20;
    ws.getColumn(7).width = 20;
    ws.getColumn(8).width = 22;

    const colAlignments: Record<number, Partial<ExcelJS.Alignment>> = {
      1: { horizontal: 'center', vertical: 'middle' },
      2: { horizontal: 'center', vertical: 'middle' },
      3: { horizontal: 'left', vertical: 'middle', indent: 1 },
      4: { horizontal: 'left', vertical: 'middle', indent: 1 },
      5: { horizontal: 'left', vertical: 'middle', wrapText: true, indent: 1 },
      6: { horizontal: 'right', vertical: 'middle', indent: 1 },
      7: { horizontal: 'right', vertical: 'middle', indent: 1 },
      8: { horizontal: 'right', vertical: 'middle', indent: 1 },
    };

    processedCashflows.forEach((cf, idx) => {
      const categoryName = categories.find(c => c.id === cf.categoryId)?.name || '-';
      const isDanaMasuk = cf.transactionType === 'Dana Masuk';
      const debitStr = isDanaMasuk ? formatRupiah(cf.amount) : '-';
      const kreditStr = !isDanaMasuk ? formatRupiah(cf.amount) : '-';
      const saldoStr = formatRupiah(cf.runningBalance || 0);

      const row = ws.addRow([
        idx + 1,
        new Date(cf.transactionDate).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        isDanaMasuk ? 'Dana Masuk [MASUK]' : 'Pengeluaran',
        categoryName,
        cf.description + (cf.note ? ` (${cf.note})` : ''),
        debitStr,
        kreditStr,
        saldoStr
      ]);

      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.alignment = colAlignments[colNumber] || { vertical: 'middle' };
        cell.border = thinBorder;
        if (isDanaMasuk) {
          cell.fill = greenBg;
          cell.font = greenFont;
        } else {
          cell.font = dataFont;
        }
      });

      const descLen = (cf.description + (cf.note ? ` (${cf.note})` : '')).length;
      const lines = Math.max(Math.ceil(descLen / 34), 1);
      row.height = Math.max(20, lines * 16);
    });

    ws.autoFilter = {
      from: { row: 4, column: 1 },
      to: { row: 4, column: 8 }
    };

    ws.views = [{ state: 'frozen', ySplit: 4 }];

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'Laporan_Cashflow_Proyek.xlsx');
  };

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', format: 'a4', unit: 'mm' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('LAPORAN CASHFLOW PROYEK', 10, 15);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 10, 21);

    const headers = [['No', 'Tanggal', 'Jenis', 'Kategori', 'Deskripsi', 'Debit', 'Kredit', 'Saldo Berjalan']];
    const data = processedCashflows.map((cf, idx) => {
      const isDanaMasuk = cf.transactionType === 'Dana Masuk';
      return [
        (idx + 1).toString(),
        new Date(cf.transactionDate).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        isDanaMasuk ? 'Dana Masuk [MASUK]' : 'Pengeluaran',
        categories.find(c => c.id === cf.categoryId)?.name || '-',
        cf.description + (cf.note ? ` (${cf.note})` : ''),
        isDanaMasuk ? formatRupiah(cf.amount) : '-',
        !isDanaMasuk ? formatRupiah(cf.amount) : '-',
        formatRupiah(cf.runningBalance || 0)
      ];
    });

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 26,
      theme: 'striped',
      margin: { left: 10, right: 10 },
      headStyles: { fillColor: [59, 130, 246], fontSize: 8 },
      styles: { fontSize: 7.5, valign: 'top', overflow: 'linebreak' },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 22, halign: 'center' },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 40, halign: 'left' },
        4: { cellWidth: 85, halign: 'left' },
        5: { cellWidth: 30, halign: 'right' },
        6: { cellWidth: 30, halign: 'right' },
        7: { cellWidth: 30, halign: 'right' }
      },
      didParseCell: (data) => {
        if (data.section === 'head') {
          const colIndex = data.column.index;
          if (colIndex === 0 || colIndex === 1 || colIndex === 2) {
            data.cell.styles.halign = 'center';
          } else if (colIndex === 3 || colIndex === 4) {
            data.cell.styles.halign = 'left';
          } else if (colIndex === 5 || colIndex === 6 || colIndex === 7) {
            data.cell.styles.halign = 'right';
          }
        }
        // Highlight rows containing "[MASUK]"
        if (data.row.index >= 0) {
          const rowData = data.row.raw as string[];
          if (rowData && rowData[2] && rowData[2].includes('[MASUK]')) {
            data.cell.styles.fillColor = [220, 252, 231]; // light green background
            data.cell.styles.textColor = [21, 128, 61]; // dark green text
          }
        }
      }
    });

    doc.save('Laporan_Cashflow_Proyek.pdf');
  };

  // Import Excel
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, string | number>>(worksheet);

        if (jsonData.length === 0) {
          showAlert('Import Gagal', 'Excel kosong atau tidak ada data yang bisa diimport.', 'error');
          return;
        }

        // Validate headers. Expected: 'Tanggal', 'Jenis', 'Kategori', 'Keterangan', 'Nominal', 'Catatan'
        const firstRowKeys = Object.keys(jsonData[0]).map(k => k.trim());
        const expectedHeaders = ['Tanggal', 'Jenis', 'Keterangan', 'Nominal'];
        const hasRequiredHeaders = expectedHeaders.every(h => 
          firstRowKeys.some(key => key.toLowerCase() === h.toLowerCase())
        );

        if (!hasRequiredHeaders) {
          showAlert('Format Tidak Sesuai', 'Format header Excel tidak sesuai. Harus mengandung kolom: Tanggal, Jenis, Keterangan, Nominal.', 'error');
          return;
        }

        // Helper to find exact key case-insensitively
        const getRowValue = (row: Record<string, string | number>, header: string): unknown => {
          const key = Object.keys(row).find(k => k.trim().toLowerCase() === header.toLowerCase());
          return key ? row[key] : undefined;
        };

        let importedCount = 0;
        let errorCount = 0;
        const listToImport: Omit<Cashflow, 'id' | 'runningBalance'>[] = [];

        jsonData.forEach((row, index) => {
          const valTanggal = getRowValue(row, 'Tanggal');
          const valJenis = getRowValue(row, 'Jenis');
          const valKeterangan = getRowValue(row, 'Keterangan');
          const valNominal = getRowValue(row, 'Nominal');
          const valKategori = getRowValue(row, 'Kategori');
          const valCatatan = getRowValue(row, 'Catatan');

          // Parse transactionDate
          let dateStr = '';
          if (valTanggal !== undefined && valTanggal !== null) {
            if (typeof valTanggal === 'number') {
              // Handle Excel serial date number
              const utc_days = Math.floor(valTanggal - 25569);
              const utc_value = utc_days * 86400;
              const date_info = new Date(utc_value * 1000);
              dateStr = `${date_info.getFullYear()}-${String(date_info.getMonth() + 1).padStart(2, '0')}-${String(date_info.getDate()).padStart(2, '0')}`;
            } else {
              // Try standard date parsing
              const parts = String(valTanggal).split(/[-/]/);
              if (parts.length === 3) {
                // If format is YYYY-MM-DD
                if (parts[0].length === 4) {
                  dateStr = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
                } else if (parts[2].length === 4) { // If format is DD-MM-YYYY
                  dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                }
              }
              if (!dateStr) {
                const parsedDate = new Date(String(valTanggal));
                if (!isNaN(parsedDate.getTime())) {
                  dateStr = parsedDate.toISOString().split('T')[0];
                }
              }
            }
          }

          if (!dateStr) {
            errorCount++;
            return;
          }

          // Parse transactionType
          const typeRaw = valJenis ? String(valJenis).trim().toLowerCase() : '';
          let type: 'Dana Masuk' | 'Pengeluaran' = 'Pengeluaran';
          if (
            typeRaw.includes('masuk') || 
            typeRaw.includes('debit') || 
            typeRaw.includes('pemasukan') || 
            typeRaw.includes('in') || 
            typeRaw.includes('income')
          ) {
            type = 'Dana Masuk';
          } else if (
            typeRaw.includes('keluar') || 
            typeRaw.includes('kredit') || 
            typeRaw.includes('pengeluaran') || 
            typeRaw.includes('out') || 
            typeRaw.includes('expense') || 
            typeRaw.includes('spending')
          ) {
            type = 'Pengeluaran';
          } else {
            errorCount++;
            return;
          }

          // Parse amount (robust clean for currency symbols and thousand separator dots)
          let amt = 0;
          if (typeof valNominal === 'number') {
            amt = valNominal;
          } else if (valNominal) {
            const cleanStr = String(valNominal)
              .replace(/Rp/gi, '')
              .replace(/\s/g, '')
              .replace(/\./g, ''); // hapus titik ribuan
            amt = parseFloat(cleanStr.replace(/,/g, '.')); // ubah koma ke titik untuk desimal jika ada
          }

          if (isNaN(amt) || amt <= 0) {
            errorCount++;
            return;
          }

          // Parse category (find or add new category)
          let catId = '';
          const categoryName = valKategori ? valKategori.toString().trim() : '';
          if (categoryName && categoryName !== '-') {
            const foundCategory = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
            if (foundCategory) {
              catId = foundCategory.id;
            } else {
              // Automatically create the category with default attributes
              const newCat = addCategory({
                name: categoryName,
                icon: 'Wallet',
                color: '#3B82F6',
                active: true
              });
              catId = newCat.id;
            }
          }

          const desc = valKeterangan ? valKeterangan.toString().trim() : '';
          const note = valCatatan ? valCatatan.toString().trim() : '';

          if (!desc) {
            errorCount++;
            return;
          }

          // Push to import list
          listToImport.push({
            transactionDate: dateStr,
            transactionType: type,
            categoryId: catId || undefined,
            description: desc,
            amount: amt,
            note: note,
            rowIndex: index + 1 // Add index (1-based row number) relative to current import batch
          });
        });

        if (listToImport.length > 0) {
          addCashflows(listToImport);
          importedCount = listToImport.length;
        }

        showAlert(
          'Import Selesai',
          `Berhasil mengimport ${importedCount} data cashflow. ${errorCount > 0 ? `Gagal/diabaikan ${errorCount} baris karena data tidak valid.` : ''}`,
          errorCount > 0 ? 'info' : 'success'
        );
        
        // Reset file input value
        e.target.value = '';
      } catch (err) {
        console.error(err);
        showAlert('Import Gagal', 'Gagal membaca file Excel. Pastikan format file benar.', 'error');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Total Dana Masuk</span>
            <h3 className="text-xl font-bold text-green-600 mt-1">{formatRupiah(totals.masuk)}</h3>
          </div>
          <div className="p-3 bg-green-50 rounded-xl text-green-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Total Pengeluaran</span>
            <h3 className="text-xl font-bold text-red-600 mt-1">{formatRupiah(totals.keluar)}</h3>
          </div>
          <div className="p-3 bg-red-50 rounded-xl text-red-600">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Saldo Proyek</span>
            <h3 className="text-xl font-bold text-blue-600 mt-1">{formatRupiah(totals.saldo)}</h3>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Left Side Filter & Table, Right Side Category Summary */}
      <div className="flex flex-col gap-6">
        {/* Table & Filters */}
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search input */}
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari deskripsi transaksi..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="import-excel-file"
                  accept=".xlsx, .xls"
                  className="hidden"
                  onChange={handleImportExcel}
                />
                <button
                  onClick={exportExcel}
                  className="inline-flex items-center justify-center p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 text-sm font-semibold transition-colors gap-1.5"
                  title="Export Excel"
                >
                  <FileSpreadsheet className="w-4 h-4 text-green-600" />
                  <span className="hidden sm:inline">Excel</span>
                </button>
                <button
                  onClick={exportPDF}
                  className="inline-flex items-center justify-center p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 text-sm font-semibold transition-colors gap-1.5"
                  title="Export PDF"
                >
                  <FileText className="w-4 h-4 text-red-500" />
                  <span className="hidden sm:inline">PDF</span>
                </button>
                <button
                  onClick={() => document.getElementById('import-excel-file')?.click()}
                  className="inline-flex items-center justify-center p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 text-sm font-semibold transition-colors gap-1.5"
                  title="Import Excel"
                >
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span className="hidden sm:inline">Import</span>
                </button>
                <a
                  href="/template-import-cashflow.xlsx"
                  download
                  className="inline-flex items-center justify-center p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-500 hover:text-slate-700 text-xs font-semibold transition-colors"
                  title="Unduh Template Excel"
                >
                  Unduh Template
                </a>
                <button
                  onClick={handleOpenAdd}
                  className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Input Transaksi
                </button>
              </div>
            </div>

            {/* Filter Options */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
              {/* Type filter */}
              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                className="px-2 py-1.5 border border-slate-200 rounded-lg text-base sm:text-xs focus:outline-none bg-white text-slate-700"
              >
                <option value="">Semua Jenis</option>
                <option value="Dana Masuk">Dana Masuk</option>
                <option value="Pengeluaran">Pengeluaran</option>
              </select>

              {/* Category filter */}
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                className="px-2 py-1.5 border border-slate-200 rounded-lg text-base sm:text-xs focus:outline-none bg-white text-slate-700"
              >
                <option value="">Semua Kategori</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              {/* Date Start & End */}
              <div className="flex gap-1 items-center">
                <input
                  type="date"
                  value={dateFilterStart}
                  onChange={(e) => { setDateFilterStart(e.target.value); setCurrentPage(1); }}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-base sm:text-[10px] focus:outline-none bg-white text-slate-600"
                  placeholder="Mulai"
                />
                <span className="text-slate-400 text-xs">-</span>
                <input
                  type="date"
                  value={dateFilterEnd}
                  onChange={(e) => { setDateFilterEnd(e.target.value); setCurrentPage(1); }}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-base sm:text-[10px] focus:outline-none bg-white text-slate-600"
                  placeholder="Sampai"
                />
              </div>

              {(searchTerm || typeFilter || categoryFilter || dateFilterStart || dateFilterEnd) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setTypeFilter('');
                    setCategoryFilter('');
                    setDateFilterStart('');
                    setDateFilterEnd('');
                    setCurrentPage(1);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold text-left self-center"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </div>

          {/* Cashflow Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left border-collapse">
                  <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider sticky top-0 backdrop-blur-md z-10">
                    {isBulkEditMode && (
                      <th className="py-4 px-4 text-center w-12">
                        <input
                          type="checkbox"
                          checked={paginatedCashflows.length > 0 && paginatedCashflows.every(cf => selectedIds.includes(cf.id))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const newSelections = [...selectedIds];
                              paginatedCashflows.forEach(cf => {
                                if (!newSelections.includes(cf.id)) {
                                  newSelections.push(cf.id);
                                }
                              });
                              setSelectedIds(newSelections);
                            } else {
                              const paginatedIds = paginatedCashflows.map(cf => cf.id);
                              setSelectedIds(selectedIds.filter(id => !paginatedIds.includes(id)));
                            }
                          }}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                        />
                      </th>
                    )}
                    <th className="py-4 px-6 font-semibold w-28">
                      <button onClick={() => { setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc'); }} className="flex items-center gap-1 hover:text-slate-800">
                        Tanggal <ArrowUpDown className="w-3.5 h-3.5" />
                      </button>
                    </th>
                    <th className="py-4 px-4 font-semibold w-28">Jenis</th>
                    <th className="py-4 px-4 font-semibold w-36">Kategori</th>
                    <th className="py-4 px-4 font-semibold w-96">Keterangan</th>
                    <th className="py-4 px-4 font-semibold text-right w-36">Debit</th>
                    <th className="py-4 px-4 font-semibold text-right w-36">Kredit</th>
                    <th className="py-4 px-4 font-semibold text-right w-40">Total Saldo</th>
                    <th className="py-4 px-6 font-semibold text-right w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {paginatedCashflows.map((cf) => {
                    let bgClass = "bg-white";
                    if (cf.transactionType === 'Dana Masuk') {
                      bgClass = "bg-green-50/40 hover:bg-green-50/60";
                    } else if (cf.categoryId === 'c4') {
                      bgClass = "bg-slate-100/50 hover:bg-slate-100/80";
                    } else {
                      bgClass = "hover:bg-slate-50/50";
                    }

                    const categoryName = categories.find(c => c.id === cf.categoryId)?.name || '-';

                    return (
                      <tr key={cf.id} className={`${bgClass} transition-colors`}>
                        {isBulkEditMode && (
                          <td className="py-4 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(cf.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedIds([...selectedIds, cf.id]);
                                } else {
                                  setSelectedIds(selectedIds.filter(id => id !== cf.id));
                                }
                              }}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            />
                          </td>
                        )}
                        <td className="py-4 px-6 text-slate-500 font-medium whitespace-nowrap">
                          {new Date(cf.transactionDate).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            cf.transactionType === 'Dana Masuk' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {cf.transactionType}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-700 font-medium truncate max-w-[140px]" title={categoryName}>
                          {categoryName}
                        </td>
                        <td className="py-4 px-4 text-slate-800 font-medium break-words max-w-[384px]">
                          {cf.description}
                          {cf.note && <span className="text-xs text-slate-400 block break-words">{cf.note}</span>}
                        </td>
                        <td className="py-4 px-4 text-right font-bold text-green-600 whitespace-nowrap">
                          {cf.transactionType === 'Dana Masuk' ? formatRupiah(cf.amount) : '-'}
                        </td>
                        <td className="py-4 px-4 text-right font-bold text-red-600 whitespace-nowrap">
                          {cf.transactionType === 'Pengeluaran' ? formatRupiah(cf.amount) : '-'}
                        </td>
                        <td className="py-4 px-4 text-right font-bold text-slate-700 whitespace-nowrap">
                          {formatRupiah(cf.runningBalance || 0)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => handleOpenEdit(cf)}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(cf.id)}
                              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {processedCashflows.length === 0 && (
                    <tr>
                      <td colSpan={isBulkEditMode ? 9 : 8} className="py-16 text-center text-slate-400 font-medium">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                            <Search className="w-6 h-6 text-slate-300" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-sm font-bold text-slate-700">Tidak ditemukan data transaksi</p>
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border-t border-slate-100 bg-slate-50/30">
              <div className="flex items-center gap-2 order-2 sm:order-1">
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
              <div className="flex-1 flex justify-end order-1 sm:order-2">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={processedCashflows.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={setItemsPerPage}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Side: Category Summary (Laporan Excel Lama) */}
        <div className="w-full">
          {(!categoryFilter || categoryFilter === '') ? (
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Rekap Pengeluaran</h3>
                  <p className="text-[11px] text-slate-400 font-semibold">Tabel rekapitulasi kategori (Model Excel Lama)</p>
                </div>
                <button
                  onClick={() => {
                    setIsManagingCategories(!isManagingCategories);
                    setEditingCategoryId(null);
                    setFrontpageNewCategoryName('');
                  }}
                  className="text-xs text-blue-600 font-bold hover:underline"
                >
                  {isManagingCategories ? 'Selesai' : 'Kelola'}
                </button>
              </div>

              {isManagingCategories ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Tambah Kategori Baru</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={frontpageNewCategoryName}
                        onChange={(e) => setFrontpageNewCategoryName(e.target.value)}
                        placeholder="Nama kategori..."
                        className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <button
                        onClick={() => {
                          if (!frontpageNewCategoryName.trim()) return;
                          addCategory({
                            name: frontpageNewCategoryName,
                            icon: 'Tag',
                            color: '#3b82f6',
                            active: true
                          });
                          setFrontpageNewCategoryName('');
                        }}
                        className="px-3 py-1.5 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700"
                      >
                        Tambah
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Daftar Kategori</p>
                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden text-xs">
                      {categories.map((c) => (
                        <div key={c.id} className="p-2 flex justify-between items-center hover:bg-slate-50/50">
                          {editingCategoryId === c.id ? (
                            <div className="flex gap-2 w-full">
                              <input
                                type="text"
                                value={editingCategoryName}
                                onChange={(e) => setEditingCategoryName(e.target.value)}
                                className="flex-1 px-2 py-1 border border-slate-200 rounded-lg text-base sm:text-xs"
                              />
                              <button
                                onClick={() => {
                                  if (!editingCategoryName.trim()) return;
                                  updateCategory(c.id, { name: editingCategoryName });
                                  setEditingCategoryId(null);
                                }}
                                className="px-2 py-1 bg-green-600 text-white rounded text-[10px]"
                              >
                                Simpan
                              </button>
                              <button
                                onClick={() => setEditingCategoryId(null)}
                                className="px-2 py-1 bg-slate-400 text-white rounded text-[10px]"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="font-semibold text-slate-700">{c.name}</span>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => {
                                    setEditingCategoryId(c.id);
                                    setEditingCategoryName(c.name);
                                  }}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    showConfirm('Hapus Kategori', `Hapus kategori "${c.name}"?`, () => {
                                      const success = deleteCategory(c.id);
                                      if (!success) {
                                        showAlert('Gagal Menghapus', 'Gagal menghapus! Kategori ini sedang digunakan dalam transaksi Cashflow.', 'error');
                                      }
                                    });
                                  }}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden text-xs">
                  {categorySummaryList.map((item) => (
                    <div key={item.categoryName} className="p-3 flex justify-between items-center hover:bg-slate-50/50">
                      <span className="font-semibold text-slate-600">{item.categoryName}</span>
                      <span className="font-bold text-slate-700">{formatRupiah(item.total)}</span>
                    </div>
                  ))}
                  <div className="p-3 bg-slate-50/70 flex justify-between items-center font-bold text-slate-800 border-t border-slate-200">
                    <span>Grand Total</span>
                    <span className="text-blue-600">{formatRupiah(grandTotalSummary)}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-center text-xs py-12 text-slate-400">
              Pilih filter &quot;Semua Kategori&quot; untuk memunculkan Rekapitulasi Kategori.
            </div>
          )}
        </div>
      </div>

      {/* CRUD Modal */}
      {mounted && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              {/* Modal Dialog */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden z-10"
              >
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                    <h3 className="text-base font-bold text-slate-800">
                      {modalMode === 'add' ? 'Input Transaksi Proyek' : 'Edit Transaksi Proyek'}
                    </h3>
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ scrollbarGutter: 'stable' }}>
                    {formError && (
                      <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-100 flex items-center gap-2">
                        <AlertTriangle className="w-4.5 h-4.5 flex-shrink-0" />
                        {formError}
                      </div>
                    )}

                    {/* Transaction Date */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Tanggal Transaksi</label>
                      <input
                        type="date"
                        value={transactionDate}
                        onChange={(e) => setTransactionDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Transaction Type */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Jenis Transaksi</label>
                      <select
                        value={transactionType}
                        onChange={(e) => setTransactionType(e.target.value as 'Dana Masuk' | 'Pengeluaran')}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                      >
                        <option value="Dana Masuk">Dana Masuk (Income)</option>
                        <option value="Pengeluaran">Pengeluaran (Expense)</option>
                      </select>
                    </div>

                    {transactionType === 'Dana Masuk' ? (
                      /* DANA MASUK FORM OPTIONS */
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Keterangan</label>
                          <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Keterangan pemasukan..."
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                      </div>
                    ) : (
                      /* PENGELUARAN FORM OPTIONS */
                      <div className="space-y-4 p-4 border border-slate-100 rounded-2xl bg-slate-50/40">
                        {/* Category */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Kategori</label>
                            <button
                              type="button"
                              onClick={() => {
                                setIsAddingCategory(!isAddingCategory);
                                setNewCategoryName('');
                              }}
                              className="text-xs text-blue-600 font-bold hover:underline"
                            >
                              {isAddingCategory ? 'Batal' : '+ Kategori Baru'}
                            </button>
                          </div>
                          {isAddingCategory ? (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Nama Kategori Baru..."
                                className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (!newCategoryName.trim()) return;
                                  const created = addCategory({
                                    name: newCategoryName,
                                    icon: 'Tag',
                                    color: '#3b82f6',
                                    active: true
                                  });
                                  setCategoryId(created.id);
                                  setIsAddingCategory(false);
                                  setNewCategoryName('');
                                }}
                                className="px-3 py-1.5 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700"
                              >
                                Simpan
                              </button>
                            </div>
                          ) : (
                            <select
                              value={categoryId}
                              onChange={(e) => setCategoryId(e.target.value)}
                              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                            >
                              {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Keterangan</label>
                          <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Keterangan pengeluaran..."
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                      </div>
                    )}

                    {/* Amount (Nominal) */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Nominal (Rupiah)</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-sm font-bold text-slate-500">Rp</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9.]*"
                          value={displayAmount}
                          onChange={(e) => {
                            const cleanVal = e.target.value.replace(/[^0-9]/g, '');
                            const numVal = cleanVal ? parseInt(cleanVal, 10) : 0;
                            setAmount(numVal);
                            setDisplayAmount(formatRupiahInput(numVal));
                          }}
                          placeholder="0"
                          className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-white flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm shadow-blue-500/10 transition-colors"
                    >
                      Simpan Transaksi
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
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] w-[90%] max-w-md bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border border-slate-800"
          >
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 font-medium">Bulk Action</span>
              <span className="text-sm font-bold">{selectedIds.length} item dipilih</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedIds([])}
                className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  showConfirm(
                    'Hapus Terpilih',
                    `Apakah Anda yakin ingin menghapus ${selectedIds.length} transaksi terpilih?`,
                    () => {
                      deleteCashflows(selectedIds);
                      setSelectedIds([]);
                    }
                  );
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
