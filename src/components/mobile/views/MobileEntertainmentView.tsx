'use client';

import React, { useState, useMemo } from 'react';
import {
  Gamepad2, Film, Tv, Book, Star, Quote,
  ChevronLeft, ChevronRight, Sparkles, Search
} from 'lucide-react';
import { EntertainmentItem } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';

interface MobileEntertainmentViewProps {
  entertainment: EntertainmentItem[];
}

const ITEMS_PER_PAGE = 6;

export default function MobileEntertainmentView({ entertainment = [] }: MobileEntertainmentViewProps) {
  const { playSound } = useSystemStore();
  const [filter, setFilter] = useState<'all' | 'game' | 'movie' | 'series' | 'book'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const getIcon = (type: string) => {
    switch (type) {
      case 'game':
        return <Gamepad2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'movie':
        return <Film className="w-3.5 h-3.5 text-rose-600" />;
      case 'series':
      case 'anime':
        return <Tv className="w-3.5 h-3.5 text-purple-600" />;
      case 'book':
        return <Book className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-blue-600" />;
    }
  };

  const filteredItems = useMemo(() => {
    let list = entertainment;
    if (filter !== 'all') {
      list = list.filter((e) => {
        if (filter === 'series') return e.type === 'series' || e.type === 'anime';
        return e.type === filter;
      });
    }

    const q = searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          (e.creator && e.creator.toLowerCase().includes(q)) ||
          (e.review_summary && e.review_summary.toLowerCase().includes(q)) ||
          (e.favorite_quote && e.favorite_quote.toLowerCase().includes(q))
      );
    }

    return list;
  }, [entertainment, filter, searchQuery]);

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
      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {(['all', 'game', 'movie', 'series', 'book'] as const).map((t) => {
          const isSelected = filter === t;
          const label =
            t === 'all'
              ? 'All Media'
              : t === 'series'
              ? 'Series'
              : t === 'game'
              ? 'Games'
              : t === 'movie'
              ? 'Movies'
              : 'Books';

          return (
            <button
              key={t}
              type="button"
              onClick={() => {
                playSound('click');
                setFilter(t);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer border ${
                isSelected
                  ? 'bg-fuchsia-600 text-white border-fuchsia-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {label}
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
          placeholder="Search games, cinema, literature..."
          className="w-full pl-8.5 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-400 shadow-2xs transition-all"
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
        <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 space-y-2">
          <Gamepad2 className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-600 font-medium">No media found matching your filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {paginatedItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                      {getIcon(item.type || '')}
                    </div>
                    <div>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                        {item.type || 'Media'}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-1 leading-snug">{item.title}</h4>
                      {item.creator && (
                        <div className="text-[11px] text-slate-500 font-medium">by {item.creator}</div>
                      )}
                    </div>
                  </div>

                  {item.rating_score && (
                    <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{item.rating_score}/10</span>
                    </div>
                  )}
                </div>

                {item.cover_url && (
                  <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img
                      src={item.cover_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {item.review_summary && (
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    {item.review_summary}
                  </p>
                )}
              </div>

              {item.favorite_quote && (
                <div className="text-[11px] italic text-slate-600 border-l-2 border-fuchsia-400 pl-2.5 py-0.5 bg-fuchsia-50/50 rounded-r-lg font-serif">
                  &ldquo;{item.favorite_quote}&rdquo;
                </div>
              )}
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
