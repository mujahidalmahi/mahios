'use client';

import React, { useState } from 'react';
import { Star, Heart, Terminal, Book, Coffee, MapPin, Sparkles, Award } from 'lucide-react';
import { FavouriteItem } from '@/types/database';

interface FavouritesAppProps {
  favourites: FavouriteItem[];
}

export default function FavouritesApp({ favourites }: FavouritesAppProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'dev_tools' | 'books' | 'gear' | 'cities' | 'cuisine'>('all');

  const filtered = activeTab === 'all'
    ? favourites
    : favourites.filter((f) => f.category === activeTab);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'dev_tools':
        return <Terminal className="w-4 h-4 text-blue-700" />;
      case 'books':
        return <Book className="w-4 h-4 text-amber-700" />;
      case 'gear':
        return <Sparkles className="w-4 h-4 text-purple-700" />;
      case 'cities':
        return <MapPin className="w-4 h-4 text-rose-700" />;
      case 'cuisine':
        return <Coffee className="w-4 h-4 text-emerald-700" />;
      default:
        return <Star className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="p-4 sm:p-5 space-y-4 max-w-full text-black font-sans">
      {/* Header */}
      <div className="p-3 bg-[#e4e4e4] retro-box-outset rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 retro-box-inset bg-[#000080] text-white flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 text-amber-300 fill-amber-300" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">
              Favourites.ini — Personal Hall of Fame & Preferences
            </h2>
            <p className="text-[11px] text-gray-600">
              Beloved developer tools, life-altering literature, mechanical keyboards, single-origin coffees, and cities.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono bg-white px-2 py-1 retro-box-inset self-start sm:self-auto">
          {favourites.length} Curated Items
        </span>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 pb-1">
        {([
          { id: 'all', label: 'All Favourites' },
          { id: 'dev_tools', label: 'Dev Tools' },
          { id: 'books', label: 'Books' },
          { id: 'gear', label: 'Gear & CRT' },
          { id: 'cuisine', label: 'Coffee & Food' },
          { id: 'cities', label: 'Cities' },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-2xs cursor-pointer transition-all ${
              activeTab === tab.id
                ? 'bg-[#000080] text-white retro-box-inset'
                : 'bg-[#d4d0c8] text-gray-800 retro-box-outset hover:bg-[#e4e4e4]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid of Favourites */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {filtered.map((fav) => (
          <div
            key={fav.id}
            className="p-4 bg-[#f9fafb] retro-box-inset rounded-xs flex flex-col justify-between gap-3"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2 border-b border-gray-200 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-2xs bg-white retro-box-outset flex items-center justify-center">
                    {getCategoryIcon(fav.category)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{fav.item_name}</h3>
                    <p className="text-[10px] font-mono text-gray-500">{fav.subcategory}</p>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 text-amber-600 text-xs font-bold font-mono bg-amber-50 px-2 py-0.5 rounded-2xs border border-amber-200">
                  <Star className="w-3 h-3 fill-amber-500" />
                  <span>{fav.rating}/10</span>
                </div>
              </div>

              <p className="text-xs text-gray-700 leading-relaxed">
                {fav.reason}
              </p>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] font-mono text-gray-500">
              <span className="uppercase text-gray-600">Category: {fav.category.replace('_', ' ')}</span>
              <span className="text-amber-800 font-bold">★ S-Tier Choice</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
