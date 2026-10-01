'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSystemStore } from '@/stores/systemStore';

export interface RetroPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  itemName?: string;
  className?: string;
}

export default function RetroPagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  itemName = 'Items',
  className = '',
}: RetroPaginationProps) {
  const { playSound } = useSystemStore();

  const handlePageClick = (page: number) => {
    if (page === currentPage || page < 1 || page > totalPages) return;
    playSound('click');
    onPageChange(page);
  };

  // Generate page numbers with intelligent truncation
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  const pages = getPageNumbers();

  const startIdx = itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : null;
  const endIdx = itemsPerPage && totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : null;

  return (
    <div
      className={`bg-[#c0c0c0] retro-box-outset p-1.5 flex flex-wrap items-center justify-between gap-2 text-black font-sans text-xs select-none shrink-0 ${className}`}
    >
      {/* Telemetry Info */}
      <div className="text-[11px] font-mono text-gray-700 px-1 flex items-center gap-1.5">
        <span>Page <strong className="text-[#000080]">{currentPage}</strong> of <strong>{totalPages}</strong></span>
        {startIdx && endIdx && totalItems !== undefined && (
          <span className="text-gray-500 hidden sm:inline">
            ({startIdx}–{endIdx} of {totalItems} {itemName})
          </span>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1">
        {/* Prev Button */}
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => handlePageClick(currentPage - 1)}
          className="retro-btn px-2 py-0.5 text-[11px] font-bold text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-0.5 cursor-pointer active:retro-btn-pressed"
          title="Previous Page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Prev</span>
        </button>

        {/* Numbered Page Buttons */}
        <div className="flex items-center gap-0.5">
          {pages.map((p, idx) => {
            if (p === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-1.5 py-0.5 text-gray-500 font-mono text-[11px]"
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
                className={`min-w-[24px] h-[22px] px-1 text-[11px] font-mono flex items-center justify-center cursor-pointer transition-none ${
                  isActive
                    ? 'retro-btn-pressed bg-[#000080] text-white font-bold'
                    : 'retro-btn hover:bg-gray-100 text-gray-800'
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
          className="retro-btn px-2 py-0.5 text-[11px] font-bold text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-0.5 cursor-pointer active:retro-btn-pressed"
          title="Next Page"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
