'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (size: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const getPages = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('...');
      }

      pages.push(totalPages);
    }
    return pages;
  };

  const startItem = totalItems === 0 ? 0 : Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1);
  const endItem = Math.min(totalItems, currentPage * itemsPerPage);

  return (
    <div className="py-2.5 flex flex-col md:flex-row items-center justify-between gap-4 select-none w-full">
      <div className="flex items-center gap-4">
        <p className="text-sm text-slate-500 font-semibold">
          Menampilkan <span className="font-bold text-slate-700">{startItem}-{endItem}</span> dari <span className="font-bold text-slate-700">{totalItems}</span> data
        </p>
        <select
          value={itemsPerPage}
          onChange={(e) => {
            onItemsPerPageChange(Number(e.target.value));
            onPageChange(1);
          }}
          className="h-8 px-2 border border-slate-200 rounded-lg text-xs focus:outline-none bg-white text-slate-700 font-bold cursor-pointer transition-all"
        >
          <option value={5}>5 / Halaman</option>
          <option value={10}>10 / Halaman</option>
          <option value={20}>20 / Halaman</option>
          <option value={50}>50 / Halaman</option>
          <option value={100}>100 / Halaman</option>
        </select>
      </div>
      <div className="flex items-center gap-1.5 md:absolute md:left-1/2 md:-translate-x-1/2">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {getPages().map((page, i) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-slate-400 font-medium">
                ...
              </span>
            );
          }
          return (
            <button
              key={`page-${page}`}
              onClick={() => onPageChange(page as number)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold border transition-all ${
                currentPage === page
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {page}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="w-20 hidden md:block" />
    </div>
  );
};
