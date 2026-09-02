'use client';

import React from 'react';
import { Flame, Sparkles, Heart, Globe, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { WishItem } from '@/types/database';

interface WishesAppProps {
  wishes: WishItem[];
}

export default function WishesApp({ wishes }: WishesAppProps) {
  const triggerWishConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="p-4 sm:p-5 space-y-4 max-w-full text-black font-sans">
      {/* Header */}
      <div className="p-3 bg-[#e4e4e4] retro-box-outset rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 retro-box-inset bg-amber-600 text-white flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <span>3_Wishes.jar — Three Profound Wishes for Humanity</span>
              <span className="px-1.5 py-0.5 bg-amber-500 text-black text-[9px] font-bold rounded-2xs">
                ★ 3
              </span>
            </h2>
            <p className="text-[11px] text-gray-600">
              If granted three universal wishes by an omnipotent intelligence, these would be my choices.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={triggerWishConfetti}
          className="px-3 py-1 bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 rounded-2xs font-bold text-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Make a Wish</span>
        </button>
      </div>

      {/* 3 Wishes Cards */}
      <div className="space-y-4">
        {wishes.map((wish) => (
          <div
            key={wish.id}
            className="p-4 bg-[#f9fafb] retro-box-inset rounded-xs space-y-3 relative overflow-hidden"
          >
            <div className="flex items-start gap-3">
              {/* Number Badge */}
              <div className="w-10 h-10 rounded-2xs bg-amber-500 text-black font-black text-lg flex items-center justify-center shrink-0 retro-box-outset">
                #{wish.wish_number}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">
                    {wish.title}
                  </h3>
                  <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded-2xs border border-amber-200 font-semibold">
                    {wish.category}
                  </span>
                </div>

                <div className="mt-2 p-3 bg-white retro-box-inset rounded-2xs text-xs text-gray-800 leading-relaxed space-y-1">
                  <p className="font-medium">
                    <strong className="text-amber-900">The Core Intent: </strong>
                    {wish.deep_reason}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 text-[10px] font-mono text-gray-500">
                  <span className="flex items-center gap-1 text-gray-700">
                    <Globe className="w-3.5 h-3.5 text-blue-700" />
                    <span>Civilizational Scope: {wish.impact_scope}</span>
                  </span>
                  <span className="text-amber-800 font-bold">★ Eternal Wish</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
