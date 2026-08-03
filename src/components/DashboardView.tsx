'use client';

import React, { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  FileText, 
  Hammer,
  ArrowUpRight
} from 'lucide-react';
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardViewProps {
  setActiveTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab }) => {
  const { 
    cashflows, 
    invoices, 
    payments, 
    vendors, 
    materials, 
    categories,
    setOpenMaterialModal,
    setOpenInvoiceModal,
    setOpenCashflowModal
  } = useApp();

  // Helper formatting Rupiah
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Calculations for Cards
  const stats = useMemo(() => {
    const totalDanaMasuk = cashflows
      .filter(cf => cf.transactionType === 'Dana Masuk')
      .reduce((sum, cf) => sum + cf.amount, 0);

    const totalPengeluaran = cashflows
      .filter(cf => cf.transactionType === 'Pengeluaran')
      .reduce((sum, cf) => sum + cf.amount, 0);

    const saldo = totalDanaMasuk - totalPengeluaran;

    // Hitung total invoice belum lunas
    let unpaidCount = 0;
    let unpaidAmount = 0;

    invoices.forEach(inv => {
      const invPayments = payments
        .filter(p => p.invoiceId === inv.id)
        .reduce((sum, p) => sum + p.amount, 0);
      const remaining = inv.totalInvoice - invPayments;
      if (remaining > 0) {
        unpaidCount++;
        unpaidAmount += remaining;
      }
    });

    const totalVendors = vendors.length;

    // Progress Material rata-rata
    const totalMaterials = materials.length;
    const avgProgress = totalMaterials > 0 
      ? materials.reduce((sum, m) => {
          const progress = (m.quantityReceived / m.quantityRequested) * 100;
          return sum + Math.min(progress, 100);
        }, 0) / totalMaterials
      : 0;

    return {
      totalDanaMasuk,
      totalPengeluaran,
      saldo,
      unpaidCount,
      unpaidAmount,
      totalVendors,
      avgProgress
    };
  }, [cashflows, invoices, payments, vendors, materials]);

  // Chart 1: Pengeluaran per Kategori
  const categoryChartData = useMemo(() => {
    const dataMap: { [key: string]: number } = {};
    
    // Inisialisasi kategori
    categories.forEach(cat => {
      dataMap[cat.name] = 0;
    });

    cashflows
      .filter(cf => cf.transactionType === 'Pengeluaran')
      .forEach(cf => {
        const cat = categories.find(c => c.id === cf.categoryId);
        const catName = cat ? cat.name : 'Operasional Lain';
        dataMap[catName] = (dataMap[catName] || 0) + cf.amount;
      });

    return Object.keys(dataMap)
      .map(key => ({
        name: key,
        value: dataMap[key]
      }))
      .filter(item => item.value > 0);
  }, [cashflows, categories]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6b7280'];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Dana Masuk */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-shadow hover:shadow-md"
        >
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Total Dana Masuk</span>
            <h3 className="text-2xl font-bold text-slate-800">{formatRupiah(stats.totalDanaMasuk)}</h3>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Dana proyek masuk
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl text-green-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Card 2: Pengeluaran */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-shadow hover:shadow-md"
        >
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Total Pengeluaran</span>
            <h3 className="text-2xl font-bold text-slate-800">{formatRupiah(stats.totalPengeluaran)}</h3>
            <p className="text-xs text-red-600 flex items-center gap-1">
              <TrendingDown className="w-3 h-3" /> Dana terpakai
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-xl text-red-600">
            <TrendingDown className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Card 3: Saldo Saat Ini */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-shadow hover:shadow-md"
        >
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Saldo Saat Ini</span>
            <h3 className="text-2xl font-bold text-slate-800">{formatRupiah(stats.saldo)}</h3>
            <p className="text-xs text-blue-600 flex items-center gap-1">
              <Wallet className="w-3 h-3" /> Saldo kas proyek
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl text-blue-600">
            <Wallet className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Card 4: Invoice Belum Lunas */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-shadow hover:shadow-md"
        >
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Invoice Belum Lunas</span>
            <h3 className="text-2xl font-bold text-slate-800">{formatRupiah(stats.unpaidAmount)}</h3>
            <p className="text-xs text-amber-600 flex items-center gap-1 font-medium">
              <FileText className="w-3 h-3" /> {stats.unpaidCount} invoice menunggu pembayaran
            </p>
          </div>
          <div className="p-4 bg-amber-50 rounded-xl text-amber-600">
            <FileText className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Card 5: Progress Material */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-shadow hover:shadow-md"
        >
          <div className="space-y-2 w-2/3">
            <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Progress Material</span>
            <h3 className="text-2xl font-bold text-slate-800">{stats.avgProgress.toFixed(1)}%</h3>
            
            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 mt-1">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${stats.avgProgress}%` }}
              ></div>
            </div>
          </div>
          <div className="p-4 bg-indigo-50 rounded-xl text-indigo-600">
            <Hammer className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Card 6: Quick Actions */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between transition-shadow hover:shadow-md"
        >
          <div className="mb-2">
            <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Quick Actions</span>
          </div>
          <div className="grid grid-cols-3 gap-2 w-full mt-1">
            <button
              onClick={() => {
                setActiveTab('material');
                setOpenMaterialModal(true);
              }}
              className="flex flex-col items-center justify-center py-2 px-1 text-center bg-blue-50 text-blue-600 rounded-xl font-medium text-xs transition-colors hover:bg-blue-100"
            >
              <Hammer className="w-4 h-4 mb-1" />
              <span>+ Material</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('payment');
                setOpenInvoiceModal(true);
              }}
              className="flex flex-col items-center justify-center py-2 px-1 text-center bg-emerald-50 text-emerald-600 rounded-xl font-medium text-xs transition-colors hover:bg-emerald-100"
            >
              <FileText className="w-4 h-4 mb-1" />
              <span>+ Invoice</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('cashflow');
                setOpenCashflowModal(true);
              }}
              className="flex flex-col items-center justify-center py-2 px-1 text-center bg-violet-50 text-violet-600 rounded-xl font-medium text-xs transition-colors hover:bg-violet-100"
            >
              <Wallet className="w-4 h-4 mb-1" />
              <span>+ Transaksi</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart: Pengeluaran per Kategori */}
        <motion.div 
          variants={itemVariants}
          className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 lg:col-span-1 flex flex-col justify-between"
        >
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Pengeluaran per Kategori</h3>
            <p className="text-xs text-slate-500 mb-4">Pembagian biaya berdasarkan pengeluaran riil</p>
          </div>
          <div className="h-56 relative flex items-center justify-center">
            {categoryChartData.length === 0 ? (
              <div className="text-sm text-slate-400">Belum ada pengeluaran</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Tooltip formatter={(value: any) => formatRupiah(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-4 space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {categoryChartData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span className="text-slate-600 truncate max-w-[120px]">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-700">{formatRupiah(item.value)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Transactions List */}
        <motion.div 
          variants={itemVariants}
          className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 lg:col-span-2 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800">Aktivitas Cashflow Terbaru</h3>
              <span className="text-xs font-semibold text-slate-400">Menampilkan 4 transaksi terakhir</span>
            </div>
            <div className="divide-y divide-slate-100">
              {[...cashflows]
                .sort((a, b) => {
                  const rowA = a.rowIndex || 0;
                  const rowB = b.rowIndex || 0;
                  return rowB - rowA;
                })
                .slice(0, 4)
                .map((cf) => (
                  <div key={cf.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${
                      cf.transactionType === 'Dana Masuk' 
                        ? 'bg-green-50 text-green-600' 
                        : cf.categoryId === 'c4'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-red-50 text-red-600'
                    }`}>
                      <ArrowUpRight className={`w-4 h-4 ${cf.transactionType === 'Dana Masuk' ? 'rotate-0' : 'rotate-90'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 leading-snug">{cf.description}</p>
                      <p className="text-xs text-slate-400 font-medium">
                        {new Date(cf.transactionDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {cf.note ? ` • ${cf.note}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${
                      cf.transactionType === 'Dana Masuk' ? 'text-green-600' : 'text-slate-800'
                    }`}>
                      {cf.transactionType === 'Dana Masuk' ? '+' : '-'} {formatRupiah(cf.amount)}
                    </p>
                  </div>
                </div>
              ))}
              {cashflows.length === 0 && (
                <div className="py-8 text-center text-sm text-slate-400">Belum ada aktivitas transaksi.</div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
