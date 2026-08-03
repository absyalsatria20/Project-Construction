'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { User, Lock, CheckCircle, Eye, EyeOff, AlertCircle, Download, Upload } from 'lucide-react';

interface AccountViewProps {
  onClose?: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({ onClose }) => {
  const { currentUser, updateAccount, exportAllData, importAllData } = useApp();
  const [username, setUsername] = useState(currentUser.username);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const dataStr = exportAllData();
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `cpms_backup_${new Date().toISOString().slice(0,10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      setMessage('Backup data berhasil diunduh.');
    } catch {
      setError('Gagal mengekspor data.');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          const success = importAllData(event.target.result);
          if (success) {
            setMessage('Data berhasil direstore.');
          } else {
            setError('Gagal restore: format JSON salah.');
          }
        }
      };
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!username.trim()) {
      setError('Username tidak boleh kosong.');
      return;
    }

    if (password) {
      if (password.length < 4) {
        setError('Password minimal 4 karakter.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Konfirmasi password tidak cocok.');
        return;
      }
    }

    updateAccount(username, password || undefined);
    setMessage('Akun berhasil diperbarui.');
    setPassword('');
    setConfirmPassword('');
    if (onClose) {
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-800">Edit Akun</h3>
        <p className="text-[11px] text-slate-500">Perbarui username atau password login Anda.</p>
      </div>

      {message && (
        <div className="p-2.5 bg-green-50 border border-green-100 rounded-lg flex items-center gap-2 text-green-700 text-xs font-semibold">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-2.5 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Username</label>
          <div className="relative flex items-center">
            <User className="absolute left-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username baru"
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Password Baru</label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3 w-4 h-4 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password baru"
              className="w-full pl-9 pr-8 py-1.5 border border-slate-200 rounded-lg text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {password && (
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Konfirmasi Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Konfirmasi password"
                className="w-full pl-9 pr-8 py-1.5 border border-slate-200 rounded-lg text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-xs"
        >
          Simpan Perubahan
        </button>
      </form>

      <div className="border-t border-slate-100 pt-3 mt-3 space-y-2">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Backup / Restore Data</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="flex-1 py-1.5 px-3 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Backup
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-1.5 px-3 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            Restore
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};
