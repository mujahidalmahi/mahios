'use client';

import React from 'react';
import { Sparkles, Globe, Rocket } from 'lucide-react';
import { DreamItem } from '@/types/database';

interface MobileDreamViewProps {
  dreams: DreamItem[];
}

export default function MobileDreamView({ dreams = [] }: MobileDreamViewProps) {
  const sorted = [...dreams].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

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
    <div className="space-y-3 pb-6 flex flex-col min-h-full">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
        Dreamscape & Grand Ambitions ({sorted.length})
      </div>

      <div className="space-y-3">
        {sorted.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                  <Rocket className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h4>
              </div>

              {getHorizonBadge(item.horizon)}
            </div>

            {item.vision_manifesto && (
              <div className="p-3 bg-indigo-50/70 border-l-4 border-l-indigo-600 rounded-r-xl text-xs text-indigo-950 leading-relaxed font-medium">
                &ldquo;{item.vision_manifesto}&rdquo;
              </div>
            )}

            <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-slate-500">
              {item.impact_area ? (
                <span className="flex items-center gap-1.5 text-slate-600">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>Sphere: {item.impact_area}</span>
                </span>
              ) : (
                <span />
              )}
              <span className="text-indigo-700 font-bold">★ Active Vision</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
