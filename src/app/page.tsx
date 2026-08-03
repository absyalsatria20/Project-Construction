'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { DashboardView } from '@/components/DashboardView';
import { MaterialView } from '@/components/MaterialView';
import { PaymentView } from '@/components/PaymentView';
import { CashflowView } from '@/components/CashflowView';
import { LoginView } from '@/components/LoginView';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

export default function Home() {
  const { isAuthenticated } = useApp();
  const [activeTab, setActiveTabState] = useState('dashboard');

  useEffect(() => {
    if (!isAuthenticated) return;
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && ['dashboard', 'material', 'payment', 'cashflow'].includes(tab)) {
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
      default:
        return <DashboardView setActiveTab={setActiveTab} />;
    }
  };

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
