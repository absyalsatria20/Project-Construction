'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp, Material } from '@/context/AppContext';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  ArrowUpDown, 
  Check, 
  X,
  AlertTriangle,
  Calendar
} from 'lucide-react';

import { ConfirmDialog } from './ConfirmDialog';
import { Pagination } from './Pagination';

export const MaterialView: React.FC = () => {
  const { 
    materials, 
    addMaterial, 
    updateMaterial, 
    deleteMaterial, 
    itemsPerPage, 
    setItemsPerPage,
    openMaterialModal,
    setOpenMaterialModal,
    deleteMaterials
  } = useApp();

  // Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  // Sorting State
  const [sortField, setSortField] = useState<keyof Material>('itemName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination State
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
  const [modalMode, setModalMode] = useState<'add' | 'edit-request' | 'edit-receipt' | 'view'>('add');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  // Form State
  const [itemName, setItemName] = useState('');
  const [unit, setUnit] = useState('');
  const [quantityRequested, setQuantityRequested] = useState<number>(0);
  const [requestDate, setRequestDate] = useState('');
  
  // Receipt State
  const [receiveDate, setReceiveDate] = useState('');
  const [quantityReceived, setQuantityReceived] = useState<number>(0);
  const [verification, setVerification] = useState(true);
  const [note, setNote] = useState('');

  // Form Error State
  const [error, setError] = useState('');

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

  const closeDialog = () => {
    setDialogState(prev => ({ ...prev, isOpen: false }));
  };

  // Reset form
  const resetForm = React.useCallback(() => {
    setItemName('');
    setUnit('');
    setQuantityRequested(0);
    setRequestDate('');
    
    setQuantityReceived(0);
    setReceiveDate('');
    setVerification(true);
    setNote('');
    setError('');
  }, []);

  const handleOpenAdd = React.useCallback(() => {
    resetForm();
    setModalMode('add');
    setIsModalOpen(true);
  }, [resetForm]);

  useEffect(() => {
    if (openMaterialModal) {
      handleOpenAdd();
      setOpenMaterialModal(false);
    }
  }, [openMaterialModal, handleOpenAdd, setOpenMaterialModal]);

  const handleOpenEditRequest = (material: Material) => {
    setSelectedMaterial(material);
    setItemName(material.itemName);
    setUnit(material.unit);
    setQuantityRequested(material.quantityRequested);
    setRequestDate(material.requestDate);
    
    setModalMode('edit-request');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEditReceipt = (material: Material) => {
    setSelectedMaterial(material);
    setItemName(material.itemName);
    setUnit(material.unit);
    setQuantityRequested(material.quantityRequested);
    setRequestDate(material.requestDate);
    
    // Reset form penerimaan baru
    setQuantityReceived(0);
    setReceiveDate('');
    setVerification(true);
    setNote('');
    
    setModalMode('edit-receipt');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenView = (material: Material) => {
    setSelectedMaterial(material);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    showConfirm('Hapus Material', 'Apakah Anda yakin ingin menghapus data material ini?', () => {
      deleteMaterial(id);
    });
  };

  const handleDeleteReceipt = (receiptId: string) => {
    if (!selectedMaterial) return;
    
    showConfirm('Hapus Penerimaan', 'Apakah Anda yakin ingin menghapus riwayat penerimaan ini?', () => {
      const updatedReceipts = selectedMaterial.receipts.filter(r => r.id !== receiptId);
      const updatedQuantityReceived = updatedReceipts.reduce((sum, r) => sum + r.quantityReceived, 0);
      
      const payload: Partial<Material> = {
        quantityReceived: updatedQuantityReceived,
        receipts: updatedReceipts
      };
      
      // Update state local untuk view mode saat ini agar UI langsung refresh
      setSelectedMaterial({
        ...selectedMaterial,
        ...payload
      });
      
      updateMaterial(selectedMaterial.id, payload);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!itemName.trim()) {
      setError('Nama Item wajib diisi.');
      return;
    }
    if (!unit.trim()) {
      setError('Satuan wajib diisi.');
      return;
    }
    if (quantityRequested <= 0) {
      setError('Jumlah Pengajuan harus lebih besar dari 0.');
      return;
    }
    if (!requestDate) {
      setError('Tanggal Pengajuan wajib diisi.');
      return;
    }
    if (quantityReceived < 0) {
      setError('Jumlah Diterima tidak boleh negatif.');
      return;
    }
    
    // Total Diterima harus dihitung dengan mempertimbangkan receipts sebelumnya (khusus edit)
    const existingReceived = modalMode === 'edit-receipt' && selectedMaterial ? 
      selectedMaterial.receipts.reduce((acc, curr) => acc + curr.quantityReceived, 0) : 0;
      
    if (modalMode !== 'edit-request' && existingReceived + quantityReceived > quantityRequested) {
      setError(`Jumlah Diterima tidak boleh melebihi Jumlah Pengajuan. Sisa kuota: ${quantityRequested - existingReceived}`);
      return;
    }

      // Validasi Tambahan untuk "Tambah Penerimaan Baru"
      if (modalMode !== 'edit-request' && quantityReceived > 0) {
        if (!receiveDate) {
          setError('Tanggal Penerimaan wajib diisi jika kuantitas diterima lebih dari 0.');
          return;
        }
        if (!verification && !note.trim()) {
          setError('Catatan wajib diisi jika material "Tidak Sesuai".');
          return;
        }
      }

    const payload: Partial<Material> & Omit<Material, 'id' | 'status'> = {
      itemName,
      unit,
      quantityRequested,
      requestDate,
      quantityReceived: 0,
      receipts: []
    };

    if (modalMode === 'add') {
      const receipts = quantityReceived > 0 ? [{
        id: 'mr_' + Math.random().toString(36).substr(2, 9),
        receiveDate,
        quantityReceived: quantityReceived || 0,
        verification,
        note
      }] : [];
      payload.quantityReceived = quantityReceived || 0;
      payload.receipts = receipts;
      
      addMaterial(payload as Omit<Material, 'id' | 'status'>);
    } else if (modalMode === 'edit-request' && selectedMaterial) {
      updateMaterial(selectedMaterial.id, payload);
    } else if (modalMode === 'edit-receipt' && selectedMaterial) {
      // Menambah receipt baru
      const receipts = [...selectedMaterial.receipts];
      let newTotalReceived = existingReceived;
      
      if (quantityReceived > 0) {
        receipts.push({
          id: 'mr_' + Math.random().toString(36).substr(2, 9),
          receiveDate,
          quantityReceived: quantityReceived,
          verification,
          note
        });
        newTotalReceived += quantityReceived;
      }
      
      payload.quantityReceived = newTotalReceived;
      payload.receipts = receipts;
      
      updateMaterial(selectedMaterial.id, payload);
    }

    setIsModalOpen(false);
    resetForm();
  };

  // Sorting Handler
  const handleSort = (field: keyof Material) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Process data (Search, Filter, Sort, Pagination)
  const processedMaterials = useMemo(() => {
    let result = [...materials];

    // Search
    if (searchTerm) {
      result = result.filter(m => 
        m.itemName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status Filter
    if (statusFilter) {
      result = result.filter(m => m.status === statusFilter);
    }

    // Date Filter
    if (dateFilter) {
      result = result.filter(m => m.requestDate === dateFilter);
    }

    // Sort
    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
        return sortDirection === 'asc'
          ? (aVal === bVal ? 0 : aVal ? -1 : 1)
          : (aVal === bVal ? 0 : aVal ? 1 : -1);
      }

      return 0;
    });

    return result;
  }, [materials, searchTerm, statusFilter, dateFilter, sortField, sortDirection]);

  // Paginated data
  const paginatedMaterials = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedMaterials.slice(startIndex, startIndex + itemsPerPage);
  }, [processedMaterials, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedMaterials.length / itemsPerPage) || 1;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Complete':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-green-50 text-green-700 rounded-full border border-green-200">Complete</span>;
      case 'Partial':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-700 rounded-full border border-amber-200">Partial</span>;
      case 'Waiting':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-600 rounded-full border border-slate-200">Waiting</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search input */}
          <div className="relative w-full lg:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari material..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 h-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 transition-all"
            />
          </div>

          {/* Action Button */}
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center h-10 px-5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Tambah Material
          </button>
        </div>

        {/* Filter Options */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 pt-4 border-t border-slate-100">
          {/* Filter Status */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="w-full md:w-48 h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-700 font-medium cursor-pointer transition-all"
          >
            <option value="">Semua Status</option>
            <option value="Complete">Complete</option>
            <option value="Partial">Partial</option>
            <option value="Waiting">Waiting</option>
          </select>

          {/* Filter Date */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
            className="w-full md:w-48 h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-600 transition-all"
          />

          {(searchTerm || statusFilter || dateFilter) && (
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter(''); setDateFilter(''); }}
              className="text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors self-center px-2 py-1 hover:bg-blue-50 rounded-lg whitespace-nowrap"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider sticky top-0 backdrop-blur-md z-10">
                {isBulkEditMode && (
                  <th className="py-4 px-4 text-center w-12">
                    <input
                      type="checkbox"
                      checked={paginatedMaterials.length > 0 && paginatedMaterials.every(m => selectedIds.includes(m.id))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const newSelections = [...selectedIds];
                          paginatedMaterials.forEach(m => {
                            if (!newSelections.includes(m.id)) {
                              newSelections.push(m.id);
                            }
                          });
                          setSelectedIds(newSelections);
                        } else {
                          const paginatedIds = paginatedMaterials.map(m => m.id);
                          setSelectedIds(selectedIds.filter(id => !paginatedIds.includes(id)));
                        }
                      }}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                  </th>
                  )}
                  <th className="py-4 px-4 font-semibold text-center w-36">
                    <button onClick={() => handleSort('requestDate')} className="flex items-center justify-center gap-1 mx-auto hover:text-slate-800">
                      Tgl Pengajuan <ArrowUpDown className="w-3.5 h-3.5" />
                    </button>
                  </th>
                  <th className="py-4 px-6 font-semibold w-96">
                  <button onClick={() => handleSort('itemName')} className="flex items-center gap-1 hover:text-slate-800">
                    Item Name <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </th>
                <th className="py-4 px-4 font-semibold text-center w-28">Satuan</th>
                <th className="py-4 px-4 font-semibold text-right w-28">Pengajuan</th>
                <th className="py-4 px-4 font-semibold text-right w-28">Surat Jalan</th>
                <th className="py-4 px-6 font-semibold text-center w-40">Progress</th>
                <th className="py-4 px-4 font-semibold text-center w-36">
                  <button onClick={() => handleSort('status')} className="flex items-center justify-center gap-1 mx-auto hover:text-slate-800">
                    Status <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </th>
                  <th className="py-4 px-4 font-semibold text-center w-36">Nota</th>
                <th className="py-4 px-6 font-semibold text-right w-28">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedMaterials.map((m) => {
                const progress = m.quantityRequested > 0 
                  ? (m.quantityReceived / m.quantityRequested) * 100 
                  : 0;

                return (
                  <tr key={m.id} className={`${selectedIds.includes(m.id) ? 'bg-blue-50/30' : ''} hover:bg-slate-50/50 transition-colors`}>
                    {isBulkEditMode && (
                      <td className="py-4 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(m.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds([...selectedIds, m.id]);
                            } else {
                              setSelectedIds(selectedIds.filter(id => id !== m.id));
                            }
                          }}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                        />
                      </td>
                    )}
                    <td className="py-4 px-4 text-center text-slate-500 font-medium whitespace-nowrap">
                      {m.requestDate ? (
                        <span className="inline-flex items-center gap-1 text-xs">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(m.requestDate).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800 break-words max-w-[384px]">{m.itemName}</td>
                    <td className="py-4 px-4 text-center text-slate-600 font-medium whitespace-nowrap">{m.unit}</td>
                    <td className="py-4 px-4 text-right font-semibold text-slate-700 whitespace-nowrap">{m.quantityRequested}</td>
                    <td className="py-4 px-4 text-right font-semibold text-slate-700 whitespace-nowrap">{m.quantityReceived}</td>
                    <td className="py-4 px-6">
                      <div className="w-full max-w-[120px] mx-auto space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                          <span>{progress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              progress === 100 ? 'bg-green-500' : progress > 0 ? 'bg-blue-500' : 'bg-slate-300'
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center whitespace-nowrap">{getStatusBadge(m.status)}</td>
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      {m.status === 'Waiting' ? (
                        <span className="text-slate-400 text-xs">Belum Tiba</span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-100">
                          {m.receipts && m.receipts.length} Penerimaan
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => handleOpenView(m)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenEditRequest(m)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Pengajuan"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenEditReceipt(m)}
                          className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                          title="Tambah Penerimaan"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(m.id)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {processedMaterials.length === 0 && (
                <tr>
                  <td colSpan={isBulkEditMode ? 10 : 9} className="py-16 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                        <Search className="w-6 h-6 text-slate-300" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-slate-700">Tidak ditemukan data material</p>
                        <p className="text-xs text-slate-400">Silakan periksa filter atau tambahkan data baru</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Bulk Selection Section */}
        <div className="border-t border-slate-100 bg-slate-50/30 p-4 relative">
          <div className="flex-1">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={processedMaterials.length}
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

      {/* CRUD / Detail Modal */}
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
                {/* Modal Content */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                  className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden z-10"
                >
                  <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    {/* Modal Header */}
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                      <h3 className="text-base font-bold text-slate-800">
                        {modalMode === 'add' ? 'Tambah Pengajuan' : modalMode === 'edit-request' ? 'Edit Pengajuan' : modalMode === 'edit-receipt' ? 'Tambah Penerimaan' : 'Detail Material'}
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
                      {error && (
                        <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-100 flex items-center gap-2">
                          <AlertTriangle className="w-4.5 h-4.5 flex-shrink-0" />
                          {error}
                        </div>
                      )}
  
                      {modalMode === 'view' && selectedMaterial ? (
                        // View Mode
                        <div className="space-y-4 text-sm">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-400 font-semibold mb-0.5">Nama Item</p>
                              <p className="font-semibold text-slate-800">{selectedMaterial.itemName}</p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-400 font-semibold mb-0.5">Satuan</p>
                              <p className="font-semibold text-slate-800">{selectedMaterial.unit}</p>
                            </div>
                          </div>
  
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-400 font-semibold mb-0.5">Jumlah Diajukan (Requested)</p>
                              <p className="font-semibold text-slate-800">{selectedMaterial.quantityRequested}</p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-400 font-semibold mb-0.5">Jumlah Diterima (Received)</p>
                              <p className="font-semibold text-slate-800">{selectedMaterial.quantityReceived}</p>
                            </div>
                          </div>
  
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-400 font-semibold mb-0.5">Status</p>
                              <p className="mt-0.5">{getStatusBadge(selectedMaterial.status)}</p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-400 font-semibold mb-0.5">Tanggal Pengajuan</p>
                              <p className="font-semibold text-slate-800">
                                {selectedMaterial.requestDate ? new Date(selectedMaterial.requestDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                              </p>
                            </div>
                          </div>
  
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-400 font-semibold mb-3">Riwayat Penerimaan</p>
                            {selectedMaterial.receipts && selectedMaterial.receipts.length > 0 ? (
                              <div className="space-y-3">
                                {selectedMaterial.receipts.map((receipt, idx) => (
                                  <div key={receipt.id || idx} className="border border-slate-200 rounded-lg p-3 bg-white">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-sm font-semibold text-slate-800">
                                        {new Date(receipt.receiveDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                      </span>
                                        <div className="flex items-center gap-3">
                                          <span className="text-sm font-bold text-blue-600">
                                            {receipt.quantityReceived} {selectedMaterial.unit}
                                          </span>
                                          <button 
                                            type="button"
                                            onClick={() => handleDeleteReceipt(receipt.id)}
                                            className="p-1 text-red-500 hover:bg-red-50 hover:text-red-700 rounded transition-colors"
                                            title="Hapus penerimaan ini"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mb-1">
                                      {receipt.verification ? (
                                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
                                          <Check className="w-3 h-3" /> Sesuai
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100">
                                          <X className="w-3 h-3" /> Tidak Sesuai
                                        </span>
                                      )}
                                    </div>
                                    {receipt.note && (
                                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                                        {receipt.note}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="font-semibold text-slate-500 text-sm">Belum ada riwayat penerimaan</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        // Add / Edit Mode
                          <div className="space-y-4">
                            {/* Item Name */}
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Nama Item <span className="text-red-500">*</span></label>
                              <input
                              type="text"
                              value={itemName}
                              onChange={(e) => setItemName(e.target.value)}
                              disabled={modalMode === 'edit-receipt'}
                              placeholder="Contoh: Semen Portland, Pasir Pasang"
                              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
                            />
                          </div>
  
                            <div className="grid grid-cols-2 gap-4">
                              {/* Unit */}
                              <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Satuan <span className="text-red-500">*</span></label>
                                <input
                                type="text"
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                disabled={modalMode === 'edit-receipt'}
                                placeholder="Zak, M3, dll"
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
                              />
                            </div>
  
                              {/* Request Date */}
                              <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Tanggal Pengajuan <span className="text-red-500">*</span></label>
                                <input
                                type="date"
                                value={requestDate}
                                onChange={(e) => setRequestDate(e.target.value)}
                                disabled={modalMode === 'edit-receipt'}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
                              />
                            </div>
                          </div>
  
                            <div className="grid grid-cols-2 gap-4">
                              {/* Quantity Requested */}
                              <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Jml Pengajuan <span className="text-red-500">*</span></label>
                                <input
                                type="number"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={quantityRequested || ''}
                                onChange={(e) => setQuantityRequested(Number(e.target.value))}
                                disabled={modalMode === 'edit-receipt'}
                                placeholder="0"
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
                            />
                          </div>

                          {/* Info Edit Total */}
                          {modalMode === 'edit-receipt' && selectedMaterial && (
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Total Diterima</label>
                              <div className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-base sm:text-sm bg-slate-50 text-slate-500 font-semibold">
                                {selectedMaterial.receipts.reduce((acc, curr) => acc + curr.quantityReceived, 0)} / {selectedMaterial.quantityRequested} {unit}
                              </div>
                            </div>
                          )}
                        </div>

                        {modalMode !== 'edit-request' && (
                          <>
                            <div className="relative py-4">
                              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-slate-200"></div>
                              </div>
                              <div className="relative flex justify-center">
                                <span className="bg-white px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                  {modalMode === 'add' ? 'Data Penerimaan Pertama (Opsional)' : 'Tambah Penerimaan Baru'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              {/* Receive Date */}
                              <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                                  Tanggal Terima {quantityReceived > 0 && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                  type="date"
                                  value={receiveDate}
                                  onChange={(e) => setReceiveDate(e.target.value)}
                                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                              </div>
                              
                              {/* Quantity Received */}
                              <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                                  {modalMode === 'add' ? 'Jml Diterima Awal' : 'Jml Diterima Baru'}
                                </label>
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={quantityReceived || ''}
                                  onChange={(e) => setQuantityReceived(Number(e.target.value))}
                                  placeholder="0"
                                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                              </div>
                            </div>
    
                            {/* Verification & Note */}
                            {quantityReceived > 0 && (
                              <div className="space-y-4 p-4 border border-slate-100 rounded-2xl bg-slate-50/50">
                                <div className="space-y-1">
                                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">Verifikasi Kelayakan Material</label>
                                  <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="verification"
                                        checked={verification === true}
                                        onChange={() => setVerification(true)}
                                        className="text-blue-600 focus:ring-blue-500"
                                      />
                                      <span className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                                        <Check className="w-4 h-4 text-green-600" /> Sesuai
                                      </span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="verification"
                                        checked={verification === false}
                                        onChange={() => setVerification(false)}
                                        className="text-blue-600 focus:ring-blue-500"
                                      />
                                      <span className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                                        <X className="w-4 h-4 text-red-600" /> Tidak Sesuai
                                      </span>
                                    </label>
                                  </div>
                                </div>
    
                                {/* Note */}
                                <div className="space-y-1">
                                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                                    Catatan {(!verification && quantityReceived > 0) && <span className="text-red-500">*</span>}
                                  </label>
                                  <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder={(!verification && quantityReceived > 0) ? "Wajib diisi jika material tidak sesuai spesifikasi..." : "Catatan tambahan mengenai kondisi fisik barang saat diterima..."}
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-20 resize-none"
                                  />
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Modal Footer */}
                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-5 py-2.5 border border-slate-200 text-slate-700 bg-white rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                      >
                        {modalMode === 'view' ? 'Tutup' : 'Batal'}
                      </button>
                      {modalMode !== 'view' && (
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
              <span className="text-sm font-bold">{selectedIds.length} item dipilih</span>
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
                    `Apakah Anda yakin ingin menghapus ${selectedIds.length} material terpilih?`,
                    () => {
                      deleteMaterials(selectedIds);
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
