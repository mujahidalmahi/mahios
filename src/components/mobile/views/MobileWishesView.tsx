'use client';

import React from 'react';
import { Flame, Sparkles, Globe, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { WishItem } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';

interface MobileWishesViewProps {
  wishes: WishItem[];
}

export default function MobileWishesView({ wishes = [] }: MobileWishesViewProps) {
  const { playSound } = useSystemStore();
  const sorted = [...wishes].sort((a, b) => (a.wish_number ?? 0) - (b.wish_number ?? 0));

  const triggerWishConfetti = () => {
    playSound('success');
    confetti({
      particleCount: 75,
      spread: 90,
      origin: { y: 0.65 },
    });
  };

  return (
    <div className="space-y-3 pb-6 flex flex-col min-h-full">
      {/* Header with Make a Wish button */}
      <div className="flex items-center justify-between px-1">
        <div>
          <div className="text-xs font-bold text-slate-700 tracking-wider flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Three Core Wishes ({sorted.length})</span>
          </div>
          <div className="text-[10px] text-slate-500">Universal aspirations for conscious civilization</div>
        </div>

        <button
          type="button"
          onClick={triggerWishConfetti}
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Make a Wish</span>
        </button>
      </div>

      <div className="space-y-3">
        {sorted.map((item, index) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3 relative overflow-hidden"
          >
            <div className="flex items-start gap-3">
              {/* Wish Number badge */}
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-mono font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                #{item.wish_number || index + 1}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h4>
                  {item.category && (
                    <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold shrink-0">
                      {item.category}
                    </span>
                  )}
                </div>

                {item.deep_reason && (
                  <div className="mt-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
                    <span className="font-bold text-amber-900 block text-[10px] uppercase tracking-wider mb-0.5">
                      The Core Intent
                    </span>
                    <p className="font-medium text-slate-800">{item.deep_reason}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2.5 text-[10px] font-mono text-slate-400">
                  {item.impact_scope ? (
                    <span className="flex items-center gap-1.5 text-slate-600 font-sans">
                      <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Scope: {item.impact_scope}</span>
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="text-amber-700 font-bold">★ Eternal Wish</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
