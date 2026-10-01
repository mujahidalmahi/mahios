'use client';

import React, { useState, useMemo } from 'react';
import { Gamepad2, ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { EntertainmentItem } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';

interface MobileEntertainmentViewProps {
  entertainment: EntertainmentItem[];
}

const ITEMS_PER_PAGE = 6;

export default function MobileEntertainmentView({ entertainment = [] }: MobileEntertainmentViewProps) {
  const { playSound } = useSystemStore();
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(entertainment.length / ITEMS_PER_PAGE));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return entertainment.slice(start, start + ITEMS_PER_PAGE);
  }, [entertainment, currentPage]);

  const handlePageChange = (page: number) => {
    playSound('click');
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-3 pb-6 flex flex-col min-h-full flex-1">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
        Games & Media Archive ({entertainment.length})
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {paginatedItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="px-2 py-0.5 rounded-full bg-fuchsia-50 text-fuchsia-700 text-[10px] font-bold">
                  {item.type || 'Media'}
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1">{item.title}</h4>
                {item.creator && (
                  <div className="text-[11px] text-slate-500 font-medium">by {item.creator}</div>
                )}
              </div>

              {item.rating_score && (
                <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <span>{item.rating_score} / 10</span>
                </div>
              )}
            </div>

            {item.review_summary && (
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {item.review_summary}
              </p>
            )}

            {item.favorite_quote && (
              <div className="text-[11px] italic text-slate-500 border-l-2 border-fuchsia-400 pl-2">
                &ldquo;{item.favorite_quote}&rdquo;
              </div>
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-200 shrink-0">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-3 py-1.5 bg-slate-100 disabled:opacity-40 text-slate-800 rounded-lg text-xs font-bold border border-slate-300 flex items-center gap-1 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>

          <span className="text-xs font-mono font-bold text-slate-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-3 py-1.5 bg-slate-100 disabled:opacity-40 text-slate-800 rounded-lg text-xs font-bold border border-slate-300 flex items-center gap-1 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
