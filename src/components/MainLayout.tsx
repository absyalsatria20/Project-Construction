'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Hammer, 
  CreditCard, 
  Landmark, 
  Menu, 
  X,
  LogOut,
  Wallet
} from 'lucide-react';
import { AccountView } from './AccountView';

import Image from 'next/image';

interface MainLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ activeTab, setActiveTab, children }) => {
  const { logout, currentUser } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  React.useEffect(() => {
    if (isMobileMenuOpen) {
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
  }, [isMobileMenuOpen]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'material', label: 'Monitoring Material', icon: Hammer },
    { id: 'payment', label: 'Rekap Pembayaran', icon: CreditCard },
    { id: 'cashflow', label: 'Cashflow', icon: Landmark },
    { id: 'pettycash', label: 'Petty Cash', icon: Wallet },
  ];

  return (
    <div className="flex min-h-screen w-full bg-slate-50 font-sans relative">
      {/* Edge drag area to trigger swipe open in Mobile */}
      <div 
        className="fixed left-0 top-0 bottom-0 w-8 z-40 lg:hidden"
        onTouchStart={(e) => {
          const startX = e.touches[0].clientX;
          const handleTouchMove = (moveEvent: TouchEvent) => {
            const currentX = moveEvent.touches[0].clientX;
            if (currentX - startX > 50) {
              setIsMobileMenuOpen(true);
              document.removeEventListener('touchmove', handleTouchMove);
            }
          };
          document.addEventListener('touchmove', handleTouchMove);
          document.addEventListener('touchend', () => {
            document.removeEventListener('touchmove', handleTouchMove);
          }, { once: true });
        }}
      />

      {/* Sidebar for Desktop */}
      <aside className={`hidden lg:flex lg:flex-col lg:h-screen bg-white border-r border-slate-200 transition-all duration-300 lg:sticky lg:top-0 relative ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}>
        <div className={`flex items-center h-16 border-b border-slate-200 bg-white transition-all duration-300 ${
          isCollapsed ? 'px-4 justify-center' : 'px-6'
        }`}>
          <div className="flex items-center justify-between gap-2 overflow-hidden w-full">
            {isCollapsed ? (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors flex-shrink-0 mx-auto"
                title="Buka Sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
            ) : (
                <>
                  <div className="flex items-center gap-2 whitespace-nowrap overflow-hidden">
                    <Image src="/OnelitoCons.png" alt="Logo" width={28} height={28} className="object-contain flex-shrink-0" />
                    <div className="overflow-hidden">
                      <h1 className="text-sm font-bold text-slate-800 leading-tight truncate">ONELITO PROJECT</h1>
                      <span className="text-[10px] text-slate-500 font-medium truncate block">Construction Project Bogor</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors flex-shrink-0 ml-auto"
                    title="Tutup Sidebar"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                </>
            )}
          </div>
        </div>
        <nav className={`flex-1 py-6 space-y-1 overflow-y-auto bg-white transition-all duration-300 ${
          isCollapsed ? 'px-2' : 'px-4'
        }`}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center w-full py-3 text-sm font-medium transition-all duration-200 rounded-xl group ${
                  isCollapsed ? 'justify-center px-0' : 'px-4'
                } ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600 shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 transition-colors ${
                  isCollapsed ? '' : 'mr-3'
                } ${
                  isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                }`} />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </button>
            );
          })}
        </nav>
        <div className={`border-t border-slate-200 bg-white transition-all duration-300 flex flex-col gap-1 ${
          isCollapsed ? 'p-2' : 'p-4'
        }`}>
          <button
            onClick={logout}
            className={`flex items-center w-full py-2.5 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 hover:text-red-800 rounded-xl transition-all ${
              isCollapsed ? 'justify-center px-0' : 'px-4'
            }`}
            title="Keluar Aplikasi"
          >
            <LogOut className={`w-4 h-4 ${isCollapsed ? '' : 'mr-3'}`} />
            {!isCollapsed && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer (Overlay & Menu) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm touch-none"
            />
            {/* Drawer Content */}
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={{ left: 0.1, right: 0.1 }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) {
                  setIsMobileMenuOpen(false);
                }
              }}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-4/5 max-w-xs h-full bg-white flex flex-col shadow-2xl z-10 touch-pan-x"
            >
                <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Image src="/OnelitoCons.png" alt="Logo" width={32} height={32} className="object-contain flex-shrink-0" />
                    <span className="font-bold text-slate-800">ONELITO CONS</span>
                  </div>
                  <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center w-full px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                        isActive 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-slate-200 flex flex-col gap-2">
                <button
                  onClick={logout}
                  className="flex items-center w-full px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  <span>Keluar</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 w-full min-h-screen">
        {/* Top Header */}
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200 sticky top-0 z-30 flex-shrink-0 w-full">
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 mr-3 text-slate-500 rounded-lg lg:hidden hover:bg-slate-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-bold text-slate-800">
              {menuItems.find(item => item.id === activeTab)?.label}
            </h2>
          </div>

          {/* Top Right: User Account Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsAccountOpen(!isAccountOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-50 border border-slate-200/60 transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-xs font-semibold text-slate-700 hidden sm:inline">{currentUser?.username}</span>
            </button>

            {isAccountOpen && (
              <>
                {/* Backdrop overlay to close when clicking outside */}
                <div className="fixed inset-0 z-40" onClick={() => setIsAccountOpen(false)} />
                
                {/* Dropdown Card */}
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50">
                  <AccountView onClose={() => setIsAccountOpen(false)} />
                </div>
              </>
            )}
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-4 lg:p-6 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
};
