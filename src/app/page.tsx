'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { DashboardView } from '@/components/DashboardView';
import { MaterialView } from '@/components/MaterialView';
import { PaymentView } from '@/components/PaymentView';
import { CashflowView } from '@/components/CashflowView';
import { CashflowGreenHouseView } from '@/components/CashflowGreenHouseView';
import { PettyCashView } from '@/components/PettyCashView';
import { LoginView } from '@/components/LoginView';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

export default function Home() {
  const { isAuthenticated, isDataLoading, dataLoadError, retryDataLoad } = useApp();
  const [activeTab, setActiveTabState] = useState('dashboard');

  useEffect(() => {
    if (!isAuthenticated) return;
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && ['dashboard', 'material', 'payment', 'cashflow', 'cashflow-green-house', 'pettycash'].includes(tab)) {
        setActiveTabState(tab);
      } else {
        setActiveTabState('dashboard');
      }
    };

    handleUrlChange();

    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [isAuthenticated]);

  const setActiveTab = (newTab: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set('tab', newTab);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({ tab: newTab }, '', newUrl);
    setActiveTabState(newTab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView setActiveTab={setActiveTab} />;
      case 'material':
        return <MaterialView />;
      case 'payment':
        return <PaymentView />;
      case 'cashflow':
        return <CashflowView />;
      case 'cashflow-green-house':
        return <CashflowGreenHouseView />;
      case 'pettycash':
        return <PettyCashView />;
      default:
        return <DashboardView setActiveTab={setActiveTab} />;
    }
  };

  if (isDataLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
          <Loader2 className="w-10 h-10 mx-auto text-blue-600 animate-spin" />
          <h1 className="mt-4 text-lg font-bold text-slate-800">Memuat data project...</h1>
          <p className="mt-1 text-sm text-slate-500">Menghubungkan ke Supabase</p>
        </div>
      </main>
    );
  }

  if (dataLoadError) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-bold text-slate-800">Data project gagal dimuat</h1>
          <p className="mt-2 text-sm text-slate-500">Periksa koneksi atau konfigurasi Supabase, lalu coba lagi.</p>
          <p className="mt-3 rounded-xl bg-red-50 p-3 text-left text-xs text-red-700 break-words">{dataLoadError}</p>
          <button
            type="button"
            onClick={retryDataLoad}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
        </div>
      </main>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!isAuthenticated ? (
        <motion.div
          key="login"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="w-full h-full"
        >
          <LoginView />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="w-full h-full"
        >
          <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="h-full w-full"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </MainLayout>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
