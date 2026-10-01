'use client';

import React, { useState, useMemo } from 'react';
import {
  Star, ChevronLeft, ChevronRight, Bookmark,
  Terminal, Book, Sparkles, MapPin, Coffee, Search
} from 'lucide-react';
import { FavouriteItem } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';

interface MobileFavouritesViewProps {
  favourites: FavouriteItem[];
}

const ITEMS_PER_PAGE = 6;

const CATEGORY_TABS = [
  { id: 'all', label: 'All Favourites', icon: Star },
  { id: 'dev_tools', label: 'Dev Tools', icon: Terminal },
  { id: 'books', label: 'Books', icon: Book },
  { id: 'gear', label: 'Gear & Tech', icon: Sparkles },
  { id: 'cuisine', label: 'Coffee & Food', icon: Coffee },
  { id: 'cities', label: 'Cities', icon: MapPin },
] as const;

export default function MobileFavouritesView({ favourites = [] }: MobileFavouritesViewProps) {
  const { playSound } = useSystemStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'dev_tools':
        return <Terminal className="w-3.5 h-3.5 text-blue-600" />;
      case 'books':
        return <Book className="w-3.5 h-3.5 text-amber-600" />;
      case 'gear':
        return <Sparkles className="w-3.5 h-3.5 text-purple-600" />;
      case 'cities':
        return <MapPin className="w-3.5 h-3.5 text-rose-600" />;
      case 'cuisine':
        return <Coffee className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Star className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  const filteredItems = useMemo(() => {
    let list = favourites;
    if (activeTab !== 'all') {
      list = list.filter((f) => f.category?.toLowerCase() === activeTab.toLowerCase());
    }

    const q = searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (f) =>
          f.item_name.toLowerCase().includes(q) ||
          (f.subcategory && f.subcategory.toLowerCase().includes(q)) ||
          (f.reason && f.reason.toLowerCase().includes(q))
      );
    }

    return list;
  }, [favourites, activeTab, searchQuery]);

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
      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORY_TABS.map((tab) => {
          const isSelected = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                playSound('click');
                setActiveTab(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer border flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search tools, coffee, books, tech gear..."
          className="w-full pl-8.5 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 shadow-2xs transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setCurrentPage(1);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-400 hover:text-slate-600 px-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* Favourites Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 space-y-2">
          <Star className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-600 font-medium">No favourites found matching your filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {paginatedItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                      {getCategoryIcon(item.category || '')}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">{item.item_name}</h4>
                      {item.subcategory && (
                        <div className="text-[11px] text-slate-500 font-medium mt-0.5">{item.subcategory}</div>
                      )}
                    </div>
                  </div>

                  {item.rating && (
                    <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{item.rating}/10</span>
                    </div>
                  )}
                </div>

                {item.reason && (
                  <p className="text-xs text-slate-600 leading-relaxed font-sans pt-1 border-t border-slate-100">
                    {item.reason}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mobile Pagination */}
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
