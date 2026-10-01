'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { DreamItem } from '@/types/database';

interface MobileDreamViewProps {
  dreams: DreamItem[];
}

export default function MobileDreamView({ dreams = [] }: MobileDreamViewProps) {
  const sorted = [...dreams].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    <div className="space-y-3 pb-6">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
        Dreamscape & Future Visions ({sorted.length})
      </div>

      <div className="space-y-2.5">
        {sorted.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-500 shrink-0" />
                <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
              </div>
              {item.horizon && (
                <span className="text-[10px] font-mono font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">
                  {item.horizon}
                </span>
              )}
            </div>

            {item.vision_manifesto && (
              <p className="text-xs text-slate-600 leading-relaxed">
                {item.vision_manifesto}
              </p>
            )}

            {item.impact_area && (
              <div className="text-[10px] font-semibold text-slate-500">
                Impact: {item.impact_area}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
