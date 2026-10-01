'use client';

import React, { useState, useMemo } from 'react';
import { Compass, Quote, Code2, Zap, Sparkles, BookOpen, Layers } from 'lucide-react';
import { PhilosophyItem } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';

interface MobilePhilosophyViewProps {
  philosophies: PhilosophyItem[];
}

export default function MobilePhilosophyView({ philosophies = [] }: MobilePhilosophyViewProps) {
  const { playSound } = useSystemStore();
  const [filter, setFilter] = useState<string>('all');

  // Dynamically extract categories from all philosophies so custom admin categories render
  const categories = useMemo(() => {
    const cats = new Set<string>();
    philosophies.forEach((p) => {
      if (p.category) cats.add(p.category.toLowerCase().trim());
    });
    return ['all', ...Array.from(cats)];
  }, [philosophies]);

  const getIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'engineering':
        return <Code2 className="w-4 h-4 text-blue-600" />;
      case 'design':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'life':
        return <Compass className="w-4 h-4 text-purple-600" />;
      case 'existential':
        return <BookOpen className="w-4 h-4 text-indigo-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
    }
  };

  const filtered = useMemo(() => {
    const sorted = [...philosophies].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    if (filter === 'all') return sorted;
    return sorted.filter((p) => (p.category || '').toLowerCase().trim() === filter);
  }, [philosophies, filter]);

  return (
    <div className="space-y-3 pb-8 flex flex-col min-h-full font-sans">
      {/* Category Pills (Dynamic from Database) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
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

      <div className="flex items-center justify-between px-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
        <span>Axioms & Mental Models ({filtered.length})</span>
        <span className="text-[10px] font-mono text-blue-600 lowercase">{filter !== 'all' ? filter : 'all domains'}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-2">
          <Compass className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-600 font-medium">No philosophical axioms found</p>
          <p className="text-[11px] text-slate-400">Add or edit principles in the Admin Dashboard</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-2.5 hover:border-blue-400 transition-all"
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                    {getIcon(item.category)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-slate-900 leading-snug truncate">{item.title}</h3>
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                      {item.category}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                  #{item.sort_order ?? index + 1}
                </span>
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

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Axiom #{item.sort_order ?? index + 1}</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active Model
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
