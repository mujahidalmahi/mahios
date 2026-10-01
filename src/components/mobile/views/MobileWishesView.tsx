'use client';

import React from 'react';
import { Flame } from 'lucide-react';
import { WishItem } from '@/types/database';

interface MobileWishesViewProps {
  wishes: WishItem[];
}

export default function MobileWishesView({ wishes = [] }: MobileWishesViewProps) {
  const sorted = [...wishes].sort((a, b) => (a.wish_number ?? 0) - (b.wish_number ?? 0));

  return (
    <div className="space-y-3 pb-6">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
        Three Core Wishes ({sorted.length})
      </div>

      <div className="space-y-3">
        {sorted.map((item, index) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2 relative overflow-hidden"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-mono font-black text-xs flex items-center justify-center shrink-0">
                #{item.wish_number || index + 1}
              </span>
              <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
            </div>

            {item.deep_reason && (
              <p className="text-xs text-slate-600 leading-relaxed">
                {item.deep_reason}
              </p>
            )}

            {item.impact_scope && (
              <div className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full inline-block">
                Scope: {item.impact_scope}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
