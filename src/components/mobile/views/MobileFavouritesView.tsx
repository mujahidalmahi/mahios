'use client';

import React, { useState, useMemo } from 'react';
import {
  Star, ChevronLeft, ChevronRight, Bookmark,
  Terminal, Book, Sparkles, MapPin, Coffee, Search, Image as ImageIcon
} from 'lucide-react';
import { FavouriteItem } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';
import MobilePagination from '../MobilePagination';

interface MobileFavouritesViewProps {
  favourites: FavouriteItem[];
}

const ITEMS_PER_PAGE = 6;

export default function MobileFavouritesView({ favourites = [] }: MobileFavouritesViewProps) {
  const { playSound } = useSystemStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Discover categories dynamically from database so any admin category works
  const dynamicCategories = useMemo(() => {
    const cats = new Set<string>();
    favourites.forEach((f) => {
      if (f.category) cats.add(f.category.trim().toLowerCase());
    });
    return ['all', ...Array.from(cats)];
  }, [favourites]);

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

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'all': return 'All Favourites';
      case 'dev_tools': return 'Dev Tools';
      case 'books': return 'Books';
      case 'gear': return 'Gear & Tech';
      case 'cities': return 'Cities';
      case 'cuisine': return 'Coffee & Food';
      default: return cat.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    }
  };

  const filteredItems = useMemo(() => {
    let list = [...favourites].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
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
    <div className="space-y-3 pb-8 flex flex-col min-h-full flex-1 font-sans">
      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {dynamicCategories.map((cat) => {
          const isSelected = activeTab === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => {
                playSound('click');
                setActiveTab(cat);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer border flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {getCategoryIcon(cat)}
              <span>{getCategoryLabel(cat)}</span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search favourites, reasons, brands..."
          className="w-full pl-8.5 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 shadow-2xs transition-all font-medium"
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

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-2">
          <Star className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-600 font-medium">No items found matching your criteria</p>
          <p className="text-[11px] text-slate-400">Add favourites in the Admin Dashboard</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {paginatedItems.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between hover:border-amber-300 transition-all"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                      {getCategoryIcon(item.category || '')}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                          {item.category?.replace('_', ' ')}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">#{item.sort_order ?? index + 1}</span>
                      </div>
                      <h4 className="text-xs font-black text-slate-900 leading-snug mt-1 truncate">{item.item_name}</h4>
                      {item.subcategory && (
                        <div className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">{item.subcategory}</div>
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

                {/* Render uploaded image if present */}
                {item.image_url && (
                  <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
                    <img
                      src={item.image_url}
                      alt={item.item_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {item.reason && (
                  <p className="text-xs text-slate-700 leading-relaxed font-sans pt-1 border-t border-slate-100">
                    {item.reason}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="capitalize">{item.category?.replace('_', ' ')}</span>
                <span className="text-amber-800 font-bold">★ S-Tier Choice</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mobile Pagination */}
      <MobilePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalItems={filteredItems.length}
        itemsPerPage={ITEMS_PER_PAGE}
        itemName="Picks"
      />
    </div>
  );
}
