'use client';

import React, { useState } from 'react';
import { Gamepad2, Film, Tv, Book, Star, Sparkles, Volume2, Quote } from 'lucide-react';
import { EntertainmentItem } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';

interface EntertainmentAppProps {
  entertainment: EntertainmentItem[];
}

export default function EntertainmentApp({ entertainment }: EntertainmentAppProps) {
  const [filter, setFilter] = useState<'all' | 'game' | 'movie' | 'anime' | 'book'>('all');
  const { playSound } = useSystemStore();

  const filtered = filter === 'all'
    ? entertainment
    : entertainment.filter((e) => e.type === filter);

  const getIcon = (type: string) => {
    switch (type) {
      case 'game':
        return <Gamepad2 className="w-4 h-4 text-emerald-700" />;
      case 'movie':
        return <Film className="w-4 h-4 text-rose-700" />;
      case 'anime':
        return <Tv className="w-4 h-4 text-purple-700" />;
      case 'book':
        return <Book className="w-4 h-4 text-amber-700" />;
      default:
        return <Sparkles className="w-4 h-4 text-blue-700" />;
    }
  };

  const handleSound = () => {
    playSound('click');
  };

  return (
    <div className="p-4 sm:p-5 space-y-4 max-w-full text-black font-sans">
      {/* Header */}
      <div className="p-3 bg-[#e4e4e4] retro-box-outset rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 retro-box-inset bg-[#000080] text-white flex items-center justify-center shrink-0">
            <Gamepad2 className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <span>Media_Center.exe — Games, Sci-Fi & Creative Media</span>
              <span className="px-1.5 py-0.5 bg-amber-400 text-black text-[9px] font-bold rounded-2xs">
                FUN
              </span>
            </h2>
            <p className="text-[11px] text-gray-600">
              Curated masterworks in interactive gaming, cinema, literature, and animation.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSound}
          className="px-2.5 py-1 bg-[#d4d0c8] hover:bg-[#e4e4e4] retro-box-outset rounded-2xs text-[10px] font-bold flex items-center gap-1 cursor-pointer self-start sm:self-auto"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>8-Bit Beep</span>
        </button>
      </div>

      {/* Type Filters */}
      <div className="flex flex-wrap items-center gap-1.5 pb-1">
        {(['all', 'game', 'movie', 'anime', 'book'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFilter(t)}
            className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-2xs cursor-pointer transition-all ${
              filter === t
                ? 'bg-[#000080] text-white retro-box-inset'
                : 'bg-[#d4d0c8] text-gray-800 retro-box-outset hover:bg-[#e4e4e4]'
            }`}
          >
            {t === 'all' ? 'All Media' : `${t}s`}
          </button>
        ))}
      </div>

      {/* Grid of Entertainment Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-[#f9fafb] retro-box-inset rounded-xs flex flex-col justify-between gap-3"
          >
            <div className="space-y-2.5">
              <div className="flex items-start gap-3">
                {/* Cover thumbnail */}
                <div className="w-14 h-16 bg-gray-200 retro-box-inset shrink-0 overflow-hidden rounded-2xs">
                  {item.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {getIcon(item.type)}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-mono bg-gray-200 px-1.5 py-0.5 rounded-2xs font-bold text-gray-700">
                      {item.type}
                    </span>
                    <div className="flex items-center gap-0.5 text-amber-600 text-xs font-bold font-mono">
                      <Star className="w-3 h-3 fill-amber-500" />
                      <span>{item.rating_score}/10</span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 mt-0.5 truncate">{item.title}</h3>
                  <p className="text-[11px] text-gray-600 truncate">{item.creator}</p>
                </div>
              </div>

              <p className="text-xs text-gray-700 leading-relaxed">
                {item.review_summary}
              </p>

              {item.favorite_quote && (
                <div className="p-2 bg-amber-50/70 border-l-2 border-amber-500 rounded-2xs text-[11px] italic text-gray-800">
                  {item.favorite_quote}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] font-mono text-gray-500">
              <span>MASTERWORK #{item.sort_order}</span>
              <span className="text-blue-800 font-semibold">★ Essential</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
