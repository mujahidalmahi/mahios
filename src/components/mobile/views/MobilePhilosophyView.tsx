'use client';

import React, { useState, useMemo } from 'react';
import { Compass, Quote, Code2, Zap, Sparkles } from 'lucide-react';
import { PhilosophyItem } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';

interface MobilePhilosophyViewProps {
  philosophies: PhilosophyItem[];
}

export default function MobilePhilosophyView({ philosophies = [] }: MobilePhilosophyViewProps) {
  const { playSound } = useSystemStore();
  const [filter, setFilter] = useState<'all' | 'engineering' | 'design' | 'life'>('all');

  const getIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'engineering':
        return <Code2 className="w-4 h-4 text-blue-600" />;
      case 'design':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'life':
        return <Compass className="w-4 h-4 text-purple-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
    }
  };

  const filtered = useMemo(() => {
    const sorted = [...philosophies].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    if (filter === 'all') return sorted;
    return sorted.filter((p) => (p.category || '').toLowerCase() === filter);
  }, [philosophies, filter]);

  return (
    <div className="space-y-3 pb-6 flex flex-col min-h-full">
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {(['all', 'engineering', 'design', 'life'] as const).map((cat) => {
          const isSelected = filter === cat;
          const label = cat === 'all' ? 'All Principles' : cat.charAt(0).toUpperCase() + cat.slice(1);
          return (
            <button
              key={cat}
              type="button"
              onClick={() => {
                playSound('click');
                setFilter(cat);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
        Axioms & Mental Models ({filtered.length})
      </div>

      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                  {getIcon(item.category)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h3>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                    {item.category}
                  </span>
                </div>
              </div>
            </div>

            {item.axiom && (
              <div className="text-xs font-semibold text-slate-800 leading-relaxed italic bg-amber-50/80 p-3 rounded-xl border border-amber-200/70 border-l-4 border-l-amber-500 font-serif">
                &ldquo;{item.axiom}&rdquo;
              </div>
            )}

            {item.description && (
              <p className="text-xs text-slate-600 leading-relaxed font-sans pt-0.5">
                {item.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
