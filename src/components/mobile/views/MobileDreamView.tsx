'use client';

import React, { useState, useMemo } from 'react';
import { Sparkles, Globe, Rocket, Compass, Star } from 'lucide-react';
import { DreamItem } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';

interface MobileDreamViewProps {
  dreams: DreamItem[];
}

export default function MobileDreamView({ dreams = [] }: MobileDreamViewProps) {
  const { playSound } = useSystemStore();
  const [filterHorizon, setFilterHorizon] = useState<string>('all');

  const horizons = useMemo(() => {
    const list = new Set<string>();
    dreams.forEach((d) => {
      if (d.horizon) list.add(d.horizon.toLowerCase().trim());
    });
    return ['all', ...Array.from(list)];
  }, [dreams]);

  const sorted = useMemo(() => {
    let list = [...dreams].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    if (filterHorizon !== 'all') {
      list = list.filter((d) => (d.horizon || '').toLowerCase().trim() === filterHorizon);
    }
    return list;
  }, [dreams, filterHorizon]);

  const getHorizonBadge = (horizon: string) => {
    switch (horizon?.toLowerCase()) {
      case 'decade':
        return (
          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold font-mono rounded-lg">
            10-YEAR HORIZON
          </span>
        );
      case 'lifetime':
        return (
          <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold font-mono rounded-lg">
            LIFETIME HORIZON
          </span>
        );
      case 'civilizational':
        return (
          <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold font-mono rounded-lg">
            CIVILIZATIONAL HORIZON
          </span>
        );
      default:
        return horizon ? (
          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold font-mono rounded-lg uppercase">
            {horizon}
          </span>
        ) : null;
    }
  };

  return (
    <div className="space-y-3 pb-8 flex flex-col min-h-full font-sans">
      {/* Horizon Filter Tabs */}
      {horizons.length > 2 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {horizons.map((h) => {
            const isSelected = filterHorizon === h;
            return (
              <button
                key={h}
                type="button"
                onClick={() => {
                  playSound('click');
                  setFilterHorizon(h);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {h === 'all' ? 'All Horizons' : h.toUpperCase()}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between px-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
        <span>Dreamscape & Grand Ambitions ({sorted.length})</span>
        <span className="text-[10px] font-mono text-indigo-600">Vision Manifestos</span>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-2">
          <Rocket className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-600 font-medium">No vision manifestos found</p>
          <p className="text-[11px] text-slate-400">Add long-term dreams in the Admin Dashboard</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3 hover:border-indigo-300 transition-all"
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100 shadow-2xs">
                    <Rocket className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 leading-snug">{item.title}</h4>
                </div>

                {getHorizonBadge(item.horizon)}
              </div>

              {item.vision_manifesto && (
                <div className="p-3.5 bg-indigo-50/70 border-l-4 border-l-indigo-600 rounded-r-xl text-xs text-indigo-950 leading-relaxed font-medium">
                  &ldquo;{item.vision_manifesto}&rdquo;
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                {item.impact_area ? (
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <Globe className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Sphere: {item.impact_area}</span>
                  </span>
                ) : (
                  <span className="text-slate-400">Dream #{item.sort_order ?? index + 1}</span>
                )}
                <span className="text-indigo-700 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  Active Vision
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
