'use client';

import React from 'react';
import { Flame, Sparkles, Heart, Globe, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { WishItem } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';

interface WishesAppProps {
  wishes: WishItem[];
}

export default function WishesApp({ wishes }: WishesAppProps) {
  const { playSound } = useSystemStore();

  const triggerWishConfetti = () => {
    playSound('success');
    confetti({
      particleCount: 90,
      spread: 100,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="p-4 sm:p-5 space-y-4 max-w-full text-black font-sans">
      {/* Header */}
      <div className="p-3 bg-[#e4e4e4] retro-box-outset rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 retro-box-outset bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Flame className="w-6 h-6 fill-amber-100 text-white drop-shadow-xs" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#000080] truncate">
              3_Wishes.jar — Three Profound Wishes for Humanity
            </h2>
            <p className="text-[11px] text-gray-600 mt-0.5">
              If granted three universal wishes by an omnipotent intelligence, these would be my choices.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <div className="px-2.5 py-1 bg-white retro-box-inset text-[11px] font-mono text-gray-700 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span><strong>{wishes.length}</strong> Enacted Wishes</span>
          </div>

          <button
            type="button"
            onClick={triggerWishConfetti}
            className="retro-btn px-3 py-1 text-xs font-bold text-[#000080] flex items-center gap-1.5 cursor-pointer hover:bg-gray-100 active:retro-btn-pressed select-none"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Make a Wish</span>
          </button>
        </div>
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
              <div className="w-10 h-10 rounded-2xs bg-[#000080] text-white font-mono font-black text-base flex items-center justify-center shrink-0 retro-box-outset">
                #{wish.wish_number}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">
                    {wish.title}
                  </h3>
                  <span className="text-[10px] font-mono uppercase bg-[#e5e7eb] px-2 py-0.5 rounded-2xs retro-box-inset font-bold text-gray-700">
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
