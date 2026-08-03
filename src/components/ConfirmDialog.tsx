'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

type DialogVariant = 'confirm' | 'success' | 'error' | 'info';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  variant?: DialogVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onClose: () => void;
}

const variantConfig: Record<DialogVariant, {
  icon: React.ReactNode;
  iconBg: string;
  confirmBtnClass: string;
}> = {
  confirm: {
    icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
    iconBg: 'bg-amber-50',
    confirmBtnClass: 'bg-red-600 hover:bg-red-700 text-white',
  },
  success: {
    icon: <CheckCircle2 className="w-6 h-6 text-green-600" />,
    iconBg: 'bg-green-50',
    confirmBtnClass: 'bg-green-600 hover:bg-green-700 text-white',
  },
  error: {
    icon: <XCircle className="w-6 h-6 text-red-600" />,
    iconBg: 'bg-red-50',
    confirmBtnClass: 'bg-red-600 hover:bg-red-700 text-white',
  },
  info: {
    icon: <Info className="w-6 h-6 text-blue-600" />,
    iconBg: 'bg-blue-50',
    confirmBtnClass: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  variant = 'confirm',
  confirmLabel,
  cancelLabel,
  onConfirm,
  onClose,
}) => {
  const config = variantConfig[variant];
  const isAlertOnly = !onConfirm;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-100 z-10 overflow-hidden"
          >
            <div className="p-6 text-center">
              <div className={`mx-auto w-12 h-12 rounded-full ${config.iconBg} flex items-center justify-center mb-4`}>
                {config.icon}
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{message}</p>
            </div>
            <div className="px-6 pb-5 flex gap-3">
              {!isAlertOnly && (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  {cancelLabel || 'Batal'}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (onConfirm) onConfirm();
                  onClose();
                }}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${config.confirmBtnClass}`}
              >
                {confirmLabel || (isAlertOnly ? 'OK' : 'Hapus')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
