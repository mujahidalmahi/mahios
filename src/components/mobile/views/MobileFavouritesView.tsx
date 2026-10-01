'use client';

import React, { useState, useMemo } from 'react';
import { Star, ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';
import { FavouriteItem } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';

interface MobileFavouritesViewProps {
  favourites: FavouriteItem[];
}

const ITEMS_PER_PAGE = 6;

export default function MobileFavouritesView({ favourites = [] }: MobileFavouritesViewProps) {
  const { playSound } = useSystemStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = useMemo(() => {
    const set = new Set<string>();
    favourites.forEach((f) => {
      if (f.category) set.add(f.category);
    });
    return ['All', ...Array.from(set)];
  }, [favourites]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') return favourites;
    return favourites.filter((f) => f.category?.toLowerCase() === selectedCategory.toLowerCase());
  }, [favourites, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const handlePageChange = (page: number) => {
    playSound('click');
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-3 pb-6 flex flex-col min-h-full flex-1">
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              playSound('click');
              setSelectedCategory(cat);
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {paginatedItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold">
                  {item.category || 'Favourite'}
                </span>
                <h4 className="text-xs font-bold text-slate-900 mt-1">{item.item_name}</h4>
                {item.subcategory && (
                  <div className="text-[10px] text-slate-500 font-medium">{item.subcategory}</div>
                )}
              </div>

              {item.rating && (
                <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-600">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <span>{item.rating}/10</span>
                </div>
              )}
            </div>

            {item.reason && (
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {item.reason}
              </p>
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
