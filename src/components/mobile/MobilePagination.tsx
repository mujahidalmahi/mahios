'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSystemStore } from '@/stores/systemStore';

export interface MobilePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  itemName?: string;
  className?: string;
}

export default function MobilePagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  itemName = 'Items',
  className = '',
}: MobilePaginationProps) {
  const { playSound } = useSystemStore();

  if (totalPages <= 1) return null;

  const handlePageClick = (page: number) => {
    if (page === currentPage || page < 1 || page > totalPages) return;
    playSound('click');
    onPageChange(page);

    // Reset scroll on mobile app scrollable body
    if (typeof document !== 'undefined') {
      const scrollBody = document.getElementById('mobile-app-scroll-body');
      if (scrollBody) {
        scrollBody.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Generate numbered pages with smart truncation
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [];
    if (currentPage <= 3) {
      pages.push(1, 2, 3, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage, '...', totalPages);
    }
    return pages;
  };

  const pages = getPageNumbers();
  const startIdx = itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : null;
  const endIdx = itemsPerPage && totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : null;

  return (
    <div
      className={`mt-auto pt-4 flex flex-col gap-2.5 border-t border-slate-200 shrink-0 select-none ${className}`}
    >
      {/* Telemetry info row */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-1">
        <span>
          Page <strong className="text-slate-900 font-bold">{currentPage}</strong> of <strong className="text-slate-900 font-bold">{totalPages}</strong>
        </span>
        {startIdx && endIdx && totalItems !== undefined && (
          <span className="text-slate-400">
            {startIdx}–{endIdx} of {totalItems} {itemName}
          </span>
        )}
      </div>

      {/* Touch-Friendly Pagination Controls */}
      <div className="flex items-center justify-between gap-1.5">
        {/* Prev Button */}
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => handlePageClick(currentPage - 1)}
          className="px-3 py-2 bg-white text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-bold border border-slate-200 shadow-2xs flex items-center gap-1 active:scale-95 transition-all cursor-pointer min-h-[40px] shrink-0"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden xs:inline">Prev</span>
        </button>

        {/* Numbered Page Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto justify-center flex-1">
          {pages.map((p, idx) => {
            if (p === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-1 text-slate-400 font-mono text-xs"
                >
                  …
                </span>
              );
            }

            const pageNum = p as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => handlePageClick(pageNum)}
                className={`w-9 h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs font-black'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 active:scale-95'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => handlePageClick(currentPage + 1)}
          className="px-3 py-2 bg-white text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-bold border border-slate-200 shadow-2xs flex items-center gap-1 active:scale-95 transition-all cursor-pointer min-h-[40px] shrink-0"
          title="Next Page"
        >
          <span className="hidden xs:inline">Next</span>
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
