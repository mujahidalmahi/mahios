'use client';

import React, { useState } from 'react';
import { Compass, Sparkles, Zap, ShieldCheck, Code2, Quote, BookOpen } from 'lucide-react';
import { PhilosophyItem } from '@/types/database';

interface PhilosophyAppProps {
  philosophies: PhilosophyItem[];
}

export default function PhilosophyApp({ philosophies }: PhilosophyAppProps) {
  const [filter, setFilter] = useState<'all' | 'engineering' | 'design' | 'life' | 'existential'>('all');

  const filtered = filter === 'all'
    ? philosophies
    : philosophies.filter((p) => p.category === filter);

  const getIcon = (category: string) => {
    switch (category) {
      case 'engineering':
        return <Code2 className="w-5 h-5 text-blue-700" />;
      case 'design':
        return <Zap className="w-5 h-5 text-amber-600" />;
      case 'existential':
        return <Compass className="w-5 h-5 text-purple-700" />;
      default:
        return <Sparkles className="w-5 h-5 text-emerald-700" />;
    }
  };

  return (
    <div className="p-4 sm:p-5 space-y-4 max-w-full text-black font-sans">
      {/* Header Banner */}
      <div className="p-3 bg-[#e4e4e4] retro-box-outset rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 retro-box-inset bg-[#000080] text-white flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">
              Philosophy.exe — Guiding Mental Models & Axioms
            </h2>
            <p className="text-[11px] text-gray-600">
              Core operating principles for engineering, software craft, and living deliberately.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono bg-white px-2 py-1 retro-box-inset self-start sm:self-auto">
          {philosophies.length} Axioms Defined
        </span>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pb-1">
        {(['all', 'engineering', 'design', 'life'] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-2xs cursor-pointer transition-all ${
              filter === cat
                ? 'bg-[#000080] text-white retro-box-inset'
                : 'bg-[#d4d0c8] text-gray-800 retro-box-outset hover:bg-[#e4e4e4]'
            }`}
          >
            {cat === 'all' ? 'All Principles' : cat}
          </button>
        ))}
      </div>

      {/* Philosophy Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filtered.map((phil) => (
          <div
            key={phil.id}
            className="p-4 bg-[#f9fafb] retro-box-inset rounded-xs space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2 border-b border-gray-200 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-2xs bg-white retro-box-outset flex items-center justify-center">
                    {getIcon(phil.category)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#000080]">{phil.title}</h3>
                    <span className="text-[9px] font-mono uppercase bg-gray-200 px-1.5 py-0.5 rounded-2xs text-gray-700">
                      {phil.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Axiom Quote */}
              <div className="p-2.5 bg-amber-50/70 border-l-3 border-amber-500 rounded-2xs text-xs font-semibold text-gray-900 italic">
                &ldquo;{phil.axiom}&rdquo;
              </div>

              <p className="text-xs text-gray-700 leading-relaxed">
                {phil.description}
              </p>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] font-mono text-gray-500">
              <span>Axiom #{phil.sort_order}</span>
              <span className="text-emerald-700 font-semibold">● Active Model</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
